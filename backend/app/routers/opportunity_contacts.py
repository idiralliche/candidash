"""
OpportunityContact routes - CRUD operations for opportunity-contact associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.opportunity_contact import OpportunityContact as OpportunityContactModel
from app.schemas.opportunity_contact import (
    OpportunityContact,
    OpportunityContactCreate,
    OpportunityContactUpdate
)
from app.utils.validators.ownership_validators import (
    validate_opportunity_exists_and_owned,
    validate_contact_exists_and_owned
)

router = APIRouter(prefix="/opportunity-contacts", tags=["opportunity_contacts"])


@router.get("/", response_model=List[OpportunityContact])
def get_opportunity_contacts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    contact_id: Optional[int] = Query(None, description="Filter by contact ID"),
    is_primary_contact: Optional[bool] = Query(None, description="Filter by primary contact status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of opportunity-contact associations owned by the current user with pagination and filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **opportunity_id**: Optional filter by opportunity ID
    - **contact_id**: Optional filter by contact ID
    - **is_primary_contact**: Optional filter by primary contact status

    Returns only associations where the opportunity belongs to the authenticated user.
    """
    query = db.query(OpportunityContactModel).join(
        OpportunityContactModel.opportunity
    ).filter(
        Opportunity.owner_id == current_user.id
    )

    if opportunity_id is not None:
        validate_opportunity_exists_and_owned(db, opportunity_id, current_user)
        query = query.filter(OpportunityContactModel.opportunity_id == opportunity_id)

    if contact_id is not None:
        validate_contact_exists_and_owned(db, contact_id, current_user)
        query = query.filter(OpportunityContactModel.contact_id == contact_id)

    if is_primary_contact is not None:
        query = query.filter(OpportunityContactModel.is_primary_contact == is_primary_contact)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=OpportunityContact)
def get_opportunity_contact(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific opportunity-contact association by ID.

    - **association_id**: The ID of the association to retrieve

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    association = db.query(OpportunityContactModel).join(
        OpportunityContactModel.opportunity
    ).filter(
        OpportunityContactModel.id == association_id,
        Opportunity.owner_id == current_user.id
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OpportunityContact association not found"
        )

    return association


@router.post("/", response_model=OpportunityContact, status_code=status.HTTP_201_CREATED)
def create_opportunity_contact(
    association: OpportunityContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new link between an opportunity and a contact.

    - **opportunity_id**: ID of the opportunity (required)
    - **contact_id**: ID of the contact (required)
    - **is_primary_contact**: Primary contact flag (default: false)
    - **contact_role**: Role description (optional)
    - **origin**: How contact is related (optional)
    - **notes**: Contextual notes (optional)

    Both opportunity and contact must belong to the authenticated user.
    The association will be timestamped automatically.
    """
    # Validate ownership of both entities (ensures same owner_id)
    validate_opportunity_exists_and_owned(db, association.opportunity_id, current_user)
    validate_contact_exists_and_owned(db, association.contact_id, current_user)

    db_association = OpportunityContactModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.put("/{association_id}", response_model=OpportunityContact)
def update_opportunity_contact(
    association_id: int,
    association_update: OpportunityContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing opportunity-contact association.

    - **association_id**: The ID of the association to update
    - All metadata fields are optional (is_primary_contact, contact_role, origin, notes)
    - **Note**: Foreign keys (opportunity_id, contact_id) cannot be modified

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    db_association = db.query(OpportunityContactModel).join(
        OpportunityContactModel.opportunity
    ).filter(
        OpportunityContactModel.id == association_id,
        Opportunity.owner_id == current_user.id
    ).first()

    if not db_association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OpportunityContact association not found"
        )

    update_data = association_update.model_dump(exclude_unset=True)

    # Update metadata fields only (FK are immutable)
    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_association, field, value)

    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity_contact(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an opportunity-contact association.

    - **association_id**: The ID of the association to delete

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    db_association = db.query(OpportunityContactModel).join(
        OpportunityContactModel.opportunity
    ).filter(
        OpportunityContactModel.id == association_id,
        Opportunity.owner_id == current_user.id
    ).first()

    if not db_association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OpportunityContact association not found"
        )

    db.delete(db_association)
    db.commit()
    return
