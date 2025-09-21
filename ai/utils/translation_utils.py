"""
Translation helpers using Google Cloud Translation (v2 API).

We normalize language codes and translate long texts in manageable chunks
to avoid size limits.
"""
from google.cloud import translate_v2 as translate
from typing import List


def _normalize_lang(code: str) -> str:
    if not code:
        return "en"
    code = code.strip().lower()
    # Map common aliases
    aliases = {
        "en-us": "en",
        "en-gb": "en",
        "hi-in": "hi",
        "zh-cn": "zh",
        "zh-hans": "zh",
        "zh-hant": "zh-TW",
    }
    return aliases.get(code, code)


def _chunk_text(text: str, max_len: int = 4000) -> List[str]:
    if len(text) <= max_len:
        return [text]
    # naive splitting on sentence boundaries when possible
    parts: List[str] = []
    buf = []
    count = 0
    for token in text.split(" "):
        if count + len(token) + 1 > max_len:
            parts.append(" ".join(buf))
            buf = [token]
            count = len(token)
        else:
            buf.append(token)
            count += len(token) + 1
    if buf:
        parts.append(" ".join(buf))
    return parts


def translate_text(text: str, target_language: str) -> str:
    """Translate text into the requested language using Google Cloud Translation (v2)."""
    if not text:
        return text
    lang = _normalize_lang(target_language)
    if lang in ("en", "auto", ""):
        return text

    client = translate.Client()
    # Translate in chunks and rejoin to avoid long payload issues
    translated_chunks: List[str] = []
    for chunk in _chunk_text(text):
        result = client.translate(chunk, target_language=lang)
        translated_chunks.append(result.get("translatedText", chunk))
    return "".join(translated_chunks)