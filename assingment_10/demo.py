"""
Demo script to test AI Document Assistant functionality
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from config.config import Config
from src.document_processor.pdf_processor import DocumentProcessor
from src.agents.document_qa_agent import DocumentQAAgent

def demo_basic_functionality():
    """Demonstrate basic functionality without actual PDF"""
    print("🤖 AI Document Assistant - Demo")
    print("=" * 50)
    
    try:
        # Initialize components
        processor = DocumentProcessor()
        agent = DocumentQAAgent()
        
        print("✅ Components initialized successfully")
        
        # Test text chunking
        sample_text = """
        Artificial Intelligence (AI) adalah teknologi yang memungkinkan mesin untuk belajar dan membuat keputusan seperti manusia.
        AI mencakup berbagai teknik seperti machine learning, deep learning, dan natural language processing.
        Aplikasi AI sangat luas, mulai dari chatbot, sistem rekomendasi, hingga mobil otonom.
        Perkembangan AI terus berkembang pesat dan mengubah cara kita bekerja dan hidup.
        """
        
        # Test chunking
        documents = processor.chunk_text(sample_text, source="demo.txt")
        print(f"✅ Text chunked into {len(documents)} pieces")
        
        # Test agent observation
        test_query = "Apa itu Artificial Intelligence?"
        observation = agent.observe(test_query)
        print(f"✅ Agent observation: {observation['intent']['primary_intent']}")
        
        # Test decision making
        decision = agent.decide(observation)
        print(f"✅ Agent decision: {decision['action']}")
        
        print("\n🎉 Demo completed successfully!")
        print("\n📝 Next steps:")
        print("1. Add your OpenAI API key to .env file")
        print("2. Run: streamlit run app.py")
        print("3. Upload a PDF document and start asking questions")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure all dependencies are installed")
        print("2. Check if config files are present")
        print("3. Verify Python path includes src directory")

def check_environment():
    """Check if environment is properly configured"""
    print("🔍 Environment Check")
    print("-" * 30)
    
    # Check dependencies
    dependencies = [
        'langchain', 'openai', 'streamlit', 'PyPDF2', 
        'faiss-cpu', 'python-dotenv'
    ]
    
    for dep in dependencies:
        try:
            __import__(dep.replace('-', '_'))
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} - not installed")
    
    # Check configuration
    print(f"\n📁 Working directory: {os.getcwd()}")
    print(f"🔑 OpenAI API Key: {'Set' if Config.OPENAI_API_KEY else 'Not Set'}")
    print(f"📊 Chunk size: {Config.CHUNK_SIZE}")
    print(f"🤖 LLM Model: {Config.LLM_MODEL}")

def main():
    """Main demo function"""
    print("🚀 Starting AI Document Assistant Demo\n")
    
    check_environment()
    print()
    demo_basic_functionality()

if __name__ == "__main__":
    main()
