"""
OpportunityContact routes - CRUD operations for opportunity-contact associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.opportunity_contact import OpportunityContact as OpportunityContactModel
from app.schemas.opportunity_contact import (
    OpportunityContact,
    OpportunityContactCreate,
    OpportunityContactUpdate
)

router = APIRouter(prefix="/opportunity-contacts", tags=["opportunity_contacts"])


@router.get("/", response_model=List[OpportunityContact])
def get_opportunity_contacts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    contact_id: Optional[int] = Query(None, description="Filter by contact ID"),
    is_primary_contact: Optional[bool] = Query(None, description="Filter by primary contact status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of opportunity-contact associations with pagination and filtering.

    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **opportunity_id**: Optional filter by opportunity
    - **contact_id**: Optional filter by contact
    - **is_primary_contact**: Optional filter by primary status
    """
    query = db.query(OpportunityContactModel)

    if opportunity_id is not None:
        query = query.filter(OpportunityContactModel.opportunity_id == opportunity_id)

    if contact_id is not None:
        query = query.filter(OpportunityContactModel.contact_id == contact_id)

    if is_primary_contact is not None:
        query = query.filter(OpportunityContactModel.is_primary_contact == is_primary_contact)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=OpportunityContact)
def get_opportunity_contact(association_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific association by ID.

    - **association_id**: The ID of the association to retrieve
    """
    association = db.query(OpportunityContactModel).filter(OpportunityContactModel.id == association_id).first()
    if not association:
        raise HTTPException(status_code=404, detail="OpportunityContact association not found")
    return association


def validate_foreign_keys(db: Session, opportunity_id: Optional[int] = None, contact_id: Optional[int] = None):
    """Helper to validate foreign keys existence."""
    if opportunity_id is not None:
        from app.models.opportunity import Opportunity
        if not db.query(Opportunity).filter(Opportunity.id == opportunity_id).first():
            raise HTTPException(status_code=404, detail=f"Opportunity with id {opportunity_id} not found")

    if contact_id is not None:
        from app.models.contact import Contact
        if not db.query(Contact).filter(Contact.id == contact_id).first():
            raise HTTPException(status_code=404, detail=f"Contact with id {contact_id} not found")


@router.post("/", response_model=OpportunityContact, status_code=201)
def create_opportunity_contact(association: OpportunityContactCreate, db: Session = Depends(get_db)):
    """
    Create a new link between an opportunity and a contact.

    - **opportunity_id**: ID of the opportunity (required)
    - **contact_id**: ID of the contact (required)
    - **is_primary_contact**: Primary contact flag (default: false)
    - **contact_role**: Role description (optional)
    """
    # Verify FKs
    validate_foreign_keys(
        db,
        opportunity_id=association.opportunity_id,
        contact_id=association.contact_id
    )

    db_association = OpportunityContactModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.put("/{association_id}", response_model=OpportunityContact)
def update_opportunity_contact(
    association_id: int,
    association_update: OpportunityContactUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing association.

    - **association_id**: The ID of the association to update
    - All fields are optional
    """
    db_association = db.query(OpportunityContactModel).filter(OpportunityContactModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="OpportunityContact association not found")

    update_data = association_update.model_dump(exclude_unset=True)

    # Check validation for FKs if they are present in update data
    validate_foreign_keys(
        db,
        opportunity_id=update_data.get("opportunity_id"),
        contact_id=update_data.get("contact_id")
    )

    for field, value in update_data.items():
        setattr(db_association, field, value)

    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=204)
def delete_opportunity_contact(association_id: int, db: Session = Depends(get_db)):
    """
    Delete an association.

    - **association_id**: The ID of the association to delete
    """
    db_association = db.query(OpportunityContactModel).filter(OpportunityContactModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="OpportunityContact association not found")

    db.delete(db_association)
    db.commit()
    return None
