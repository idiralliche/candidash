"""
Validators for document operations.
"""
import magic
import re
from pathlib import Path
from urllib.parse import urlparse
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.config import settings
from app.models.document import Document, DocumentFormat


async def validate_file_size(file: UploadFile) -> None:
    """
    Validate that uploaded file doesn't exceed maximum size.

    Args:
        file: Uploaded file to validate

    Raises:
        HTTPException 413: If file exceeds maximum size
    """
    # Read file to get size
    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)

    # Reset file pointer for later reading
    await file.seek(0)

    if file_size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size_mb:.2f} MB) exceeds maximum allowed size ({settings.MAX_FILE_SIZE_MB} MB)"
        )


async def validate_mime_type(file: UploadFile) -> str:
    """
    Validate file MIME type using python-magic (checks actual file content, not just extension).

    Args:
        file: Uploaded file to validate

    Returns:
        Detected MIME type

    Raises:
        HTTPException 400: If file type is not allowed
    """
    # Read file content for MIME detection
    contents = await file.read()
    await file.seek(0)  # Reset pointer

    # Detect real MIME type from file content
    detected_mime = magic.from_buffer(contents, mime=True)

    if detected_mime not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{detected_mime}' is not allowed. Allowed types: {', '.join(sorted(settings.ALLOWED_MIME_TYPES))}"
        )

    return detected_mime


def validate_file_extension(filename: str) -> str:
    """
    Validate file extension against allowed list.

    Args:
        filename: Original filename

    Returns:
        Lowercase file extension (e.g., ".pdf")

    Raises:
        HTTPException 400: If extension is not allowed
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


async def check_user_quota(db: Session, user_id: int) -> None:
    """
    Check if user has quota for uploading new documents.

    Args:
        db: Database session
        user_id: User ID to check quota for

    Raises:
        HTTPException 413: If user has reached document limit
    """
    # Count non-external documents (only local files count toward quota)
    doc_count = db.query(Document).filter(
        Document.owner_id == user_id,
        Document.is_external == False
    ).count()

    if doc_count >= settings.MAX_DOCUMENTS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Document limit reached ({settings.MAX_DOCUMENTS_PER_USER} documents). Please delete some documents before uploading new ones."
        )


def validate_external_url(url: str) -> None:
    """
    Validate that external URL uses safe protocol and is not pointing to private resources.

    Args:
        url: URL to validate

    Raises:
        ValueError: If URL is invalid or uses dangerous protocol/host
    """
    try:
        parsed = urlparse(url)
    except Exception:
        raise ValueError("Invalid URL format")

    # Only allow HTTP and HTTPS
    if parsed.scheme not in ['http', 'https']:
        raise ValueError(f"URL must use http or https protocol (got: {parsed.scheme})")

    # Block dangerous protocols that could execute code
    dangerous_schemes = ['javascript', 'data', 'file', 'vbscript']
    if parsed.scheme.lower() in dangerous_schemes:
        raise ValueError(f"URL protocol '{parsed.scheme}' is not allowed for security reasons")

    # Block localhost and loopback
    blocked_hosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
    if parsed.netloc.lower() in blocked_hosts:
        raise ValueError("Links to localhost are not allowed")

    # Block private IP ranges (RFC 1918)
    private_ip_patterns = [
        r'^10\.',           # 10.0.0.0/8
        r'^172\.(1[6-9]|2[0-9]|3[0-1])\.',  # 172.16.0.0/12
        r'^192\.168\.',     # 192.168.0.0/16
    ]

    for pattern in private_ip_patterns:
        if re.match(pattern, parsed.netloc):
            raise ValueError("Links to private IP addresses are not allowed")


def validate_path_format(path: str, is_external: bool) -> None:
    """
    Validate path format based on is_external flag.

    Args:
        path: Path or URL to validate
        is_external: Whether this is an external link

    Raises:
        ValueError: If path format is invalid for the given is_external value
    """
    if is_external:
        # External: must be a valid URL
        if not path.startswith(('http://', 'https://')):
            raise ValueError("External document path must be a valid HTTP or HTTPS URL")

        # Validate URL security
        validate_external_url(path)

    else:
        # Local: must NOT be a URL
        if path.startswith(('http://', 'https://', 'ftp://', 'file://')):
            raise ValueError("Local document path cannot be a URL. Set is_external=true for external links.")


def validate_format_consistency(format_value: DocumentFormat, is_external: bool) -> None:
    """
    Validate that format is consistent with is_external flag.

    Args:
        format_value: Document format enum value
        is_external: Whether this is an external link

    Raises:
        ValueError: If format and is_external are inconsistent
    """
    if is_external and format_value != DocumentFormat.EXTERNAL:
        raise ValueError("Format must be 'external' when is_external is True")

    if not is_external and format_value == DocumentFormat.EXTERNAL:
        raise ValueError("Format cannot be 'external' when is_external is False")


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
        ext = Path(sanitized).suffix
        name = Path(sanitized).stem[:200]
        sanitized = f"{name}{ext}"

    return sanitized
