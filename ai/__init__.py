"""Thin wrapper to expose the main FastAPI app.

This module re-exports the app and app_state from ai/init.py to avoid
duplicated startup logic and ensure there's a single source of truth.
"""

from .init import app, app_state  # noqa: F401