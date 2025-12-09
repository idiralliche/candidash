"""
Storage services for document file management.
"""
from app.services.storage.factory import get_storage_backend

__all__ = ["get_storage_backend"]
