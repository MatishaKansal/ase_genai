# AI Document Processor

A comprehensive AI-powered document processing system that combines OCR, embeddings, anomaly detection, and summarization.

## Features

- **Document OCR**: Extract text from PDF documents using Google Cloud Document AI
- **Text Chunking**: Intelligent text segmentation for optimal processing
- **Embedding Generation**: Create vector representations using Google Vertex AI
- **Vector Storage**: FAISS-based vector database for efficient similarity search
- **Anomaly Detection**: Identify potentially risky or unusual document sections
- **Document Summarization**: AI-powered summaries using Google Gemini
- **REST API**: FastAPI-based web service with comprehensive error handling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PDF Upload   │───▶│   OCR Process   │───▶│  Text Chunks   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Risk Score    │◀───│ Anomaly Detect  │◀───│   Embeddings   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Summary      │    │  Anomalies     │    │  Vector Store   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (create `.env` file):
```bash
# Google Cloud Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us
DOCAI_PROCESSOR_ID=your-docai-processor-id

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Optional settings
MAX_FILE_SIZE_MB=10
CHUNK_SIZE=500
ANOMALY_THRESHOLD=0.3
```

3. Set up Google Cloud credentials:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

## Usage

### Starting the Service

```bash
cd ase_genai/ai
python processor_app.py
```

The service will start on `http://localhost:8000`

### API Endpoints

#### Health Check
```bash
GET /
GET /health
```

#### Document Processing
```bash
POST /api/process-document
Content-Type: multipart/form-data

file: [PDF file]
```

### Example Response

```json
{
  "summary": "This contract outlines the terms...",
  "risk_score": 15.5,
  "anomalies": [
    "Unusual termination clause...",
    "Non-standard payment terms..."
  ],
  "total_chunks": 25,
  "processing_time": 12.34
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud Project ID | Required |
| `GCP_LOCATION` | Google Cloud region | `us` |
| `DOCAI_PROCESSOR_ID` | Document AI processor ID | Required |
| `GEMINI_API_KEY` | Gemini API key | Required |
| `EMBEDDING_MODEL` | Vertex AI embedding model | `textembedding-gecko@latest` |
| `MAX_FILE_SIZE_MB` | Maximum file size in MB | `10` |
| `CHUNK_SIZE` | Words per text chunk | `500` |
| `ANOMALY_THRESHOLD` | Anomaly detection threshold | `0.3` |

### Performance Tuning

- **Batch Size**: Adjust `BATCH_SIZE` in embedding generation for optimal performance
- **Chunk Size**: Modify `CHUNK_SIZE` based on document characteristics
- **Anomaly Threshold**: Tune `ANOMALY_THRESHOLD` for sensitivity

## Error Handling

The system includes comprehensive error handling:

- **Input Validation**: File type, size, and content validation
- **API Error Handling**: Proper HTTP status codes and error messages
- **Graceful Degradation**: Continues processing even if some components fail
- **Logging**: Detailed logging for debugging and monitoring

## Monitoring

### Logs
- Application logs with configurable levels
- Processing time tracking
- Error and warning logging

### Metrics
- Document processing time
- Chunk and embedding counts
- Anomaly detection results
- API response times

## Security

- **File Validation**: Strict file type and size restrictions
- **Temporary File Cleanup**: Automatic cleanup of uploaded files
- **API Key Management**: Environment variable-based configuration
- **Input Sanitization**: Validation of all inputs

## Development

### Project Structure
```
ai/
├── __init__.py
├── config.py              # Configuration management
├── processor_app.py       # Main FastAPI application
├── requirements.txt       # Dependencies
├── README.md             # This file
├── utils/                # Utility modules
│   ├── __init__.py
│   ├── ocr_utils.py      # OCR processing
│   ├── embedding_utils.py # Text embedding
│   ├── vectorstore_utils.py # Vector database
│   ├── anomaly_utils.py  # Anomaly detection
│   └── summarizer_utils.py # Text summarization
└── vector_store/         # Vector database storage
    └── __init__.py
```

### Adding New Features

1. Create utility functions in appropriate modules
2. Add configuration options in `config.py`
3. Update the main processing pipeline in `processor_app.py`
4. Add tests and documentation

## Troubleshooting

### Common Issues

1. **Google Cloud Authentication**: Ensure service account credentials are properly set
2. **API Quotas**: Monitor Vertex AI and Gemini API usage limits
3. **Memory Issues**: Adjust batch sizes for large documents
4. **File Permissions**: Ensure write access to vector store directory

### Debug Mode

Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

1. Follow the existing code style and patterns
2. Add proper error handling and logging
3. Include type hints and documentation
4. Test with various document types and sizes

## License

[Your License Here]
