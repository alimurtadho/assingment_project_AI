"""
Vector store manager using FAISS for document embeddings and similarity search
"""
import os
import pickle
from typing import List, Optional, Tuple
import numpy as np
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.schema import Document
from config.config import Config

class VectorStoreManager:
    """Manages FAISS vector store for document embeddings"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=Config.EMBEDDING_MODEL,
            openai_api_key=Config.OPENAI_API_KEY
        )
        self.vector_store: Optional[FAISS] = None
        self.db_path = Config.VECTOR_DB_PATH
        
    def create_vector_store(self, documents: List[Document]) -> FAISS:
        """
        Create new vector store from documents
        
        Args:
            documents: List of Document objects to embed
            
        Returns:
            FAISS vector store
        """
        if not documents:
            raise ValueError("Cannot create vector store with empty document list")
        
        # Create FAISS vector store
        vector_store = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        
        self.vector_store = vector_store
        return vector_store
    
    def add_documents(self, documents: List[Document]) -> None:
        """
        Add documents to existing vector store
        
        Args:
            documents: List of Document objects to add
        """
        if not self.vector_store:
            self.vector_store = self.create_vector_store(documents)
        else:
            self.vector_store.add_documents(documents)
    
    def similarity_search(
        self, 
        query: str, 
        k: int = None, 
        score_threshold: float = None
    ) -> List[Document]:
        """
        Perform similarity search in vector store
        
        Args:
            query: Search query
            k: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of similar documents
        """
        if not self.vector_store:
            return []
        
        k = k or Config.TOP_K_RESULTS
        score_threshold = score_threshold or Config.SIMILARITY_THRESHOLD
        
        # Perform similarity search with scores
        docs_with_scores = self.vector_store.similarity_search_with_score(
            query=query,
            k=k
        )
        
        # Filter by score threshold
        filtered_docs = [
            doc for doc, score in docs_with_scores 
            if score >= score_threshold
        ]
        
        return filtered_docs
    
    def similarity_search_with_scores(
        self, 
        query: str, 
        k: int = None
    ) -> List[Tuple[Document, float]]:
        """
        Perform similarity search and return scores
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of (document, score) tuples
        """
        if not self.vector_store:
            return []
        
        k = k or Config.TOP_K_RESULTS
        
        return self.vector_store.similarity_search_with_score(
            query=query,
            k=k
        )
    
    def save_vector_store(self, filename: str = "faiss_index") -> None:
        """
        Save vector store to disk
        
        Args:
            filename: Name for the saved index files
        """
        if not self.vector_store:
            raise ValueError("No vector store to save")
        
        os.makedirs(self.db_path, exist_ok=True)
        
        # Save FAISS index
        index_path = os.path.join(self.db_path, filename)
        self.vector_store.save_local(index_path)
        
        print(f"Vector store saved to {index_path}")
    
    def load_vector_store(self, filename: str = "faiss_index") -> bool:
        """
        Load vector store from disk
        
        Args:
            filename: Name of the saved index files
            
        Returns:
            True if loaded successfully, False otherwise
        """
        index_path = os.path.join(self.db_path, filename)
        
        try:
            self.vector_store = FAISS.load_local(
                index_path, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print(f"Vector store loaded from {index_path}")
            return True
        except Exception as e:
            print(f"Failed to load vector store: {str(e)}")
            return False
    
    def get_document_count(self) -> int:
        """
        Get number of documents in vector store
        
        Returns:
            Number of documents
        """
        if not self.vector_store:
            return 0
        
        return len(self.vector_store.docstore._dict)
    
    def clear_vector_store(self) -> None:
        """Clear the current vector store"""
        self.vector_store = None
    
    def get_store_info(self) -> dict:
        """
        Get information about the vector store
        
        Returns:
            Dictionary with store statistics
        """
        if not self.vector_store:
            return {"status": "empty", "document_count": 0}
        
        return {
            "status": "active",
            "document_count": self.get_document_count(),
            "embedding_model": Config.EMBEDDING_MODEL,
            "vector_dimension": self.vector_store.index.d if hasattr(self.vector_store, 'index') else "unknown"
        }
