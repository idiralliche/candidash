"""
Document routes - CRUD operations for documents.
"""
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document as DocumentModel
from app.schemas.document import Document, DocumentCreate, DocumentUpdate
from app.utils.db import get_owned_entity_or_404

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
    Create a new document record.

    - **name**: Document name (required)
    - **type**: Document type - resume, cover_letter, portfolio, certificate, job_posting, other (required)
    - **format**: File format - pdf, docx, jpg, png, etc. (required)
    - **path**: Storage path or URL (required)
    - **description**: Free text description (optional)

    Note: This endpoint creates a document record. File upload functionality should be implemented separately.
    The document will be automatically assigned to the authenticated user.
    """
    document_data = document.model_dump()
    document_data['owner_id'] = current_user.id

    db_document = DocumentModel(**document_data)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.put("/{document_id}", response_model=Document)
def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing document.

    - **document_id**: The ID of the document to update
    - All fields are optional - only provided fields will be updated

    Returns 404 if document doesn't exist or doesn't belong to the authenticated user.
    """
    db_document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    # Update only provided fields
    update_data = document_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_document, field, value)

    db.commit()
    db.refresh(db_document)
    return db_document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document.

    - **document_id**: The ID of the document to delete

    Note: This deletes the document record. Physical file deletion should be handled separately.

    Returns 404 if document doesn't exist or doesn't belong to the authenticated user.
    """
    db_document = get_owned_entity_or_404(
        db=db,
        entity_model=DocumentModel,
        entity_id=document_id,
        owner_id=current_user.id,
        entity_name="Document"
    )

    db.delete(db_document)
    db.commit()
    return
