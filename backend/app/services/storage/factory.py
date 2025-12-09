"""
Factory for instantiating storage backends.
"""
from app.services.storage.base import StorageBackend
from app.services.storage.local import LocalStorage


def get_storage_backend() -> StorageBackend:
    """
    Factory function to get the configured storage backend.

    Currently returns LocalStorage for MVP.
    Future: Add configuration switch for S3, Cloudflare R2, etc.

    Returns:
        Configured storage backend instance

    Example:
        storage = get_storage_backend()
        path = await storage.save_file(file_data, user_id, filename)
    """
    # MVP: Always return local storage
    # Future implementation:
    # if settings.STORAGE_BACKEND == "s3":
    #     return S3Storage()
    # elif settings.STORAGE_BACKEND == "r2":
    #     return CloudflareR2Storage()
    # else:
    #     return LocalStorage()

    return LocalStorage()
