# Sample Documents for Testing

This folder contains sample PDF documents for testing the AI Document Assistant.

## Available Documents:

### 1. contoh_kebijakan.txt
- Contains sample policy document in Indonesian
- Good for testing Indonesian language processing
- Covers various policy topics

### 2. Upload Your Own PDFs
- The application supports any PDF document
- Place test PDFs in this directory for development
- Ensure PDFs contain readable text (not just images)

## Testing Guidelines:

1. **Small Documents**: Use documents under 10 pages for quick testing
2. **Indonesian Content**: Test with Indonesian language documents
3. **Technical Content**: Try technical documentation
4. **Mixed Content**: Test with documents containing both text and tables

## File Formats:
- Supported: PDF files with extractable text
- Not Supported: Image-only PDFs, encrypted PDFs

## Usage in Development:
```python
# Load sample document for testing
from src.document_processor.pdf_processor import DocumentProcessor

processor = DocumentProcessor()
documents = processor.process_pdf('./data/documents/sample.pdf')
```
