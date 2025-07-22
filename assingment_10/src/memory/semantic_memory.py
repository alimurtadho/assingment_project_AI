"""
Semantic memory system for contextual understanding and conversation history
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

class SemanticMemory:
    """Manages conversation context and semantic understanding"""
    
    def __init__(self, max_history: int = 10):
        self.conversation_history: List[Dict[str, Any]] = []
        self.document_context: Dict[str, Any] = {}
        self.user_preferences: Dict[str, Any] = {}
        self.max_history = max_history
    
    def add_interaction(
        self, 
        user_query: str, 
        ai_response: str, 
        context_used: List[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Add interaction to conversation memory
        
        Args:
            user_query: User's question
            ai_response: AI's response
            context_used: List of document contexts used
            metadata: Additional metadata
        """
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "user_query": user_query,
            "ai_response": ai_response,
            "context_used": context_used,
            "metadata": metadata or {}
        }
        
        self.conversation_history.append(interaction)
        
        # Maintain max history limit
        if len(self.conversation_history) > self.max_history:
            self.conversation_history = self.conversation_history[-self.max_history:]
    
    def get_conversation_context(self, last_n: int = 3) -> str:
        """
        Get recent conversation context for AI prompt
        
        Args:
            last_n: Number of recent interactions to include
            
        Returns:
            Formatted conversation context
        """
        if not self.conversation_history:
            return ""
        
        recent_interactions = self.conversation_history[-last_n:]
        context_parts = []
        
        for interaction in recent_interactions:
            context_parts.append(
                f"User: {interaction['user_query']}\n"
                f"Assistant: {interaction['ai_response']}\n"
            )
        
        return "\n---\n".join(context_parts)
    
    def update_document_context(self, document_info: Dict[str, Any]) -> None:
        """
        Update current document context
        
        Args:
            document_info: Information about loaded document
        """
        self.document_context = {
            "document_name": document_info.get("name", "Unknown"),
            "document_type": document_info.get("type", "PDF"),
            "total_chunks": document_info.get("chunks", 0),
            "upload_time": datetime.now().isoformat(),
            "metadata": document_info.get("metadata", {})
        }
    
    def get_document_context(self) -> str:
        """
        Get current document context for AI prompt
        
        Returns:
            Formatted document context
        """
        if not self.document_context:
            return "Tidak ada dokumen yang sedang dimuat."
        
        return (
            f"Dokumen saat ini: {self.document_context['document_name']}\n"
            f"Jumlah chunk: {self.document_context['total_chunks']}\n"
            f"Dimuat pada: {self.document_context['upload_time']}\n"
        )
    
    def extract_intent(self, query: str) -> Dict[str, Any]:
        """
        Extract user intent from query
        
        Args:
            query: User query
            
        Returns:
            Intent analysis
        """
        query_lower = query.lower()
        
        # Define intent patterns
        intent_patterns = {
            "search": ["cari", "temukan", "dimana", "bagaimana cara", "apa itu"],
            "summary": ["ringkas", "rangkum", "jelaskan secara singkat", "kesimpulan"],
            "explanation": ["jelaskan", "mengapa", "bagaimana", "kenapa"],
            "comparison": ["bandingkan", "perbedaan", "sama", "berbeda"],
            "definition": ["apa pengertian", "definisi", "artinya", "maksudnya"],
            "example": ["contoh", "misalnya", "ilustrasi", "sampel"]
        }
        
        detected_intents = []
        for intent, patterns in intent_patterns.items():
            if any(pattern in query_lower for pattern in patterns):
                detected_intents.append(intent)
        
        # Default intent if none detected
        if not detected_intents:
            detected_intents = ["search"]
        
        return {
            "primary_intent": detected_intents[0],
            "all_intents": detected_intents,
            "confidence": 0.8 if len(detected_intents) == 1 else 0.6
        }
    
    def get_personalized_prompt(self, base_prompt: str, user_query: str) -> str:
        """
        Create personalized prompt based on memory
        
        Args:
            base_prompt: Base system prompt
            user_query: Current user query
            
        Returns:
            Enhanced prompt with context
        """
        # Get intent
        intent_info = self.extract_intent(user_query)
        
        # Build enhanced prompt
        enhanced_prompt = base_prompt + "\n\n"
        
        # Add document context
        doc_context = self.get_document_context()
        enhanced_prompt += f"Konteks Dokumen:\n{doc_context}\n\n"
        
        # Add conversation history
        conv_context = self.get_conversation_context(last_n=2)
        if conv_context:
            enhanced_prompt += f"Riwayat Percakapan:\n{conv_context}\n\n"
        
        # Add intent information
        enhanced_prompt += (
            f"Intent yang terdeteksi: {intent_info['primary_intent']}\n"
            f"Konfiden: {intent_info['confidence']}\n\n"
        )
        
        # Add specific instructions based on intent
        intent_instructions = {
            "summary": "Berikan ringkasan yang concise dan terstruktur.",
            "explanation": "Berikan penjelasan yang detail dan mudah dipahami.",
            "comparison": "Fokus pada perbandingan dan perbedaan yang jelas.",
            "definition": "Berikan definisi yang tepat dan contoh jika perlu.",
            "example": "Sertakan contoh konkret dan relevan."
        }
        
        if intent_info['primary_intent'] in intent_instructions:
            enhanced_prompt += f"Instruksi khusus: {intent_instructions[intent_info['primary_intent']]}\n\n"
        
        return enhanced_prompt
    
    def clear_memory(self) -> None:
        """Clear all memory"""
        self.conversation_history.clear()
        self.document_context.clear()
        self.user_preferences.clear()
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """
        Get memory statistics
        
        Returns:
            Memory statistics
        """
        return {
            "conversation_count": len(self.conversation_history),
            "has_document": bool(self.document_context),
            "current_document": self.document_context.get("document_name", "None"),
            "memory_usage": "low"  # Simple classification
        }
    
    def export_memory(self) -> str:
        """
        Export memory as JSON string
        
        Returns:
            JSON string of memory data
        """
        memory_data = {
            "conversation_history": self.conversation_history,
            "document_context": self.document_context,
            "user_preferences": self.user_preferences,
            "export_time": datetime.now().isoformat()
        }
        
        return json.dumps(memory_data, indent=2, ensure_ascii=False)
    
    def import_memory(self, memory_json: str) -> bool:
        """
        Import memory from JSON string
        
        Args:
            memory_json: JSON string of memory data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            memory_data = json.loads(memory_json)
            
            self.conversation_history = memory_data.get("conversation_history", [])
            self.document_context = memory_data.get("document_context", {})
            self.user_preferences = memory_data.get("user_preferences", {})
            
            return True
        except Exception as e:
            print(f"Failed to import memory: {str(e)}")
            return False
