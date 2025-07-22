"""
Search tools for document retrieval and fallback mechanisms
"""
import re
from typing import List, Dict, Any, Optional
from langchain.schema import Document
from src.vector_store.faiss_manager import VectorStoreManager

class DocumentSearchTool:
    """Tool for searching documents using vector similarity and fallback methods"""
    
    def __init__(self, vector_store_manager: VectorStoreManager):
        self.vector_store_manager = vector_store_manager
    
    def vector_search(
        self, 
        query: str, 
        k: int = 5, 
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search
        
        Args:
            query: Search query
            k: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of search results with metadata
        """
        try:
            docs_with_scores = self.vector_store_manager.similarity_search_with_scores(
                query=query, 
                k=k
            )
            
            results = []
            for doc, score in docs_with_scores:
                if score >= score_threshold:
                    results.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "score": score,
                        "search_method": "vector_similarity"
                    })
            
            return results
            
        except Exception as e:
            print(f"Vector search error: {str(e)}")
            return []
    
    def keyword_search(
        self, 
        query: str, 
        documents: List[Document],
        case_sensitive: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Fallback keyword search for offline functionality
        
        Args:
            query: Search query
            documents: List of documents to search
            case_sensitive: Whether search is case sensitive
            
        Returns:
            List of search results
        """
        results = []
        search_terms = query.split()
        
        for doc in documents:
            content = doc.page_content
            if not case_sensitive:
                content = content.lower()
                search_terms = [term.lower() for term in search_terms]
            
            # Count matches
            matches = 0
            for term in search_terms:
                matches += len(re.findall(re.escape(term), content))
            
            if matches > 0:
                # Calculate simple relevance score
                score = matches / len(search_terms)
                
                results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "score": score,
                    "matches": matches,
                    "search_method": "keyword_matching"
                })
        
        # Sort by score (descending)
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return results
    
    def hybrid_search(
        self,
        query: str,
        documents: Optional[List[Document]] = None,
        k: int = 5,
        vector_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Combined vector and keyword search with weighted scoring
        
        Args:
            query: Search query
            documents: Fallback documents for keyword search
            k: Number of results to return
            vector_weight: Weight for vector search scores
            keyword_weight: Weight for keyword search scores
            
        Returns:
            Combined search results
        """
        results_map = {}
        
        # Vector search
        vector_results = self.vector_search(query, k=k*2)  # Get more for diversity
        for result in vector_results:
            chunk_id = result["metadata"].get("chunk_id", "unknown")
            results_map[chunk_id] = result
            results_map[chunk_id]["combined_score"] = result["score"] * vector_weight
        
        # Keyword search (if documents available)
        if documents:
            keyword_results = self.keyword_search(query, documents)
            for result in keyword_results:
                chunk_id = result["metadata"].get("chunk_id", "unknown")
                
                if chunk_id in results_map:
                    # Combine scores
                    results_map[chunk_id]["combined_score"] += result["score"] * keyword_weight
                    results_map[chunk_id]["search_method"] = "hybrid"
                else:
                    # Add new result
                    result["combined_score"] = result["score"] * keyword_weight
                    results_map[chunk_id] = result
        
        # Convert to list and sort by combined score
        final_results = list(results_map.values())
        final_results.sort(key=lambda x: x.get("combined_score", 0), reverse=True)
        
        return final_results[:k]
    
    def extract_context(
        self, 
        query: str, 
        max_context_length: int = 2000
    ) -> str:
        """
        Extract relevant context for AI agent
        
        Args:
            query: User query
            max_context_length: Maximum context length
            
        Returns:
            Formatted context string
        """
        search_results = self.vector_search(query, k=3)
        
        if not search_results:
            return "Tidak ada konteks relevan ditemukan dalam dokumen."
        
        context_parts = []
        current_length = 0
        
        for i, result in enumerate(search_results):
            content = result["content"]
            source = result["metadata"].get("source", "Unknown")
            score = result["score"]
            
            # Format context with metadata
            formatted_content = f"[Sumber: {source}, Relevansi: {score:.2f}]\n{content}\n"
            
            if current_length + len(formatted_content) <= max_context_length:
                context_parts.append(formatted_content)
                current_length += len(formatted_content)
            else:
                # Truncate if needed
                remaining_space = max_context_length - current_length
                if remaining_space > 100:  # Only add if meaningful space left
                    truncated = formatted_content[:remaining_space-10] + "..."
                    context_parts.append(truncated)
                break
        
        return "\n---\n".join(context_parts)


class LocalSearchTool:
    """Offline search tool for non-AI functionality"""
    
    def __init__(self):
        self.stop_words = {
            'dan', 'atau', 'yang', 'untuk', 'dalam', 'pada', 'dengan', 'dari', 'ke', 'di',
            'adalah', 'akan', 'dapat', 'telah', 'sudah', 'masih', 'juga', 'hanya', 'tidak'
        }
    
    def preprocess_query(self, query: str) -> List[str]:
        """
        Preprocess search query
        
        Args:
            query: Raw search query
            
        Returns:
            List of processed search terms
        """
        # Convert to lowercase and split
        terms = query.lower().split()
        
        # Remove stop words and short terms
        filtered_terms = [
            term for term in terms 
            if len(term) > 2 and term not in self.stop_words
        ]
        
        return filtered_terms
    
    def fuzzy_match(self, term: str, text: str, threshold: float = 0.8) -> bool:
        """
        Simple fuzzy matching for search terms
        
        Args:
            term: Search term
            text: Text to search in
            threshold: Similarity threshold
            
        Returns:
            True if fuzzy match found
        """
        # Simple implementation - check for partial matches
        term_lower = term.lower()
        text_lower = text.lower()
        
        # Exact match
        if term_lower in text_lower:
            return True
        
        # Check for partial matches (simple approach)
        if len(term) > 4:
            # Check if 80% of characters match
            matches = sum(1 for char in term_lower if char in text_lower)
            if matches / len(term) >= threshold:
                return True
        
        return False
