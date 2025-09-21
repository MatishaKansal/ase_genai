"""
Central place for application settings.

Non-technical summary:
- We read values from a local .env file (not committed) so you can configure the app
	without touching code (project IDs, regions, models, and simple toggles).
- Sensible defaults are provided, but you should set real values in .env.
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Cloud settings (fill these in your .env)
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
# Region used for Google AI services
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
# Document AI region: multi-region values like "us" or "eu"
DOCAI_LOCATION = os.getenv("DOCAI_LOCATION", "us")
PROCESSOR_ID = os.getenv("DOCAI_PROCESSOR_ID", "your-docai-processor-id")
BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "your-gcs-bucket-name")

# AI models
# Embeddings model used to convert text into vectors for search
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-004")

# Processing settings
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "200"))
ANOMALY_THRESHOLD = float(os.getenv("ANOMALY_THRESHOLD", "0.65"))

# UI/UX
# Disclaimer added at the end of summaries and chat answers
DISCLAIMER_TEXT = os.getenv(
	"DISCLAIMER_TEXT",
	"The information provided is for informational purposes only. All responses are AI-generated and may be inaccurate.",
)

# Prompt templates (customizable via .env)
# Use placeholders to insert content:
#  - {context}  -> replaced with joined document chunks
#  - {question} -> (Q&A only) replaced with the user's question
DEFAULT_SUMMARY_PROMPT_TEMPLATE = (
	"You are a meticulous legal analyst tasked with demystifying a rental agreement. "
	"Work ONLY with the provided document excerpts. Do not invent facts or rely on outside knowledge.\n\n"
	"Goals:\n"
	"- Produce a clear, plain-language summary suitable for a non-lawyer.\n"
	"- Extract concrete facts (names, dates, amounts, addresses) exactly as written.\n"
	"- Highlight obligations of each party, fees/penalties, and key risks.\n"
	"- Note any sections that are not specified in the excerpts.\n\n"
	"Output format (use short bullets, keep it crisp):\n"
	"- Title: Plain-language Summary\n"
	"- Parties & Property: ...\n"
	"- Financial Terms (amounts, frequency, due dates, deposits): ...\n"
	"- Term & Termination (start/end, notice, renewal): ...\n"
	"- Obligations (landlord vs tenant): ...\n"
	"- Restrictions/Usage rules: ...\n"
	"- Maintenance/Repairs: ...\n"
	"- Penalties/Liability/Indemnity: ...\n"
	"- Notices & Jurisdiction: ...\n"
	"- Other Material Terms: ...\n"
	"- Unknown/Not specified: bullet list of important items that are missing from the excerpts.\n\n"
	"Guidelines:\n"
	"- Quote numbers/dates/amounts exactly as they appear.\n"
	"- If a field is missing in the excerpts, write: Not specified in excerpts.\n\n"
	"Document Excerpts:\n{context}"
)

DEFAULT_QA_PROMPT_TEMPLATE = (
	"You are an expert legal assistant. Answer the user's question strictly and ONLY from the provided document excerpts.\n"
	"If the answer is not present in the text, reply exactly: \"I cannot answer this question based on the document.\"\n\n"
	"Instructions:\n"
	"- Be concise and precise; quote exact amounts/dates/names when relevant.\n"
	"- If only partial information is available, state what is known and note what is not specified in the excerpts.\n"
	"- Do not speculate or use outside knowledge.\n\n"
	"User question: {question}\n\n"
	"Document excerpts:\n{context}"
)

# Support writing multi-line prompts in .env using \n escapes
SUMMARY_PROMPT_TEMPLATE = os.getenv(
	"SUMMARY_PROMPT_TEMPLATE",
	DEFAULT_SUMMARY_PROMPT_TEMPLATE,
).replace("\\n", "\n")

QA_PROMPT_TEMPLATE = os.getenv(
	"QA_PROMPT_TEMPLATE",
	DEFAULT_QA_PROMPT_TEMPLATE,
).replace("\\n", "\n")