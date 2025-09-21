"""
Text-to-Speech (TTS) helper using Google Cloud TTS.

We break long text into smaller pieces, synthesize speech, then upload a single MP3
to Cloud Storage and return its public URL.
"""
import os
import uuid
import tempfile
from google.cloud import texttospeech
from google.cloud import storage
from typing import List

# Support both package and script execution imports
try:
    from ..config import PROJECT_ID, BUCKET_NAME
except ImportError:
    from config import PROJECT_ID, BUCKET_NAME


def _normalize_tts_lang(code: str) -> str:
    if not code:
        return "en-US"
    c = code.strip().lower()
    mapping = {
        "en": "en-US",
        "en-us": "en-US",
        "en-gb": "en-GB",
        "hi": "hi-IN",
        "hi-in": "hi-IN",
    }
    return mapping.get(c, code)


def _select_voice(language_code: str):
    # Prefer standard voices widely available; fall back gracefully
    voice_names = {
        "en-US": "en-US-Standard-C",
        "hi-IN": "hi-IN-Standard-A",
    }
    name = voice_names.get(language_code)
    return texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=name if name else None,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )


def _chunk_text_by_bytes(text: str, max_bytes: int = 4500) -> List[str]:
    parts: List[str] = []
    buf: List[str] = []
    current_bytes = 0
    for token in text.split(" "):
        token_bytes = len((token + " ").encode("utf-8"))
        if current_bytes + token_bytes > max_bytes:
            parts.append(" ".join(buf).strip())
            buf = [token]
            current_bytes = len((token + " ").encode("utf-8"))
        else:
            buf.append(token)
            current_bytes += token_bytes
    if buf:
        parts.append(" ".join(buf).strip())
    # Ensure no empty strings
    return [p for p in parts if p]

def generate_audio(text: str, language: str = "en") -> str:
    """
    Convert text to speech, upload MP3 to Cloud Storage, and return a public URL.
    """
    if not text:
        return ""
    
    tts_client = texttospeech.TextToSpeechClient()
    
    # Determine language/voice and chunk input to stay under API size limits
    lang_code = _normalize_tts_lang(language)
    voice = _select_voice(lang_code)
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    audio_bytes = b""
    for chunk in _chunk_text_by_bytes(text):
        synthesis_input = texttospeech.SynthesisInput(text=chunk)
        resp = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        audio_bytes += resp.audio_content

    # Generate a unique filename and upload to GCS
    unique_filename = f"audio-{uuid.uuid4()}.mp3"
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"audio/{unique_filename}")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        tmp.write(audio_bytes)
        temp_file_path = tmp.name
        
    try:
        blob.upload_from_filename(temp_file_path)
        return f"https://storage.googleapis.com/{BUCKET_NAME}/audio/{unique_filename}"
    finally:
        os.unlink(temp_file_path)