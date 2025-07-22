"""
Document processor for handling PDF files and text chunking
"""
import os
import hashlib
from typing import List, Optional
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from config.config import Config

class DocumentProcessor:
    """Handles PDF document loading and text chunking"""
    
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def load_pdf(self, file_path: str) -> str:
        """
        Load and extract text from PDF file
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text content
            
        Raises:
            Exception: If PDF cannot be read
        """
        try:
            reader = PdfReader(file_path)
            text = ""
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            
            if not text.strip():
                raise Exception("No text could be extracted from PDF")
                
            return text
            
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")
    
    def chunk_text(self, text: str, source: str = "") -> List[Document]:
        """
        Split text into chunks for vector storage
        
        Args:
            text: Text content to chunk
            source: Source document identifier
            
        Returns:
            List of Document objects with chunked text
        """
        chunks = self.text_splitter.split_text(text)
        
        documents = []
        for i, chunk in enumerate(chunks):
            # Create document hash for uniqueness
            chunk_hash = hashlib.md5(chunk.encode()).hexdigest()[:8]
            
            doc = Document(
                page_content=chunk,
                metadata={
                    "source": source,
                    "chunk_id": f"{source}_{i}_{chunk_hash}",
                    "chunk_index": i,
                    "chunk_size": len(chunk)
                }
            )
            documents.append(doc)
        
        return documents
    
    def process_pdf(self, file_path: str) -> List[Document]:
        """
        Complete PDF processing pipeline
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            List of processed Document objects
        """
        # Extract filename for metadata
        filename = os.path.basename(file_path)
        
        # Load PDF content
        text = self.load_pdf(file_path)
        
        # Chunk the text
        documents = self.chunk_text(text, source=filename)
        
        return documents
    
    def process_uploaded_file(self, uploaded_file) -> List[Document]:
        """
        Process uploaded file from Streamlit
        
        Args:
            uploaded_file: Streamlit uploaded file object
            
        Returns:
            List of processed Document objects
        """
        # Save uploaded file temporarily
        temp_path = os.path.join(Config.DOCUMENTS_PATH, uploaded_file.name)
        
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        try:
            # Process the PDF
            documents = self.process_pdf(temp_path)
            return documents
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    def validate_pdf(self, file_path: str) -> bool:
        """
        Validate if file is a readable PDF
        
        Args:
            file_path: Path to file
            
        Returns:
            True if valid PDF, False otherwise
        """
        try:
            reader = PdfReader(file_path)
            # Try to read first page
            if len(reader.pages) > 0:
                reader.pages[0].extract_text()
            return True
        except:
            return False
