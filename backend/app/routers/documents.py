"""
Document routes - CRUD operations for documents.
"""
from typing import List
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document as DocumentModel, DocumentFormat
from app.schemas.document import Document, DocumentCreate, DocumentUpdate
from app.utils.db import get_owned_entity_or_404
from app.utils.validators.document_validators import (
    check_user_quota,
    validate_document_storage_update,
)
from app.utils.documents import (
    process_uploaded_file,
    delete_local_file_safe,
)
from app.services.storage import get_storage_backend
from app.config import settings


router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=List[Document])
def get_documents(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of documents owned by the current user with pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)

    Returns only documents belonging to the authenticated user.
    """
    query = db.query(DocumentModel).filter(
        DocumentModel.owner_id == current_user.id
    )
    documents = query.offset(skip).limit(limit).all()
    return documents


@router.get("/{document_id}", response_model=Document)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific document by ID.

    - **document_id**: The ID of the document to retrieve

    Returns 404 if document doesn't exist or doesn't belong to the authenticated user.
    """
    document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )
    return document


@router.post("/", response_model=Document, status_code=status.HTTP_201_CREATED)
def create_document(
    document: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new document record (for external links only).

    **Request Body:**
    - **name**: Document name (required, 1-255 chars)
    - **type**: Document type - resume, cover_letter, portfolio, certificate, job_posting, other (required)
    - **format**: Must be 'external' for external links (required)
    - **path**: External URL - must be HTTP or HTTPS from public domains (required)
    - **is_external**: Must be true (required)
    - **description**: Free text description (optional, max 5000 chars)

    **Automatic Validations (performed by Pydantic in DocumentCreate schema):**
    - Path must be a valid HTTP/HTTPS URL when is_external=true
      (see @field_validator('path') in schemas/document.py → validate_path_format())
    - Format must be 'external' when is_external=true
      (see @field_validator('format') in schemas/document.py → validate_format_consistency())
    - URL must not point to localhost or private IP addresses (security)
      (see validators/document_validators.py → validate_external_url())
    - Dangerous protocols (javascript:, data:, file:) are blocked
      (see validators/document_validators.py → validate_external_url())

    **For File Uploads:**
    Use POST /documents/upload instead of this endpoint.

    **Returns:**
    - **201**: Document created successfully

    **Raises:**
    - **422**: Validation error (invalid format, localhost URL, missing required fields, etc.)
    - **401**: Unauthorized (not authenticated)

    The document will be automatically assigned to the authenticated user.
    """
    # Note: Validation of is_external, format, and path happens BEFORE entering this function
    # via Pydantic field_validators in DocumentCreate schema (schemas/document.py)
    # If validation fails, FastAPI returns 422 automatically

    document_data = document.model_dump()
    document_data['owner_id'] = current_user.id

    db_document = DocumentModel(**document_data)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.post("/upload", response_model=Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(..., description="File to upload"),
    name: str = Form(..., min_length=1, max_length=255, description="Document name"),
    type: str = Form(..., min_length=1, max_length=50, description="Document type"),
    description: str = Form(None, max_length=5000, description="Optional description"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document file (local storage).

    **Form Fields:**
    - **file**: File to upload (multipart/form-data, required)
    - **name**: Document name (required, 1-255 chars)
    - **type**: Document type - resume, cover_letter, portfolio, certificate, job_posting, other (required)
    - **description**: Optional description (max 5000 chars)

    **Supported File Formats:**
    - Documents: PDF, DOC, DOCX, RTF, TXT, MD, ODT
    - Presentations: PPT, PPTX, ODP
    - Spreadsheets: XLS, XLSX, ODS, CSV, TSV
    - Images: JPG, PNG, GIF, WEBP
    - Data: JSON

    **Automatic Validations (performed in process_uploaded_file helper):**
    - File size must not exceed 10 MB
    - MIME type validation using file content analysis (python-magic)
    - File extension must be in allowed list
    - Filename sanitization (prevents path traversal attacks)

    **Quota Check:**
    - Max 500 documents per user (check_user_quota)

    **Storage:**
    Files are stored as: {DOCUMENTS_PATH}/{user_id}/{uuid}.{extension}

    **Returns:**
    - **201**: Document uploaded and created successfully

    **Raises:**
    - **400**: Invalid file type or extension
    - **401**: Unauthorized (not authenticated)
    - **413**: File too large or quota exceeded
    - **422**: Validation error (missing fields, etc.)

    The document will be automatically assigned to the authenticated user.
    """
    # Check user quota
    await check_user_quota(db, current_user.id)

    # Process and save file (includes all validations)
    file_path, document_format = await process_uploaded_file(
        file=file,
        user_id=current_user.id
    )

    # Create document record
    db_document = DocumentModel(
        name=name,
        type=type,
        format=document_format,
        path=file_path,
        description=description,
        is_external=False,
        owner_id=current_user.id
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return db_document


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a document or redirect to external link.

    **Parameters:**
    - **document_id**: The ID of the document to download (required)

    **Behavior:**
    - **Local files** (is_external=false): Returns file with appropriate Content-Type
      * Browser will display if possible (PDF, images)
      * User can download via browser's download button
      * Content-Disposition: inline with original filename

    - **External links** (is_external=true): Redirects to external URL (307 redirect)

    **Returns:**
    - **200**: File streamed successfully (local files)
    - **307**: Temporary redirect to external URL (external links)

    **Raises:**
    - **401**: Unauthorized (not authenticated)
    - **404**: Document not found, doesn't belong to user, or file missing on storage

    Only documents belonging to the authenticated user can be accessed.
    """
    # Get document with ownership check
    document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    # Handle external links: redirect to external URL
    if document.is_external:
        return RedirectResponse(url=document.path, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    # Handle local files: stream file content
    storage = get_storage_backend()

    # Check file exists
    if not await storage.file_exists(document.path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found on storage: {document.path}"
        )

    # Determine MIME type from format
    format_str = document.format.value
    media_type = settings.EXTENSION_TO_MIME.get(format_str, "application/octet-stream")

    # Return file with appropriate headers
    return FileResponse(
        path=document.path,
        media_type=media_type,
        filename=document.name,
        headers={
            "Content-Disposition": f'inline; filename="{document.name}"'
        }
    )


@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing document's metadata and/or storage location.

    **Updatable Fields:**
    - **name**: Document name
    - **type**: Document type
    - **description**: Description
    - **path**: Storage path/URL (see storage migration below)
    - **is_external**: Storage type (local or external)

    **Storage Migration Scenarios:**

    1. **Local → External** (e.g., uploaded file → Google Drive link):
       - Set `is_external: true` and `path: "https://drive.google.com/..."`
       - Local file will be automatically deleted
       - Format automatically set to 'external'

    2. **External → External** (e.g., Google Drive → OneDrive):
       - Update `path: "https://onedrive.live.com/..."`
       - Keep `is_external: true` (or omit)

    3. **External → Local** (e.g., Drive link → uploaded file):
       - NOT supported via PUT (would require file upload)
       - Use dedicated endpoint: POST /documents/{id}/replace-file

    **Validations:**
    - External URLs must be HTTPS from public domains (no localhost/private IPs)
    - Path and is_external must be coherent (validated in validate_document_storage_update)
    - Cannot make a document external without providing a valid URL

    **Returns:**
    - **200**: Document updated successfully

    **Raises:**
    - **400**: Invalid update (incoherent path/is_external, invalid URL, etc.)
    - **401**: Unauthorized
    - **404**: Document not found
    """
    db_document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    # Get update data
    update_data = document_update.model_dump(exclude_unset=True)

    # Track storage migration
    old_is_external = db_document.is_external
    old_path = db_document.path
    new_is_external = update_data.get('is_external', old_is_external)
    new_path = update_data.get('path', old_path)
    path_provided = 'path' in update_data

    # Validate storage migration scenarios (if path or is_external changed)
    if 'is_external' in update_data or 'path' in update_data:
        validate_document_storage_update(
            db_document=db_document,
            new_is_external=new_is_external,
            new_path=new_path,
            old_is_external=old_is_external,
            old_path=old_path,
            path_provided=path_provided
        )

    # Apply updates (format is managed in validate_document_storage_update)
    for field, value in update_data.items():
        if field not in ['owner_id', 'format']:
            setattr(db_document, field, value)

    db.commit()
    db.refresh(db_document)

    # Delete old local file if converted to external
    if not old_is_external and new_is_external:
        await delete_local_file_safe(old_path)

    return db_document


@router.post("/{document_id}/replace-file", response_model=Document, status_code=status.HTTP_200_OK)
async def replace_file(
    document_id: int,
    file: UploadFile = File(..., description="New file to upload"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Replace an external document with an uploaded file (external → local conversion).

    **Use Case:**
    User has an external link (Google Drive, OneDrive, etc.) and wants to store
    the file directly on CandiDash instead, while keeping the same document ID
    and metadata (name, type, description).

    **Process:**
    1. User downloads file from external source manually
    2. User uploads file via this endpoint
    3. Document keeps same ID, name, type, description
    4. Only path, format, is_external change

    **Validations (performed in process_uploaded_file helper):**
    - File size must not exceed 10 MB
    - MIME type validation with python-magic
    - File extension must be allowed
    - Filename sanitization

    **Quota Check:**
    - Max 500 documents per user (check_user_quota)
    - Document must currently be external (is_external=true)

    **Returns:**
    - **200**: File uploaded and document converted successfully

    **Raises:**
    - **400**: Document is already local, or file validation failed
    - **401**: Unauthorized
    - **404**: Document not found
    - **413**: File too large or quota exceeded
    """
    # Get document
    db_document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    # Check is external
    if not db_document.is_external:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is already stored locally. Delete and re-upload to replace the file."
        )

    # Check user quota
    await check_user_quota(db, current_user.id)

    # Process and save file (includes all validations)
    file_path, document_format = await process_uploaded_file(
        file=file,
        user_id=current_user.id
    )

    # Update document (keep name, type, description)
    db_document.path = file_path
    db_document.format = document_format
    db_document.is_external = False

    db.commit()
    db.refresh(db_document)

    return db_document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document permanently.

    **Parameters:**
    - **document_id**: The ID of the document to delete (required)

    **Behavior:**
    - **Local files** (is_external=false): Deletes both database record AND physical file
    - **External links** (is_external=true): Deletes only database record (URL not affected)

    **Note:** Deletion is permanent and cannot be undone.
    If the physical file is already missing (local files), the database record is still deleted.

    **Returns:**
    - **204**: Document deleted successfully (no content)

    **Raises:**
    - **401**: Unauthorized (not authenticated)
    - **404**: Document not found or doesn't belong to user

    Only documents belonging to the authenticated user can be deleted.
    """
    db_document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    # Delete physical file if local
    if not db_document.is_external:
        await delete_local_file_safe(db_document.path)

    # Delete database record
    db.delete(db_document)
    db.commit()
    return
