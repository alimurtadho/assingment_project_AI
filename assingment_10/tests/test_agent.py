"""
Unit tests for AI Agent
"""
import unittest
from unittest.mock import Mock, patch
from src.agents.document_qa_agent import DocumentQAAgent
from src.memory.semantic_memory import SemanticMemory

class TestDocumentQAAgent(unittest.TestCase):
    
    def setUp(self):
        self.agent = DocumentQAAgent()
    
    def test_observe(self):
        """Test agent observation phase"""
        query = "What is the main topic?"
        
        observation = self.agent.observe(query)
        
        self.assertEqual(observation['user_query'], query)
        self.assertIn('intent', observation)
        self.assertIn('has_documents', observation)
    
    def test_decide(self):
        """Test agent decision phase"""
        observation = {
            'user_query': 'What is AI?',
            'intent': {'primary_intent': 'definition'},
            'has_documents': True,
            'vector_store_status': {'status': 'active'}
        }
        
        decision = self.agent.decide(observation)
        
        self.assertIn('action', decision)
        self.assertIn('search_method', decision)
    
    def test_extract_intent(self):
        """Test intent extraction"""
        memory = SemanticMemory()
        
        # Test search intent
        intent = memory.extract_intent("Cari informasi tentang AI")
        self.assertEqual(intent['primary_intent'], 'search')
        
        # Test summary intent
        intent = memory.extract_intent("Ringkas dokumen ini")
        self.assertEqual(intent['primary_intent'], 'summary')
    
    def test_agent_status(self):
        """Test agent status retrieval"""
        status = self.agent.get_agent_status()
        
        self.assertIn('initialized', status)
        self.assertIn('documents_loaded', status)
        self.assertIn('vector_store', status)

if __name__ == '__main__':
    unittest.main()
