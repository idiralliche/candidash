"""
Document-specific helper functions.

This module provides helpers for document file operations:
- File upload processing and validation
- File extension and MIME type detection
- Storage operations
"""
from typing import Tuple
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.models.document import DocumentFormat
from app.config import settings
from app.services.storage import get_storage_backend


def get_file_extension_or_400(filename: str) -> str:
    """
    Extract and validate file extension from filename.

    Args:
        filename: Original filename

    Returns:
        Lowercase file extension with dot (e.g., ".pdf")

    Raises:
        HTTPException 400: If file has no extension or extension not allowed
    """
    file_ext = Path(filename).suffix.lower()

    if not file_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have an extension"
        )

    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{file_ext}' is not allowed. Allowed extensions: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
        )

    return file_ext


async def get_mime_type_or_400(file: UploadFile) -> str:
    """
    Detect and validate MIME type from file content using python-magic.

    This performs strict validation based on actual file content,
    not just the file extension (which can be spoofed).

    Args:
        file: Uploaded file

    Returns:
        Detected MIME type (e.g., "application/pdf")

    Raises:
        HTTPException 400: If MIME type is not allowed
    """
    import magic

    # Read file content for MIME detection
    contents = await file.read()
    await file.seek(0)  # Reset pointer for later reading

    # Detect real MIME type from file content
    detected_mime = magic.from_buffer(contents, mime=True)

    if detected_mime not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{detected_mime}' is not allowed. Allowed types: {', '.join(sorted(settings.ALLOWED_MIME_TYPES))}"
        )

    return detected_mime


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and special characters.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Remove path separators and dangerous characters
    dangerous_chars = ['/', '\\', '..', '\0', '\n', '\r', '<', '>', ':', '"', '|', '?', '*']
    sanitized = filename

    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')

    # Limit length
    if len(sanitized) > 255:
        # Keep extension, truncate name
        from pathlib import Path
        ext = Path(sanitized).suffix
        name = Path(sanitized).stem[:200]
        sanitized = f"{name}{ext}"

    return sanitized


def get_document_format_or_400(file_extension: str) -> DocumentFormat:
    """
    Convert file extension to DocumentFormat enum.

    Args:
        file_extension: File extension with dot (e.g., ".pdf")

    Returns:
        DocumentFormat enum value

    Raises:
        HTTPException 400: If extension cannot be mapped to enum
    """
    format_str = file_extension.lstrip('.')

    try:
        return DocumentFormat(format_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {format_str}"
        )


async def save_uploaded_file(
    file_data: bytes,
    user_id: int,
    original_filename: str
) -> str:
    """
    Save file to storage backend.

    Args:
        file_data: Raw file bytes
        user_id: Owner user ID
        original_filename: Sanitized original filename

    Returns:
        Storage path (e.g., "/app/documents/42/uuid.pdf")
    """
    storage = get_storage_backend()
    file_path = await storage.save_file(
        file_data=file_data,
        user_id=user_id,
        original_filename=original_filename
    )
    return file_path


async def process_uploaded_file(
    file: UploadFile,
    user_id: int
) -> Tuple[str, DocumentFormat]:
    """
    Process uploaded file: validate, detect format, save to storage.

    This helper consolidates file processing logic without checking quota
    (quota check is done separately in router based on context).

    Validations performed:
    - File size (via validate_file_size)
    - MIME type (via get_mime_type_or_400)
    - File extension (via get_file_extension_or_400)
    - Filename sanitization (via sanitize_filename)

    Args:
        file: Uploaded file
        user_id: Owner user ID

    Returns:
        Tuple of (storage_path, document_format)

    Raises:
        HTTPException: If any validation fails
    """
    from app.utils.validators.document_validators import (
        validate_file_size,
        validate_mime_type,
    )

    # Validate file size
    await validate_file_size(file)

    # Validate and detect MIME type
    await validate_mime_type(file)

    # Validate and get file extension
    file_ext = get_file_extension_or_400(file.filename)

    # Get document format from extension
    document_format = get_document_format_or_400(file_ext)

    # Sanitize filename
    safe_filename = sanitize_filename(file.filename)

    # Read file data
    file_data = await file.read()

    # Save to storage
    file_path = await save_uploaded_file(
        file_data=file_data,
        user_id=user_id,
        original_filename=safe_filename
    )

    return file_path, document_format


async def delete_local_file_safe(file_path: str) -> None:
    """
    Delete a local file with error handling.

    Used after converting a document from local to external storage,
    or when deleting a document.

    Logs errors but doesn't raise exceptions (file might already be deleted).

    Args:
        file_path: Path to file to delete
    """
    storage = get_storage_backend()
    try:
        await storage.delete_file(file_path)
        print(f"✓ Deleted local file: {file_path}")
    except Exception as e:
        print(f"⚠ Warning: Could not delete file {file_path}: {e}")
