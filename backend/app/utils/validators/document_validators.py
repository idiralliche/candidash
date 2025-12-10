"""
Validators for document operations.
"""
import re
from urllib.parse import urlparse
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


async def validate_mime_type(file: UploadFile) -> None:
    """
    Validate file MIME type (wrapper around get_mime_type_or_400).

    This validator uses get_mime_type_or_400 internally but doesn't return
    the MIME type, following the pattern of validate_* functions.

    Args:
        file: Uploaded file to validate

    Raises:
        HTTPException 400: If file type is not allowed
    """
    from app.utils.documents.helpers import get_mime_type_or_400
    await get_mime_type_or_400(file)


def validate_file_extension(filename: str) -> None:
    """
    Validate file extension (wrapper around get_file_extension_or_400).

    This validator uses get_file_extension_or_400 internally but doesn't return
    the extension, following the pattern of validate_* functions.

    Args:
        filename: Original filename

    Raises:
        HTTPException 400: If extension is not allowed or missing
    """
    from app.utils.documents.helpers import get_file_extension_or_400
    get_file_extension_or_400(filename)


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

    # Extract hostname (without port)
    hostname = parsed.netloc.split(':')[0].lower()

    # Block localhost and loopback
    blocked_hosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1']
    if hostname in blocked_hosts:
        raise ValueError("Links to localhost are not allowed")

    # Block private IP ranges (RFC 1918)
    private_ip_patterns = [
        r'^10\.',           # 10.0.0.0/8
        r'^172\.(1[6-9]|2[0-9]|3[0-1])\.',  # 172.16.0.0/12
        r'^192\.168\.',     # 192.168.0.0/16
    ]

    for pattern in private_ip_patterns:
        if re.match(pattern, hostname):
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


def validate_document_storage_update(
    db_document,
    new_is_external: bool,
    new_path: str,
    old_is_external: bool,
    old_path: str,
    path_provided: bool
) -> None:
    """
    Validate document storage migration scenarios in PUT endpoint.

    This validator checks the coherence of storage migration requests
    and automatically updates the format field when needed.

    Args:
        db_document: Document model instance
        new_is_external: New is_external value
        new_path: New path value
        old_is_external: Current is_external value
        old_path: Current path value
        path_provided: Whether path was provided in update

    Raises:
        HTTPException: If migration scenario is invalid
    """
    # Scenario 1: Trying to convert external → local
    if old_is_external and not new_is_external:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot convert external document to local via PUT. Use POST /documents/{id}/replace-file to upload a new file instead."
        )

    # Scenario 2: Converting local → external
    if not old_is_external and new_is_external:
        # Must provide new path (external URL)
        if not path_provided:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide 'path' (external URL) when setting is_external=true"
            )

        # Validate external URL
        try:
            validate_path_format(new_path, is_external=True)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

        # Auto-set format to 'external'
        db_document.format = DocumentFormat.EXTERNAL

    # Scenario 3: Updating external URL (external → external)
    if old_is_external and new_is_external and new_path != old_path:
        # Validate new external URL
        try:
            validate_path_format(new_path, is_external=True)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    # Scenario 4: Updating path for local document (local → local)
    if not old_is_external and not new_is_external and new_path != old_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change path for local documents. Delete and re-upload instead, or convert to external link."
        )
