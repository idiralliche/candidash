"""
DocumentAssociation routes - CRUD operations for polymorphic document associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document_association import DocumentAssociation as DocumentAssociationModel
from app.models.document_association import EntityType
from app.schemas.document_association import (
    DocumentAssociation,
    DocumentAssociationCreate,
    DocumentAssociationUpdate
)

router = APIRouter(prefix="/document-associations", tags=["document_associations"])


@router.get("/", response_model=List[DocumentAssociation])
def get_document_associations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    document_id: Optional[int] = Query(None, description="Filter by document ID"),
    entity_type: Optional[EntityType] = Query(None, description="Filter by entity type"),
    entity_id: Optional[int] = Query(None, description="Filter by entity ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of document associations with pagination and filtering.

    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **document_id**: Optional filter by document
    - **entity_type**: Optional filter by entity type
    - **entity_id**: Optional filter by entity ID
    """
    query = db.query(DocumentAssociationModel)

    if document_id is not None:
        query = query.filter(DocumentAssociationModel.document_id == document_id)

    if entity_type is not None:
        query = query.filter(DocumentAssociationModel.entity_type == entity_type)

    if entity_id is not None:
        query = query.filter(DocumentAssociationModel.entity_id == entity_id)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=DocumentAssociation)
def get_document_association(association_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific association by ID.

    - **association_id**: The ID of the association to retrieve
    """
    association = db.query(DocumentAssociationModel).filter(DocumentAssociationModel.id == association_id).first()
    if not association:
        raise HTTPException(status_code=404, detail="DocumentAssociation not found")
    return association


def validate_polymorphic_reference(db: Session, entity_type: EntityType, entity_id: int):
    """Helper to validate that the referenced entity exists dynamically."""
    model = None

    if entity_type == EntityType.APPLICATION:
        from app.models.application import Application
        model = Application
    elif entity_type == EntityType.OPPORTUNITY:
        from app.models.opportunity import Opportunity
        model = Opportunity
    elif entity_type == EntityType.COMPANY:
        from app.models.company import Company
        model = Company
    elif entity_type == EntityType.CONTACT:
        from app.models.contact import Contact
        model = Contact

    if model:
        exists = db.query(model).filter(model.id == entity_id).first()
        if not exists:
            raise HTTPException(
                status_code=404,
                detail=f"Referenced entity {entity_type.value} with id {entity_id} not found"
            )


def validate_foreign_keys(
    db: Session,
    document_id: Optional[int] = None,
    entity_type: Optional[EntityType] = None,
    entity_id: Optional[int] = None
):
    """Helper to validate all foreign keys including polymorphic ones."""
    if document_id is not None:
        from app.models.document import Document
        if not db.query(Document).filter(Document.id == document_id).first():
            raise HTTPException(status_code=404, detail=f"Document with id {document_id} not found")

    # Only validate entity reference if both type and id are provided
    if entity_type is not None and entity_id is not None:
        validate_polymorphic_reference(db, entity_type, entity_id)


@router.post("/", response_model=DocumentAssociation, status_code=201)
def create_document_association(association: DocumentAssociationCreate, db: Session = Depends(get_db)):
    """
    Create a new link between a document and any entity.

    - **document_id**: ID of the document (required)
    - **entity_type**: Type of entity (application, opportunity, company, contact)
    - **entity_id**: ID of the entity (required)
    """
    # Verify FKs
    validate_foreign_keys(
        db,
        document_id=association.document_id,
        entity_type=association.entity_type,
        entity_id=association.entity_id
    )

    db_association = DocumentAssociationModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.put("/{association_id}", response_model=DocumentAssociation)
def update_document_association(
    association_id: int,
    association_update: DocumentAssociationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing association.

    - **association_id**: The ID of the association to update
    - All fields are optional
    """
    db_association = db.query(DocumentAssociationModel).filter(DocumentAssociationModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="DocumentAssociation not found")

    update_data = association_update.model_dump(exclude_unset=True)

    # Check validation for FKs if they are present in update data
    # Note: If updating only type or only id, we must check consistency with existing data
    # For safety, we check the new combination or the combination of new+old

    check_type = update_data.get("entity_type", db_association.entity_type)
    check_id = update_data.get("entity_id", db_association.entity_id)

    validate_foreign_keys(
        db,
        document_id=update_data.get("document_id"),
        entity_type=check_type,
        entity_id=check_id
    )

    for field, value in update_data.items():
        setattr(db_association, field, value)

    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=204)
def delete_document_association(association_id: int, db: Session = Depends(get_db)):
    """
    Delete an association.

    - **association_id**: The ID of the association to delete
    """
    db_association = db.query(DocumentAssociationModel).filter(DocumentAssociationModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="DocumentAssociation not found")

    db.delete(db_association)
    db.commit()
    return None
