"""
DocumentAssociation routes - CRUD operations for polymorphic document associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.document_association import DocumentAssociation as DocumentAssociationModel
from app.models.document_association import EntityType
from app.models.application import Application
from app.models.opportunity import Opportunity
from app.models.company import Company
from app.models.contact import Contact
from app.schemas.document_association import (
    DocumentAssociation,
    DocumentAssociationCreate
)
from app.utils.validators.ownership_validators import (
    validate_document_exists_and_owned,
    validate_entity_exists_and_owned
)

router = APIRouter(prefix="/document-associations", tags=["document_associations"])

def populate_polymorphic_entities(db: Session, associations: List[DocumentAssociationModel]):
    """
    Helper function to manually fetch and attach polymorphic entities to associations.
    This avoids N+1 queries by batching fetches by entity type.
    """
    if not associations:
        return

    # 1. Group IDs by type
    ids_by_type = {
        EntityType.APPLICATION: set(),
        EntityType.OPPORTUNITY: set(),
        EntityType.COMPANY: set(),
        EntityType.CONTACT: set()
    }

    for assoc in associations:
        if assoc.entity_type in ids_by_type:
            ids_by_type[assoc.entity_type].add(assoc.entity_id)

    # 2. Batch fetch entities
    fetched_entities = {} # Key: (type, id), Value: Model Instance

    # Applications
    if ids_by_type[EntityType.APPLICATION]:
        apps = db.query(Application).filter(Application.id.in_(ids_by_type[EntityType.APPLICATION])).all()
        for app in apps:
            fetched_entities[(EntityType.APPLICATION, app.id)] = app

    # Opportunities
    if ids_by_type[EntityType.OPPORTUNITY]:
        opps = db.query(Opportunity).filter(Opportunity.id.in_(ids_by_type[EntityType.OPPORTUNITY])).all()
        for opp in opps:
            fetched_entities[(EntityType.OPPORTUNITY, opp.id)] = opp

    # Companies
    if ids_by_type[EntityType.COMPANY]:
        comps = db.query(Company).filter(Company.id.in_(ids_by_type[EntityType.COMPANY])).all()
        for comp in comps:
            fetched_entities[(EntityType.COMPANY, comp.id)] = comp

    # Contacts
    if ids_by_type[EntityType.CONTACT]:
        conts = db.query(Contact).filter(Contact.id.in_(ids_by_type[EntityType.CONTACT])).all()
        for cont in conts:
            fetched_entities[(EntityType.CONTACT, cont.id)] = cont

    # 3. Attach entities to association objects
    # We set a temporary attribute on the model instance that Pydantic will read
    for assoc in associations:
        key = (assoc.entity_type, assoc.entity_id)
        if key in fetched_entities:
            assoc.entity = fetched_entities[key]
        else:
            assoc.entity = None


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
    query = db.query(DocumentAssociationModel).options(
        joinedload(DocumentAssociationModel.document)
    ).join(Document).filter(
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

    # Manually populate the polymorphic 'entity' field
    populate_polymorphic_entities(db, associations)

    return associations


@router.get("/{association_id}", response_model=DocumentAssociation)
def get_document_association(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific document association by ID with full entity details.

    - **association_id**: The ID of the association to retrieve

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    association = db.query(DocumentAssociationModel).options(
        joinedload(DocumentAssociationModel.document)
    ).join(Document).filter(
        DocumentAssociationModel.id == association_id,
        Document.owner_id == current_user.id
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DocumentAssociation not found"
        )

    # Manually populate the polymorphic 'entity' field
    populate_polymorphic_entities(db, [association])

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

    # Reload with document and entity for consistency
    db_association = db.query(DocumentAssociationModel).options(
        joinedload(DocumentAssociationModel.document)
    ).filter(DocumentAssociationModel.id == db_association.id).first()

    populate_polymorphic_entities(db, [db_association])

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
