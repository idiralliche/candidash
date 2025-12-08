"""
DocumentAssociation routes - CRUD operations for polymorphic document associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.document_association import DocumentAssociation as DocumentAssociationModel
from app.models.document_association import EntityType
from app.schemas.document_association import (
    DocumentAssociation,
    DocumentAssociationCreate
)
from app.utils.validators.ownership_validators import (
    validate_document_exists_and_owned,
    validate_entity_exists_and_owned
)

router = APIRouter(prefix="/document-associations", tags=["document_associations"])


@router.get("/", response_model=List[DocumentAssociation])
def get_document_associations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    document_id: Optional[int] = Query(None, description="Filter by document ID"),
    entity_type: Optional[EntityType] = Query(None, description="Filter by entity type"),
    entity_id: Optional[int] = Query(None, description="Filter by entity ID (requires entity_type)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of document associations owned by the current user with pagination and filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **document_id**: Optional filter by document ID
    - **entity_type**: Optional filter by entity type
    - **entity_id**: Optional filter by entity ID (requires entity_type to be specified)

    Returns only associations where the document belongs to the authenticated user.
    """
    # Strict validation: entity_id requires entity_type
    if entity_id is not None and entity_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="entity_type is required when filtering by entity_id"
        )

    # Filter by document ownership
    query = db.query(DocumentAssociationModel).join(Document).filter(
        Document.owner_id == current_user.id
    )

    if document_id is not None:
        validate_document_exists_and_owned(db, document_id, current_user)
        query = query.filter(DocumentAssociationModel.document_id == document_id)

    if entity_type is not None:
        query = query.filter(DocumentAssociationModel.entity_type == entity_type)

    if entity_id is not None:
        # Validate entity ownership (entity_type already validated as not None)
        validate_entity_exists_and_owned(db, entity_type, entity_id, current_user)
        query = query.filter(DocumentAssociationModel.entity_id == entity_id)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=DocumentAssociation)
def get_document_association(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific document association by ID.

    - **association_id**: The ID of the association to retrieve

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    association = db.query(DocumentAssociationModel).join(Document).filter(
        DocumentAssociationModel.id == association_id,
        Document.owner_id == current_user.id
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DocumentAssociation not found"
        )

    return association


@router.post("/", response_model=DocumentAssociation, status_code=status.HTTP_201_CREATED)
def create_document_association(
    association: DocumentAssociationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new link between a document and any entity.

    - **document_id**: ID of the document (required)
    - **entity_type**: Type of entity (application, opportunity, company, contact)
    - **entity_id**: ID of the entity (required)

    Both document and entity must belong to the authenticated user.
    The association will be timestamped automatically.
    """
    # Validate document ownership
    validate_document_exists_and_owned(db, association.document_id, current_user)

    # Validate entity ownership (polymorphic)
    validate_entity_exists_and_owned(
        db, association.entity_type, association.entity_id, current_user
    )

    db_association = DocumentAssociationModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_association(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document association.

    - **association_id**: The ID of the association to delete

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    db_association = db.query(DocumentAssociationModel).join(Document).filter(
        DocumentAssociationModel.id == association_id,
        Document.owner_id == current_user.id
    ).first()

    if not db_association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DocumentAssociation not found"
        )

    db.delete(db_association)
    db.commit()
    return
