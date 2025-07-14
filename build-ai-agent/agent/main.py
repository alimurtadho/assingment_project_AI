#!/usr/bin/env python3
"""
AI Document Assistant - Main Script dengan OpenAI API
Sistem AI untuk melakukan tanya jawab dengan dokumen PDF menggunakan LangChain dan OpenAI API.
"""

import os
import sys
from dotenv import load_dotenv
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

class DocumentAssistant:
    def __init__(self):
        """Initialize the Document Assistant"""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.document_path = "document/contoh_kebijakan.pdf"
        self.vector_store = None
        self.qa_chain = None
        
        # Check if API key is set
        if not self.openai_api_key:
            print("❌ ERROR: OPENAI_API_KEY tidak ditemukan!")
            print("💡 Silakan:")
            print("   1. Buat file .env di root directory")
            print("   2. Tambahkan: OPENAI_API_KEY='your-api-key-here'")
            print("   3. Atau gunakan alternatif: python3 agent/main_local.py")
            sys.exit(1)
            
        # Set OpenAI API key
        os.environ["OPENAI_API_KEY"] = self.openai_api_key
        
    def load_and_process_document(self):
        """Load PDF document and create vector store"""
        try:
            print("🔄 Memuat dokumen PDF...")
            
            # Check if document exists
            if not os.path.exists(self.document_path):
                print(f"❌ ERROR: File {self.document_path} tidak ditemukan!")
                print("💡 Pastikan file PDF ada di folder 'document/'")
                sys.exit(1)
            
            # Load PDF
            loader = PyPDFLoader(self.document_path)
            documents = loader.load()
            
            print(f"✅ Dokumen berhasil dimuat: {len(documents)} halaman")
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            texts = text_splitter.split_documents(documents)
            
            print(f"✅ Dokumen dibagi menjadi {len(texts)} chunk")
            
            # Create embeddings
            print("🔄 Membuat embeddings...")
            embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
            
            # Create vector store
            self.vector_store = FAISS.from_documents(texts, embeddings)
            
            print("✅ Vector store berhasil dibuat!")
            
            # Setup QA chain
            self.setup_qa_chain()
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            if "quota" in str(e).lower() or "billing" in str(e).lower():
                print("💡 Kemungkinan masalah:")
                print("   - OpenAI API quota habis")
                print("   - Billing/payment method belum diatur")
                print("   - Gunakan alternatif: python3 agent/main_local.py")
            sys.exit(1)
    
    def setup_qa_chain(self):
        """Setup the QA chain with custom prompt"""
        
        # Custom prompt template
        prompt_template = """Gunakan konteks berikut untuk menjawab pertanyaan. 
        Jika Anda tidak tahu jawabannya berdasarkan konteks yang diberikan, katakan bahwa Anda tidak tahu.
        Berikan jawaban yang informatif dan akurat berdasarkan dokumen.

        Konteks: {context}

        Pertanyaan: {question}

        Jawaban yang informatif:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Setup LLM
        llm = OpenAI(
            model="gpt-3.5-turbo-instruct",
            temperature=0.2,
            max_tokens=500
        )
        
        # Create QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )
    
    def ask_question(self, question):
        """Ask a question about the document"""
        try:
            print("🔍 Mencari jawaban...")
            
            # Get response from QA chain
            result = self.qa_chain({"query": question})
            
            # Extract answer and sources
            answer = result["result"]
            source_docs = result["source_documents"]
            
            print("\n📋 Jawaban:")
            print(f"💬 {answer}")
            
            if source_docs:
                print(f"\n📚 Berdasarkan {len(source_docs)} sumber dari dokumen")
                
            return answer
            
        except Exception as e:
            print(f"❌ ERROR saat mencari jawaban: {str(e)}")
            if "quota" in str(e).lower():
                print("💡 Coba gunakan alternatif: python3 agent/main_local.py")
            return None
    
    def run_interactive_mode(self):
        """Run interactive Q&A mode"""
        print("\n🤖 AI Document Assistant Ready!")
        print(f"📄 Document: {os.path.basename(self.document_path)}")
        print("ℹ️  Mode: OpenAI API (Intelligent)")
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
                
                # Ask question
                self.ask_question(question)
                
            except KeyboardInterrupt:
                print("\n\n👋 Program dihentikan. Sampai jumpa!")
                break
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")

def main():
    """Main function"""
    print("🚀 Starting AI Document Assistant...")
    
    # Initialize assistant
    assistant = DocumentAssistant()
    
    # Load and process document
    assistant.load_and_process_document()
    
    # Run interactive mode
    assistant.run_interactive_mode()

if __name__ == "__main__":
    main()
