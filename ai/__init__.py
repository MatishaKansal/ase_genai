"""Thin wrapper to expose the main FastAPI app.

This module re-exports the app and app_state from ai/init.py to avoid
duplicated startup logic and ensure there's a single source of truth.
"""
try:
    # When imported as a package (e.g., "ai.__init__")
    from .init import app, app_state  # type: ignore  # noqa: F401
except Exception:
    # When executed from within the ai/ directory (module path lacks package context)
    from init import app, app_state  # type: ignore  # noqa: F401