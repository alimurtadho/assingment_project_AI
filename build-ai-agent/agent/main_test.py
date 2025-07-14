#!/usr/bin/env python3
"""
AI Document Assistant - Test Script
Script untuk testing fungsionalitas dasar sistem.
"""

import os
import sys

def test_file_structure():
    """Test if all required files and directories exist"""
    print("🧪 Testing file structure...")
    
    required_files = [
        "requirements.txt",
        ".env.example",
        "README.md",
        "agent/main.py",
        "agent/main_local.py",
        "agent/main_test.py"
    ]
    
    required_dirs = [
        "agent",
        "document"
    ]
    
    # Test directories
    for directory in required_dirs:
        if os.path.exists(directory):
            print(f"✅ Directory exists: {directory}")
        else:
            print(f"❌ Directory missing: {directory}")
    
    # Test files
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ File exists: {file_path}")
        else:
            print(f"❌ File missing: {file_path}")

def test_python_imports():
    """Test if basic Python imports work"""
    print("\n🧪 Testing Python imports...")
    
    # Test standard library imports
    try:
        import os
        import sys
        import re
        print("✅ Standard library imports: OK")
    except ImportError as e:
        print(f"❌ Standard library imports failed: {e}")
    
    # Test PyPDF2 (should be available)
    try:
        import PyPDF2
        print("✅ PyPDF2 import: OK")
    except ImportError:
        print("❌ PyPDF2 import: FAILED (run: pip install PyPDF2)")
    
    # Test LangChain imports (may fail if not installed)
    try:
        from langchain.document_loaders import PyPDFLoader
        print("✅ LangChain imports: OK")
    except ImportError:
        print("❌ LangChain imports: FAILED (run: pip install -r requirements.txt)")
    
    # Test dotenv
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv import: OK")
    except ImportError:
        print("❌ python-dotenv import: FAILED (run: pip install python-dotenv)")

def test_pdf_document():
    """Test if PDF document exists and is readable"""
    print("\n🧪 Testing PDF document...")
    
    pdf_path = "document/contoh_kebijakan.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        print("💡 Create a sample PDF file or use your own document")
        return False
    
    try:
        # Try to read with PyPDF2
        import PyPDF2
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            if num_pages > 0:
                # Try to extract text from first page
                first_page_text = pdf_reader.pages[0].extract_text()
                print(f"✅ PDF readable: {num_pages} pages")
                print(f"✅ Text extraction: {len(first_page_text)} characters from page 1")
                return True
            else:
                print("❌ PDF has no pages")
                return False
                
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return False

def test_environment_variables():
    """Test environment variables setup"""
    print("\n🧪 Testing environment variables...")
    
    # Check if .env.example exists
    if os.path.exists(".env.example"):
        print("✅ .env.example file exists")
    else:
        print("❌ .env.example file missing")
    
    # Check if .env exists
    if os.path.exists(".env"):
        print("✅ .env file exists")
        
        # Try to load environment variables
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key:
                # Mask the key for security
                masked_key = openai_key[:8] + "..." + openai_key[-4:] if len(openai_key) > 12 else "***"
                print(f"✅ OPENAI_API_KEY found: {masked_key}")
            else:
                print("⚠️  OPENAI_API_KEY not set in .env file")
                
        except ImportError:
            print("❌ Cannot load .env file (python-dotenv not installed)")
    else:
        print("⚠️  .env file not found (copy from .env.example and add your API key)")

def create_sample_pdf():
    """Create a simple sample PDF for testing"""
    print("\n🧪 Creating sample PDF...")
    
    sample_content = """
Kebijakan Cuti Karyawan

1. Cuti Tahunan
   - Karyawan tetap berhak atas cuti tahunan sebanyak 12 hari kerja per tahun
   - Cuti dapat diambil setelah melewati masa kerja minimal 1 tahun
   - Sisa cuti tidak dapat dibawa ke tahun berikutnya

2. Cuti Sakit
   - Karyawan dapat mengambil cuti sakit maksimal 5 hari per bulan
   - Wajib menyertakan surat keterangan dokter untuk cuti lebih dari 2 hari
   - Cuti sakit tidak mengurangi cuti tahunan

3. Cuti Melahirkan
   - Karyawan wanita berhak cuti melahirkan selama 3 bulan
   - Dapat diperpanjang 1 bulan atas rekomendasi dokter
   - Mendapat 100% gaji selama masa cuti

4. Cuti Khusus
   - Pernikahan: 2 hari
   - Kematian keluarga: 3 hari
   - Ibadah keagamaan: disesuaikan dengan kebutuhan
    """
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        # Create document directory if it doesn't exist
        os.makedirs("document", exist_ok=True)
        
        pdf_path = "document/contoh_kebijakan.pdf"
        c = canvas.Canvas(pdf_path, pagesize=letter)
        
        # Add text to PDF
        textobject = c.beginText(50, 750)
        textobject.setFont("Helvetica", 12)
        
        for line in sample_content.strip().split('\n'):
            textobject.textLine(line)
        
        c.drawText(textobject)
        c.save()
        
        print(f"✅ Sample PDF created: {pdf_path}")
        return True
        
    except ImportError:
        print("⚠️  reportlab not available for PDF creation")
        print("💡 You can manually create a PDF file in the document/ folder")
        return False
    except Exception as e:
        print(f"❌ Error creating PDF: {e}")
        return False

def run_quick_test():
    """Run a quick functionality test"""
    print("\n🧪 Running quick functionality test...")
    
    try:
        # Test local search functionality
        sys.path.append('agent')
        from main_local import LocalDocumentSearch
        
        search_engine = LocalDocumentSearch()
        
        if os.path.exists(search_engine.document_path):
            search_engine.load_pdf_document()
            
            # Test search
            test_query = "cuti tahunan"
            results = search_engine.search_in_document(test_query)
            
            if results:
                print(f"✅ Search test passed: Found {len(results)} results for '{test_query}'")
            else:
                print("⚠️  Search test: No results found")
        else:
            print("⚠️  Cannot run search test: No PDF document found")
            
    except Exception as e:
        print(f"❌ Quick test failed: {e}")

def main():
    """Main test function"""
    print("🚀 AI Document Assistant - Test Suite")
    print("=" * 50)
    
    # Run all tests
    test_file_structure()
    test_python_imports()
    test_environment_variables()
    
    # Test PDF or create sample
    if not test_pdf_document():
        print("\n💡 Attempting to create sample PDF...")
        create_sample_pdf()
        test_pdf_document()
    
    # Run functionality test
    run_quick_test()
    
    print("\n" + "=" * 50)
    print("🏁 Test suite completed!")
    print("\n💡 Next steps:")
    print("   1. Install dependencies: pip install -r requirements.txt")
    print("   2. Setup .env file with your OpenAI API key")
    print("   3. Run main application: python3 agent/main.py")
    print("   4. Or use local version: python3 agent/main_local.py")

if __name__ == "__main__":
    main()
