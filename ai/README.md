## Generative AI for Demystifying Legal Documents

This project is our submission for Google’s GenAI Exchange hackathon.

Goal: build a reliable, private, and supportive assistant that simplifies complex legal documents (rental agreements, etc.) into plain language—summarizes, explains clauses, answers questions, and flags missing standard protections.

Key outcomes:
- Clear, accessible summaries with a visible disclaimer
- Clause-level Q&A grounded on the uploaded document (no hallucinations)
- Detection of commonly expected “core clauses” that are missing
- Optional translation and text-to-speech for accessibility

---

## Features

- Google Document AI + Vision OCR for robust text extraction
- Vertex AI embeddings + FAISS for retrieval (RAG)
- Gemini-based summarization and grounded Q&A
- Dataset-driven “core clauses” detection (auto-generated from sample agreements)
- Translation (Google Translate) and audio synthesis (Google TTS)
- Health endpoint and resilient retries for robustness

---

## Architecture

1) Ingestion: file upload (PDF/image) → OCR → chunking
2) Indexing: embeddings → FAISS index (in-memory)
3) Reasoning: Gemini summarization + grounded Q&A over retrieved chunks
4) Safety: missing “core clauses” detection vs dataset-derived normals
5) Accessibility: translation + TTS, with a configurable disclaimer

---

## Project structure

```
ai/
├── init.py                 # FastAPI app & startup (embeds core clauses)
├── processor_app.py        # API endpoints: /api/process-document, /api/chat
├── config.py               # All settings pulled from .env with sensible defaults
├── generate_core_clauses.py# Builds CORE_CLAUSES from ai/dataset/*.docx
├── normal_data.py          # Generated core clauses (do not edit manually)
├── utils/
│   ├── ocr_utils.py        # Document AI + Vision OCR
│   ├── embedding_utils.py  # Vertex AI embeddings (batched + retries)
│   ├── summarizer_utils.py # Gemini-based summary/answers (+ disclaimer)
│   ├── translation_utils.py# Translate with chunking and lang normalization
│   ├── tts_utils.py        # TTS with chunking and GCS upload
│   ├── vectorstore_utils.py# FAISS vector store helpers
│   └── anomaly_utils.py    # Missing-core-clauses detection
├── dataset/                # Sample agreements (.docx) for core-clause generation
├── requirements.txt
├── env_template.txt
└── README.md
```

---

## Prerequisites

- Python 3.11+ recommended
- Google Cloud project with the following APIs enabled:
  - Vertex AI, Document AI, Vision, Translate v2, Text-to-Speech, Cloud Storage
- Service account with roles: Vertex AI User, Document AI API User, Vision API User, Cloud Translation API User, Cloud TTS User, Storage Object Admin (or a tighter, bucket-scoped role)

---

## Setup

1) Install dependencies:
```powershell
pip install -r ai/requirements.txt
```

2) Create a `.env` in the repository root (the folder that contains `ai/`) from `ai/env_template.txt` and fill values:
```powershell
copy ai\env_template.txt .env
# edit .env to set project, locations, processor id, bucket, and credentials
```
Note: Place `.env` at the repository root (next to the `ai/` folder), not inside `ai/`.

3) Ensure ADC credentials:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="<absolute_path_to_service_account.json>"
```

4) Generate core clauses (required before first run):
```powershell
cd ai
python generate_core_clauses.py
```
This reads `ai/dataset/*.docx`, clusters similar clauses, applies coverage/size filters, and writes `ai/normal_data.py` (a backup is created automatically). Re-run this anytime you change the dataset or want to retune parameters.

Optional: tune clustering via environment variables (PowerShell example):
```powershell
cd ai
$env:CLUSTERING_THRESHOLD='0.50'
$env:MIN_CLUSTER_SIZE='5'
$env:COVERAGE_THRESHOLD='0.60'
$env:TARGET_MIN='10'
$env:TARGET_MAX='15'
python generate_core_clauses.py
```

5) Run the API:
```powershell
uvicorn ai.init:app --host 0.0.0.0 --port 8000 --reload
```

---

## API

### Process a document
- POST `/api/process-document` (multipart/form-data)
  - file: the PDF/image
  - language: target language code (e.g., `en`, `hi`)

Response:
```json
{
  "summary": "Plain-language summary with disclaimer",
  "translated_summary": "… (matches requested language)",
  "audio_url": "https://storage.googleapis.com/<bucket>/audio/<id>.mp3",
  "total_chunks": 42,
  "processing_time": 12.34,
  "is_suspicious": true,
  "suspicion_note": "Translated note listing a few missing core clauses +N more"
}
```

### Chat over the document
- POST `/api/chat?query=What is the notice period?&language=hi`
  - Returns an answer grounded strictly on indexed chunks + disclaimer

---

## Configuration (.env)

Location: put your `.env` in the repository root (same folder where `ai/` resides).

See `ai/env_template.txt` for all options. Key ones:

- GCP_PROJECT_ID, GCP_LOCATION, DOCAI_LOCATION, DOCAI_PROCESSOR_ID, GCS_BUCKET_NAME
- GOOGLE_APPLICATION_CREDENTIALS (path) or use ambient ADC
- EMBEDDING_MODEL (default `text-embedding-004`)
- CHUNK_SIZE (default 200)
- ANOMALY_THRESHOLD (default 0.65)
- DISCLAIMER_TEXT (customizable)

Optional prompt customization:
- SUMMARY_PROMPT_TEMPLATE — must include `{context}` where document chunks are inserted (use `\n` for newlines in `.env`).
- QA_PROMPT_TEMPLATE — must include `{context}` and `{question}` (use `\n` for newlines). If a template is malformed, the app falls back to a safe minimal prompt.

Generator tuning (optional):
- CLUSTERING_THRESHOLD (merge aggressiveness)
- MIN_CLUSTER_SIZE (min items per cluster)
- COVERAGE_THRESHOLD (fraction of docs a cluster must cover)
- TARGET_MIN / TARGET_MAX (auto-tune target count of core clauses)

---

## Implementation notes

- Embeddings are batched (≤250 per call) and retried with exponential backoff
- TTS chunks the text by byte size to avoid API 5,000-byte limit
- Translation and TTS support simple language normalization (e.g., `hi` → `hi-IN`)
- Suspicion note is concise (up to 5 items + “+N more”) and is translated to match the summary language
- Disclaimer is appended to all user-visible model outputs and can be customized via `.env`

---

## Security & privacy

- Uses service account (ADC), no API keys in code
- Secrets are not committed; ensure `.gitignore` covers key files
- Bucket uploads are restricted to audio artifacts only
- Model outputs include a disclaimer; this is a first-point-of-contact assistant—not legal advice

---

## Troubleshooting

- 503/UNAVAILABLE on embeddings: automatic retries are built-in; re-run if needed
- Document AI processor: verify region (`DOCAI_LOCATION`) and `PROCESSOR_ID`
- TTS voice: fallback voices are used if preferred names aren’t available

---

## License

MIT (or your preferred license)
