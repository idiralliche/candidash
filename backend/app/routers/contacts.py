"""
Contact routes - CRUD operations for contacts.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.contact import Contact as ContactModel
from app.schemas.contact import Contact, ContactCreate, ContactUpdate

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("/", response_model=List[Contact])
def get_contacts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    is_independent_recruiter: Optional[bool] = Query(None, description="Filter by independent recruiter status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of contacts with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **company_id**: Optional filter by company ID
    - **is_independent_recruiter**: Optional filter by independent recruiter status
    """
    query = db.query(ContactModel)

    if company_id is not None:
        query = query.filter(ContactModel.company_id == company_id)

    if is_independent_recruiter is not None:
        query = query.filter(ContactModel.is_independent_recruiter == is_independent_recruiter)

    contacts = query.offset(skip).limit(limit).all()
    return contacts


@router.get("/{contact_id}", response_model=Contact)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific contact by ID.

    - **contact_id**: The ID of the contact to retrieve
    """
    contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("/", response_model=Contact, status_code=201)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """
    Create a new contact.

    - **last_name**: Contact's last name (required)
    - **first_name**: Contact's first name (required)
    - **position**: Job title or position (optional)
    - **email**: Email address (optional)
    - **phone**: Phone number (optional)
    - **linkedin**: LinkedIn profile URL (optional)
    - **relationship_notes**: How you know this person - e.g., "Contacted on LinkedIn", "Former colleague" (optional)
    - **is_independent_recruiter**: Whether this is an independent recruiter (default: false)
    - **notes**: Additional notes (optional)
    - **company_id**: Associated company ID (optional)
    """
    # Verify company exists if company_id is provided
    if contact.company_id is not None:
        from app.models.company import Company as CompanyModel
        company = db.query(CompanyModel).filter(CompanyModel.id == contact.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with id {contact.company_id} not found")

    db_contact = ContactModel(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.put("/{contact_id}", response_model=Contact)
def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing contact.

    - **contact_id**: The ID of the contact to update
    - All fields are optional - only provided fields will be updated
    """
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Verify company exists if company_id is being updated
    update_data = contact_update.model_dump(exclude_unset=True)
    if "company_id" in update_data and update_data["company_id"] is not None:
        from app.models.company import Company as CompanyModel
        company = db.query(CompanyModel).filter(CompanyModel.id == update_data["company_id"]).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with id {update_data['company_id']} not found")

    # Update only provided fields
    for field, value in update_data.items():
        setattr(db_contact, field, value)

    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """
    Delete a contact.

    - **contact_id**: The ID of the contact to delete
    """
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(db_contact)
    db.commit()
    return None
