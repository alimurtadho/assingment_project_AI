# AI Document Assistant

🤖 **Sistem AI untuk melakukan tanya jawab dengan dokumen PDF menggunakan LangChain dan OpenAI API**

## 📋 Deskripsi

AI Document Assistant adalah aplikasi yang memungkinkan pengguna untuk:

• 📄 **Memuat dan memproses dokumen PDF**  
• 🔍 **Melakukan pencarian cerdas dalam dokumen**  
• 💬 **Bertanya tentang isi dokumen dan mendapat jawaban yang relevan**  
• 🧠 **Menggunakan AI untuk memberikan jawaban yang kontekstual**

## 🏗️ Arsitektur Agent

### Komponen Utama:

**• Prompt + Memory**
- Prompt dinamis dengan konteks dari dokumen
- Memory menggunakan pendekatan Semantic Memory (vector store FAISS)

**• Tool / Function**
- Tool utama: pencarian dokumen menggunakan vector similarity
- Tool opsional: fallback pencarian lokal (non-AI)

**• Model**
- LLM: gpt-3.5-turbo dari OpenAI
- Embedding: text-embedding-ada-002
- Vector DB: FAISS (lokal)

## 🔁 Agent Loop (Observe → Decide → Act)

1. **Observe**: User menginput pertanyaan dalam bahasa natural
2. **Decide**: Sistem mencocokkan pertanyaan ke chunk dokumen terdekat (via vector search)
3. **Act**: Jawaban dihasilkan oleh LLM berdasarkan konteks dokumen

## 🚀 Fitur

• ✅ Memuat dokumen PDF internal  
• ✅ Preprocessing dan chunking otomatis  
• ✅ Pencarian berbasis vector  
• ✅ Integrasi OpenAI untuk QnA  
• ✅ Alternatif offline (local string matching)  
• ✅ Error handling user-friendly  

## 📁 Struktur Projekt

```
ai_document_assistant/
├── src/
│   ├── agents/              # AI Agent implementation
│   ├── document_processor/  # PDF processing and chunking
│   ├── vector_store/        # FAISS vector database
│   ├── tools/              # Search and utility tools
│   ├── memory/             # Semantic memory implementation
│   └── ui/                 # Streamlit web interface
├── data/
│   ├── documents/          # PDF documents storage
│   └── vector_db/         # FAISS database files
├── config/
│   └── config.py          # Configuration settings
├── tests/                 # Unit tests
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
└── app.py                # Main application entry point
```

## 🛠️ Installation & Setup

1. **Clone and setup environment:**
   ```bash
   git clone <repository>
   cd ai_document_assistant
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Run the application:**
   ```bash
   streamlit run app.py
   ```

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MAX_TOKENS=4000
TEMPERATURE=0.7
```

## 📖 Usage

1. **Upload PDF Document**: Use the file uploader in the web interface
2. **Wait for Processing**: The system will chunk and index your document
3. **Ask Questions**: Type your questions in natural language
4. **Get AI Answers**: Receive contextual answers based on document content

## 🧪 Testing

Run tests using pytest:
```bash
pytest tests/ -v
```

## 🚀 Development

The application follows a modular architecture:

- **Agent Loop**: Implemented in `src/agents/`
- **Document Processing**: Handled by `src/document_processor/`
- **Vector Search**: Managed by `src/vector_store/`
- **Memory System**: Semantic memory in `src/memory/`
- **Tools**: Search utilities in `src/tools/`

## 📊 Performance

- **Vector Search**: Sub-second response time for most queries
- **Memory Usage**: Optimized chunking for efficient storage
- **Scalability**: Supports multiple documents simultaneously

## 🔧 Configuration

Adjust settings in `config/config.py`:
- Chunk size and overlap
- Model parameters
- Vector store settings
- UI customization

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ using LangChain, OpenAI, and FAISS**
