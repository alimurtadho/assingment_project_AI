#!/usr/bin/env python3
"""
AI Document Assistant - Local Version (No API Required)
Versi pencarian lokal tanpa menggunakan OpenAI API.
"""

import os
import sys
import re
import PyPDF2
from typing import List, Tuple

class LocalDocumentSearch:
    def __init__(self):
        """Initialize the Local Document Search"""
        self.document_path = "document/contoh_kebijakan.pdf"
        self.document_text = ""
        self.chunks = []
        
    def load_pdf_document(self):
        """Load PDF document using PyPDF2"""
        try:
            print("🔄 Memuat dokumen PDF...")
            
            # Check if document exists
            if not os.path.exists(self.document_path):
                print(f"❌ ERROR: File {self.document_path} tidak ditemukan!")
                print("💡 Pastikan file PDF ada di folder 'document/'")
                sys.exit(1)
            
            # Load PDF
            with open(self.document_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_content = []
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text_content.append(page.extract_text())
                
                self.document_text = "\n".join(text_content)
            
            print(f"✅ Dokumen berhasil dimuat: {len(pdf_reader.pages)} halaman")
            
            # Split into chunks
            self.create_text_chunks()
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            sys.exit(1)
    
    def create_text_chunks(self):
        """Split document into smaller chunks"""
        # Simple sentence-based chunking
        sentences = re.split(r'[.!?]+', self.document_text)
        
        chunk_size = 3  # 3 sentences per chunk
        self.chunks = []
        
        for i in range(0, len(sentences), chunk_size):
            chunk = ". ".join(sentences[i:i+chunk_size]).strip()
            if chunk and len(chunk) > 10:  # Filter out very short chunks
                self.chunks.append(chunk)
        
        print(f"✅ Dokumen dibagi menjadi {len(self.chunks)} chunk")
    
    def search_in_document(self, query: str, max_results: int = 5) -> List[Tuple[str, float]]:
        """Search for relevant text chunks based on keyword matching"""
        query_words = set(query.lower().split())
        results = []
        
        for chunk in self.chunks:
            chunk_words = set(chunk.lower().split())
            
            # Calculate simple word overlap score
            common_words = query_words.intersection(chunk_words)
            if common_words:
                score = len(common_words) / len(query_words)
                results.append((chunk, score))
        
        # Sort by relevance score (descending)
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Return top results
        return results[:max_results]
    
    def ask_question(self, question: str):
        """Answer question based on document content"""
        print("🔍 Mencari dalam dokumen...")
        
        # Search for relevant chunks
        relevant_chunks = self.search_in_document(question)
        
        if not relevant_chunks:
            print("❌ Tidak ditemukan informasi yang relevan dalam dokumen.")
            print("💡 Coba gunakan kata kunci yang berbeda.")
            return
        
        print(f"\n📋 Ditemukan {len(relevant_chunks)} hasil yang relevan:")
        
        for i, (chunk, score) in enumerate(relevant_chunks, 1):
            # Clean up the chunk text
            clean_chunk = re.sub(r'\s+', ' ', chunk).strip()
            if clean_chunk:
                print(f"\n{i}. {clean_chunk}")
    
    def run_interactive_mode(self):
        """Run interactive Q&A mode"""
        print("\n🤖 Simple Document Search Ready!")
        print(f"📄 Document: {os.path.basename(self.document_path)}")
        print("ℹ️  Mode: Local text search (no AI)")
        print("💡 Tip: Type 'quit' or 'exit' to stop")
        print("=" * 50)
        
        while True:
            try:
                question = input("\n❓ Masukkan pertanyaanmu: ").strip()
                
                if question.lower() in ['quit', 'exit', 'keluar']:
                    print("👋 Terima kasih! Sampai jumpa!")
                    break
                
                if not question:
                    print("⚠️  Silakan masukkan pertanyaan yang valid")
                    continue
                
                # Search in document
                self.ask_question(question)
                
            except KeyboardInterrupt:
                print("\n\n👋 Program dihentikan. Sampai jumpa!")
                break
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")

def main():
    """Main function"""
    print("🚀 Starting Local Document Search...")
    
    # Initialize search engine
    search_engine = LocalDocumentSearch()
    
    # Load document
    search_engine.load_pdf_document()
    
    # Run interactive mode
    search_engine.run_interactive_mode()

if __name__ == "__main__":
    main()
