# Vector Database Storage

This directory contains the FAISS vector database files for document embeddings.

## Contents:
- `faiss_index.faiss`: FAISS index file containing vector embeddings
- `faiss_index.pkl`: Pickle file with document metadata and mappings

## How it Works:
1. When documents are processed, text chunks are embedded using OpenAI's embedding model
2. Embeddings are stored in FAISS for fast similarity search
3. Metadata is preserved for document traceability

## Development Notes:
- Files are automatically created when documents are first processed
- Delete these files to reset the vector database
- Size depends on number and length of processed documents

## Performance:
- FAISS provides sub-second search times for most queries
- Memory usage scales with document corpus size
- Index can be saved/loaded for persistent storage
