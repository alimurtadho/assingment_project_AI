<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Document Assistant - Copilot Instructions

## Project Overview
This is an AI Document Assistant application that uses LangChain and OpenAI API for PDF document Q&A functionality with vector search capabilities.

## Architecture Guidelines
- Follow the Agent Loop pattern: Observe → Decide → Act
- Use FAISS for vector storage and semantic search
- Implement modular components for document processing, vector store, and AI agents
- Use Streamlit for the web interface

## Code Style & Patterns
- Use Python type hints for all functions
- Follow PEP 8 style guidelines
- Implement proper error handling with user-friendly messages
- Use dependency injection for better testability
- Create abstract base classes for extensibility

## Key Components
1. **Document Processor**: Handle PDF loading, chunking, and preprocessing
2. **Vector Store**: Manage FAISS database operations
3. **AI Agent**: Implement the main question-answering logic
4. **Memory System**: Semantic memory for contextual understanding
5. **Tools**: Search utilities and fallback mechanisms

## Dependencies & Libraries
- LangChain for AI agent framework
- OpenAI for embeddings and LLM
- FAISS for vector similarity search
- PyPDF2 for PDF processing
- Streamlit for web interface
- python-dotenv for configuration

## Configuration
- Use environment variables for API keys and settings
- Centralize configuration in config/config.py
- Support both development and production environments

## Testing Guidelines
- Write unit tests for all core components
- Use pytest for testing framework
- Mock external API calls in tests
- Test error scenarios and edge cases

## Performance Considerations
- Optimize chunk size for better retrieval
- Implement caching for frequently accessed documents
- Use async operations where appropriate
- Monitor token usage for cost optimization

## Security Best Practices
- Never commit API keys or sensitive data
- Validate all user inputs
- Implement proper error handling without exposing internals
- Use secure file upload mechanisms
