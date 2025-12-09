"""
Abstract base class for storage backends.
"""
from abc import ABC, abstractmethod


class StorageBackend(ABC):
    """
    Abstract base class for file storage backends.

    Allows switching between local filesystem, S3, Cloudflare R2, etc.
    without changing business logic in routers or services.
    """

    @abstractmethod
    async def save_file(
        self,
        file_data: bytes,
        user_id: int,
        original_filename: str
    ) -> str:
        """
        Save a file and return its storage path.

        Args:
            file_data: Raw file bytes
            user_id: Owner user ID (used for directory organization)
            original_filename: Original filename with extension

        Returns:
            Storage path (e.g., "app/documents/123/abc-def-ghi.pdf")

        Raises:
            IOError: If file cannot be saved
        """
        pass

    @abstractmethod
    async def get_file(self, file_path: str) -> bytes:
        """
        Retrieve file content by path.

        Args:
            file_path: Storage path returned by save_file()

        Returns:
            File content as bytes

        Raises:
            FileNotFoundError: If file doesn't exist at path
        """
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """
        Delete a file by path.

        Args:
            file_path: Storage path

        Returns:
            True if file was deleted, False if not found
        """
        pass

    @abstractmethod
    async def file_exists(self, file_path: str) -> bool:
        """
        Check if file exists at path.

        Args:
            file_path: Storage path

        Returns:
            True if file exists, False otherwise
        """
        pass
