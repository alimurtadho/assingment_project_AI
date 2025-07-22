"""
Streamlit web interface for AI Document Assistant
"""
import streamlit as st
import os
from typing import Optional
import traceback
from config.config import Config
from src.document_processor.pdf_processor import DocumentProcessor
from src.agents.document_qa_agent import DocumentQAAgent

class DocumentAssistantUI:
    """Streamlit UI for Document Assistant"""
    
    def __init__(self):
        self.processor = DocumentProcessor()
        self.agent = DocumentQAAgent()
        
        # Initialize session state
        if 'agent_initialized' not in st.session_state:
            st.session_state.agent_initialized = False
        if 'chat_history' not in st.session_state:
            st.session_state.chat_history = []
        if 'current_document' not in st.session_state:
            st.session_state.current_document = None
    
    def render_header(self):
        """Render application header"""
        st.set_page_config(
            page_title="AI Document Assistant",
            page_icon="🤖",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        
        st.title("🤖 AI Document Assistant")
        st.markdown("**Sistem AI untuk tanya jawab dengan dokumen PDF menggunakan LangChain dan OpenAI**")
        
        # Status indicator
        if st.session_state.agent_initialized:
            st.success(f"✅ Dokumen siap: {st.session_state.current_document}")
        else:
            st.warning("📄 Silakan upload dokumen PDF untuk memulai")
    
    def render_sidebar(self):
        """Render sidebar with controls"""
        with st.sidebar:
            st.header("📁 Upload Dokumen")
            
            # File uploader
            uploaded_file = st.file_uploader(
                "Pilih file PDF",
                type=['pdf'],
                help="Upload dokumen PDF untuk dianalisis"
            )
            
            if uploaded_file is not None:
                if st.button("🔄 Proses Dokumen", type="primary"):
                    self.process_document(uploaded_file)
            
            st.divider()
            
            # Agent status
            st.header("🤖 Status Agent")
            if st.session_state.agent_initialized:
                status = self.agent.get_agent_status()
                st.metric("Dokumen Dimuat", status['documents_loaded'])
                st.metric("Vector Store", "Aktif" if status['vector_store']['status'] == 'active' else "Tidak Aktif")
                st.metric("Memory", f"{status['memory']['conversation_count']} percakapan")
            else:
                st.info("Agent belum diinisialisasi")
            
            st.divider()
            
            # Controls
            st.header("⚙️ Kontrol")
            
            if st.button("🗑️ Hapus Chat"):
                st.session_state.chat_history.clear()
                st.rerun()
            
            if st.button("🔄 Reset Agent"):
                self.reset_agent()
            
            # Settings
            st.header("📊 Pengaturan")
            
            # Model settings (read-only display)
            st.text(f"Model: {Config.LLM_MODEL}")
            st.text(f"Embedding: {Config.EMBEDDING_MODEL}")
            st.text(f"Chunk Size: {Config.CHUNK_SIZE}")
            
            # API key status
            if Config.OPENAI_API_KEY:
                st.success("✅ OpenAI API Key tersedia")
            else:
                st.error("❌ OpenAI API Key tidak ditemukan")
                st.info("Tambahkan OPENAI_API_KEY ke file .env")
    
    def process_document(self, uploaded_file):
        """Process uploaded PDF document"""
        try:
            with st.spinner("🔄 Memproses dokumen PDF..."):
                # Validate configuration
                Config.validate()
                
                # Process the uploaded file
                documents = self.processor.process_uploaded_file(uploaded_file)
                
                if not documents:
                    st.error("❌ Gagal memproses dokumen. Pastikan file PDF valid.")
                    return
                
                # Load documents into agent
                success = self.agent.load_documents(documents)
                
                if success:
                    st.session_state.agent_initialized = True
                    st.session_state.current_document = uploaded_file.name
                    
                    st.success(f"✅ Dokumen berhasil diproses!")
                    st.info(f"📊 {len(documents)} chunk teks telah diindeks")
                    
                    # Clear previous chat
                    st.session_state.chat_history.clear()
                    
                    st.rerun()
                else:
                    st.error("❌ Gagal memuat dokumen ke dalam agent")
        
        except Exception as e:
            st.error(f"❌ Error: {str(e)}")
            st.exception(e)
    
    def reset_agent(self):
        """Reset agent and clear state"""
        self.agent.clear_agent()
        st.session_state.agent_initialized = False
        st.session_state.current_document = None
        st.session_state.chat_history.clear()
        st.success("✅ Agent berhasil direset")
        st.rerun()
    
    def render_chat_interface(self):
        """Render main chat interface"""
        # Chat history
        st.header("💬 Percakapan")
        
        # Display chat history
        chat_container = st.container()
        with chat_container:
            for i, (question, answer) in enumerate(st.session_state.chat_history):
                # User message
                st.markdown(f"**👤 Anda:**")
                st.markdown(question)
                
                # AI response
                st.markdown(f"**🤖 Assistant:**")
                st.markdown(answer)
                
                if i < len(st.session_state.chat_history) - 1:
                    st.divider()
        
        # Input area
        st.divider()
        
        # Chat input
        if st.session_state.agent_initialized:
            with st.form("chat_form", clear_on_submit=True):
                user_question = st.text_area(
                    "Tanyakan sesuatu tentang dokumen:",
                    placeholder="Contoh: Apa isi utama dari dokumen ini?",
                    height=100
                )
                
                col1, col2 = st.columns([1, 4])
                with col1:
                    submit_button = st.form_submit_button("📤 Kirim", type="primary")
                with col2:
                    st.empty()  # Placeholder for spacing
                
                if submit_button and user_question.strip():
                    self.process_question(user_question.strip())
        else:
            st.info("📄 Upload dokumen PDF terlebih dahulu untuk mulai bertanya")
    
    def process_question(self, question: str):
        """Process user question and get AI response"""
        try:
            with st.spinner("🤔 Sedang berpikir..."):
                # Get AI response using agent loop
                response = self.agent.process_query(question)
                
                # Add to chat history
                st.session_state.chat_history.append((question, response))
                
                # Rerun to show new message
                st.rerun()
        
        except Exception as e:
            st.error(f"❌ Error memproses pertanyaan: {str(e)}")
            st.exception(e)
    
    def render_examples(self):
        """Render example questions"""
        if not st.session_state.agent_initialized:
            st.header("💡 Contoh Pertanyaan")
            st.markdown("""
            Setelah upload dokumen, Anda bisa bertanya seperti:
            
            **🔍 Pencarian Informasi:**
            - "Apa topik utama dalam dokumen ini?"
            - "Cari informasi tentang [topik]"
            - "Dimana disebutkan tentang [kata kunci]?"
            
            **📝 Ringkasan:**
            - "Ringkas isi dokumen ini"
            - "Jelaskan poin-poin utama"
            - "Kesimpulan dari dokumen ini?"
            
            **❓ Penjelasan:**
            - "Jelaskan tentang [konsep]"
            - "Apa maksud dari [istilah]?"
            - "Bagaimana cara [proses]?"
            
            **📊 Analisis:**
            - "Bandingkan [A] dengan [B]"
            - "Apa kelebihan dan kekurangan [topik]?"
            - "Berikan contoh [konsep]"
            """)
    
    def render_footer(self):
        """Render application footer"""
        st.divider()
        st.markdown("""
        <div style='text-align: center; color: gray;'>
            <p>🤖 AI Document Assistant | Powered by LangChain & OpenAI | Built with ❤️ using Streamlit</p>
        </div>
        """, unsafe_allow_html=True)
    
    def run(self):
        """Run the Streamlit application"""
        try:
            # Render UI components
            self.render_header()
            
            # Main layout
            col1, col2 = st.columns([3, 1])
            
            with col1:
                self.render_chat_interface()
                self.render_examples()
            
            with col2:
                self.render_sidebar()
            
            self.render_footer()
            
        except Exception as e:
            st.error("❌ Terjadi kesalahan pada aplikasi")
            st.exception(e)
            
            # Show troubleshooting info
            with st.expander("🔧 Informasi Debug"):
                st.text("Traceback:")
                st.code(traceback.format_exc())
                
                st.text("Environment Variables:")
                st.json({
                    "OPENAI_API_KEY": "Set" if Config.OPENAI_API_KEY else "Not Set",
                    "CHUNK_SIZE": Config.CHUNK_SIZE,
                    "LLM_MODEL": Config.LLM_MODEL
                })

def main():
    """Main application entry point"""
    try:
        # Validate configuration before starting
        Config.validate()
        
        # Create and run the UI
        ui = DocumentAssistantUI()
        ui.run()
        
    except ValueError as e:
        st.error(f"❌ Configuration Error: {str(e)}")
        st.info("💡 Pastikan file .env sudah dikonfigurasi dengan benar")
        
        with st.expander("📝 Setup Instructions"):
            st.markdown("""
            1. Copy file `.env.example` menjadi `.env`
            2. Tambahkan OpenAI API key Anda:
               ```
               OPENAI_API_KEY=your_api_key_here
               ```
            3. Restart aplikasi
            """)
    
    except Exception as e:
        st.error(f"❌ Application Error: {str(e)}")
        st.exception(e)

if __name__ == "__main__":
    main()
