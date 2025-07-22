"""
AI Agent implementation for document Q&A using the Observe → Decide → Act pattern
"""
from typing import List, Dict, Any, Optional
import openai
from config.config import Config
from src.memory.semantic_memory import SemanticMemory
from src.tools.search_tools import DocumentSearchTool
from src.vector_store.faiss_manager import VectorStoreManager

class DocumentQAAgent:
    """AI Agent for document question answering with semantic memory"""
    
    def __init__(self):
        # Initialize OpenAI client
        openai.api_key = Config.OPENAI_API_KEY
        
        # Initialize components
        self.vector_store_manager = VectorStoreManager()
        self.search_tool = DocumentSearchTool(self.vector_store_manager)
        self.memory = SemanticMemory()
        
        # Agent state
        self.is_initialized = False
        self.current_documents = []
        
        # System prompt
        self.system_prompt = """
Anda adalah AI Document Assistant yang cerdas dan membantu. Tugas Anda adalah menjawab pertanyaan berdasarkan dokumen yang telah dimuat.

ATURAN UTAMA:
1. Selalu berikan jawaban berdasarkan konteks dokumen yang tersedia
2. Jika informasi tidak ada dalam dokumen, katakan dengan jelas
3. Berikan jawaban dalam bahasa Indonesia yang natural dan mudah dipahami
4. Sertakan referensi sumber jika relevan
5. Jika pertanyaan tidak jelas, minta klarifikasi

FORMAT JAWABAN:
- Jawaban langsung dan relevan
- Gunakan contoh dari dokumen jika ada
- Berikan informasi tambahan yang berguna
- Akhiri dengan tanya apakah perlu penjelasan lebih lanjut

GAYA KOMUNIKASI:
- Ramah dan profesional
- Gunakan bahasa yang mudah dipahami
- Berikan struktur yang jelas dalam jawaban panjang
- Hindari jargon teknis yang tidak perlu
"""
    
    def observe(self, user_query: str) -> Dict[str, Any]:
        """
        OBSERVE: Analyze user input and current state
        
        Args:
            user_query: User's question
            
        Returns:
            Observation data
        """
        observation = {
            "user_query": user_query,
            "query_length": len(user_query),
            "intent": self.memory.extract_intent(user_query),
            "has_documents": bool(self.current_documents),
            "vector_store_status": self.vector_store_manager.get_store_info(),
            "memory_stats": self.memory.get_memory_stats()
        }
        
        return observation
    
    def decide(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        DECIDE: Determine the best action based on observation
        
        Args:
            observation: Data from observe phase
            
        Returns:
            Decision data
        """
        user_query = observation["user_query"]
        intent = observation["intent"]
        
        # Decision logic
        decision = {
            "action": "answer_question",
            "search_method": "vector",
            "context_needed": True,
            "fallback_available": bool(self.current_documents)
        }
        
        # Adjust strategy based on intent
        if intent["primary_intent"] == "summary":
            decision["search_method"] = "hybrid"
            decision["k_results"] = 10
        elif intent["primary_intent"] == "definition":
            decision["k_results"] = 3
        else:
            decision["k_results"] = 5
        
        # Check if vector store is available
        if observation["vector_store_status"]["status"] != "active":
            if decision["fallback_available"]:
                decision["search_method"] = "keyword"
            else:
                decision["action"] = "no_documents_error"
        
        return decision
    
    def act(self, observation: Dict[str, Any], decision: Dict[str, Any]) -> str:
        """
        ACT: Execute the decided action
        
        Args:
            observation: Data from observe phase
            decision: Data from decide phase
            
        Returns:
            AI response
        """
        user_query = observation["user_query"]
        
        # Handle no documents case
        if decision["action"] == "no_documents_error":
            return ("Maaf, belum ada dokumen yang dimuat. "
                   "Silakan upload dokumen PDF terlebih dahulu untuk mulai bertanya.")
        
        # Get relevant context
        try:
            if decision["search_method"] == "vector":
                context = self.search_tool.extract_context(user_query)
            elif decision["search_method"] == "hybrid":
                search_results = self.search_tool.hybrid_search(
                    query=user_query,
                    documents=self.current_documents,
                    k=decision.get("k_results", 5)
                )
                context = self._format_search_results(search_results)
            else:
                # Keyword fallback
                search_results = self.search_tool.keyword_search(
                    query=user_query,
                    documents=self.current_documents
                )
                context = self._format_search_results(search_results[:5])
        
        except Exception as e:
            context = "Error retrieving context from documents."
            print(f"Context retrieval error: {str(e)}")
        
        # Generate AI response
        try:
            response = self._generate_response(user_query, context, observation["intent"])
            
            # Store interaction in memory
            self.memory.add_interaction(
                user_query=user_query,
                ai_response=response,
                context_used=[context],
                metadata={
                    "intent": observation["intent"],
                    "search_method": decision["search_method"]
                }
            )
            
            return response
            
        except Exception as e:
            error_msg = f"Maaf, terjadi kesalahan saat memproses pertanyaan: {str(e)}"
            print(f"AI response generation error: {str(e)}")
            return error_msg
    
    def process_query(self, user_query: str) -> str:
        """
        Complete agent loop: Observe → Decide → Act
        
        Args:
            user_query: User's question
            
        Returns:
            AI response
        """
        # OBSERVE
        observation = self.observe(user_query)
        
        # DECIDE
        decision = self.decide(observation)
        
        # ACT
        response = self.act(observation, decision)
        
        return response
    
    def _generate_response(
        self, 
        user_query: str, 
        context: str, 
        intent: Dict[str, Any]
    ) -> str:
        """
        Generate AI response using OpenAI
        
        Args:
            user_query: User's question
            context: Document context
            intent: User intent information
            
        Returns:
            AI generated response
        """
        # Create personalized prompt
        enhanced_prompt = self.memory.get_personalized_prompt(
            self.system_prompt, 
            user_query
        )
        
        # Prepare messages
        messages = [
            {"role": "system", "content": enhanced_prompt},
            {"role": "user", "content": f"""
Konteks dari dokumen:
{context}

Pertanyaan: {user_query}

Jawab berdasarkan konteks di atas. Jika informasi tidak tersedia dalam konteks, katakan dengan jelas.
"""}
        ]
        
        # Generate response
        response = openai.ChatCompletion.create(
            model=Config.LLM_MODEL,
            messages=messages,
            max_tokens=Config.MAX_TOKENS,
            temperature=Config.TEMPERATURE
        )
        
        return response.choices[0].message.content.strip()
    
    def _format_search_results(self, search_results: List[Dict[str, Any]]) -> str:
        """
        Format search results into context string
        
        Args:
            search_results: List of search results
            
        Returns:
            Formatted context string
        """
        if not search_results:
            return "Tidak ada konteks relevan ditemukan dalam dokumen."
        
        context_parts = []
        for i, result in enumerate(search_results):
            content = result["content"]
            metadata = result.get("metadata", {})
            score = result.get("score", 0)
            source = metadata.get("source", "Unknown")
            
            formatted_content = f"[Sumber: {source}, Relevansi: {score:.2f}]\n{content}\n"
            context_parts.append(formatted_content)
        
        return "\n---\n".join(context_parts)
    
    def load_documents(self, documents: List[Any]) -> bool:
        """
        Load documents into the agent
        
        Args:
            documents: List of processed documents
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Store documents for fallback
            self.current_documents = documents
            
            # Create/update vector store
            if self.vector_store_manager.vector_store is None:
                self.vector_store_manager.create_vector_store(documents)
            else:
                self.vector_store_manager.add_documents(documents)
            
            # Update memory with document info
            self.memory.update_document_context({
                "name": documents[0].metadata.get("source", "Unknown") if documents else "Multiple",
                "chunks": len(documents),
                "type": "PDF"
            })
            
            self.is_initialized = True
            return True
            
        except Exception as e:
            print(f"Error loading documents: {str(e)}")
            return False
    
    def get_agent_status(self) -> Dict[str, Any]:
        """
        Get current agent status
        
        Returns:
            Agent status information
        """
        return {
            "initialized": self.is_initialized,
            "documents_loaded": len(self.current_documents),
            "vector_store": self.vector_store_manager.get_store_info(),
            "memory": self.memory.get_memory_stats(),
            "last_document": self.memory.document_context.get("document_name", "None")
        }
    
    def clear_agent(self) -> None:
        """Clear agent state and memory"""
        self.current_documents.clear()
        self.vector_store_manager.clear_vector_store()
        self.memory.clear_memory()
        self.is_initialized = False
