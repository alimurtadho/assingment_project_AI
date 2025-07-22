"""
Unit tests for Document Processor
"""
import unittest
import tempfile
import os
from unittest.mock import Mock, patch
from src.document_processor.pdf_processor import DocumentProcessor

class TestDocumentProcessor(unittest.TestCase):
    
    def setUp(self):
        self.processor = DocumentProcessor()
    
    def test_chunk_text(self):
        """Test text chunking functionality"""
        test_text = "This is a test document. " * 100  # Create long text
        
        documents = self.processor.chunk_text(test_text, source="test.pdf")
        
        self.assertGreater(len(documents), 0)
        self.assertLessEqual(len(documents[0].page_content), 1000)  # Default chunk size
        self.assertEqual(documents[0].metadata['source'], "test.pdf")
    
    def test_validate_pdf_invalid_file(self):
        """Test PDF validation with invalid file"""
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp:
            tmp.write(b"This is not a PDF")
            tmp_path = tmp.name
        
        try:
            result = self.processor.validate_pdf(tmp_path)
            self.assertFalse(result)
        finally:
            os.unlink(tmp_path)
    
    def test_load_pdf_nonexistent_file(self):
        """Test loading non-existent PDF file"""
        with self.assertRaises(Exception):
            self.processor.load_pdf("nonexistent.pdf")

if __name__ == '__main__':
    unittest.main()
