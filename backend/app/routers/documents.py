"""
Document routes - CRUD operations for documents.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document as DocumentModel
from app.schemas.document import Document, DocumentCreate, DocumentUpdate

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/", response_model=List[Document])
def get_documents(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    type: str = Query(None, description="Filter by document type"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of documents with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **type**: Optional filter by document type (resume, cover_letter, portfolio, etc.)
    """
    query = db.query(DocumentModel)

    if type:
        query = query.filter(DocumentModel.type == type)

    documents = query.offset(skip).limit(limit).all()
    return documents


@router.get("/{document_id}", response_model=Document)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific document by ID.

    - **document_id**: The ID of the document to retrieve
    """
    document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/", response_model=Document, status_code=201)
def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    """
    Create a new document record.

    - **name**: Document name (required)
    - **type**: Document type - resume, cover_letter, portfolio, certificate, job_posting, other (required)
    - **format**: File format - pdf, docx, jpg, png, etc. (required)
    - **path**: Storage path or URL (required)
    - **description**: Free text description (optional)

    Note: This endpoint creates a document record. File upload functionality should be implemented separately.
    """
    db_document = DocumentModel(**document.model_dump())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


@router.put("/{document_id}", response_model=Document)
def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing document.

    - **document_id**: The ID of the document to update
    - All fields are optional - only provided fields will be updated
    """
    db_document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update only provided fields
    update_data = document_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_document, field, value)

    db.commit()
    db.refresh(db_document)
    return db_document


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Delete a document.

    - **document_id**: The ID of the document to delete

    Note: This deletes the document record. Physical file deletion should be handled separately.
    """
    db_document = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(db_document)
    db.commit()
    return None
