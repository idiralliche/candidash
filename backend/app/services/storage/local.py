"""
Local filesystem storage implementation.
"""
import aiofiles
import uuid
from pathlib import Path
from app.services.storage.base import StorageBackend
from app.config import settings
from app.utils.validators.document_validators import sanitize_filename


class LocalStorage(StorageBackend):
    """
    Local filesystem storage implementation.

    Files are stored in: {DOCUMENTS_PATH}/{user_id}/{uuid}.{ext}
    Example: /app/documents/42/abc123-def456.pdf
    """

    def __init__(self):
        self.base_path = Path(settings.DOCUMENTS_PATH).resolve()
        # Ensure base directory exists
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _validate_file_path(self, file_path: str) -> Path:
        """
        Validate that file path is within allowed storage directory.

        Prevents path traversal attacks by ensuring resolved path
        is within base_path.

        Args:
            file_path: Path to validate

        Returns:
            Resolved absolute path

        Raises:
            ValueError: If path is outside storage directory
        """
        # Convert to absolute path and resolve symlinks
        full_path = Path(file_path).resolve()

        # Check that resolved path is within base_path
        try:
            full_path.relative_to(self.base_path)
        except ValueError:
            raise ValueError(f"Access denied: path outside storage directory")

        return full_path

    async def save_file(
        self,
        file_data: bytes,
        user_id: int,
        original_filename: str
    ) -> str:
        """
        Save file to local filesystem with UUID name.

        Args:
            file_data: Raw file bytes
            user_id: Owner user ID (used for directory organization)
            original_filename: Original filename to extract extension

        Returns:
            Relative storage path from app root (e.g., "app/documents/42/uuid.pdf")
        """
        # Create user directory
        user_dir = self.base_path / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)

        # Sanitize filename and extract extension
        safe_filename = sanitize_filename(original_filename)
        file_ext = Path(safe_filename).suffix.lower()

        # Ensure extension starts with dot
        if file_ext and not file_ext.startswith('.'):
            file_ext = f".{file_ext}"

        # Generate unique filename preserving extension
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = user_dir / unique_filename

        # Write file asynchronously
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_data)

        # Return relative path from app root
        return str(file_path)

    async def get_file(self, file_path: str) -> bytes:
        """
        Retrieve file from local filesystem.

        Args:
            file_path: Relative or absolute path to file

        Returns:
            File content as bytes

        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If path is outside storage directory
        """
        # Validate path is within storage directory
        full_path = self._validate_file_path(file_path)

        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        # Read file asynchronously
        async with aiofiles.open(full_path, 'rb') as f:
            return await f.read()

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete file from local filesystem.

        Args:
            file_path: Relative or absolute path to file

        Returns:
            True if file was deleted, False if not found

        Raises:
            ValueError: If path is outside storage directory
        """
        # Validate path is within storage directory
        full_path = self._validate_file_path(file_path)

        if not full_path.exists():
            return False

        # Additional check: ensure it's a file, not a directory
        if not full_path.is_file():
            raise ValueError(f"Cannot delete: not a file")

        full_path.unlink()
        return True

    async def file_exists(self, file_path: str) -> bool:
        """
        Check if file exists on local filesystem.

        Args:
            file_path: Relative or absolute path to file

        Returns:
            True if file exists, False otherwise
        """
        try:
            full_path = self._validate_file_path(file_path)
            return full_path.exists() and full_path.is_file()
        except ValueError:
            # Path outside storage directory
            return False
