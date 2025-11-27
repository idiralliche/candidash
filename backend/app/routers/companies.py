"""
Company routes - CRUD operations for companies.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.company import Company as CompanyModel
from app.schemas.company import Company, CompanyCreate, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=List[Company])
def get_companies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of companies with pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    """
    companies = db.query(CompanyModel).offset(skip).limit(limit).all()
    return companies


@router.get("/{company_id}", response_model=Company)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific company by ID.

    - **company_id**: The ID of the company to retrieve
    """
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("/", response_model=Company, status_code=201)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """
    Create a new company.

    - **name**: Company name (required)
    - **industry**: Industry sector (optional)
    - **size**: Company size (optional)
    - **website**: Company website URL (optional)
    - **linkedin**: LinkedIn company page URL (optional)
    - **address**: Company address (optional)
    - **is_intermediary**: Whether this is an intermediary company (default: false)
    - **notes**: Additional notes (optional)
    """
    db_company = CompanyModel(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.put("/{company_id}", response_model=Company)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing company.

    - **company_id**: The ID of the company to update
    - All fields are optional - only provided fields will be updated
    """
    db_company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Update only provided fields
    update_data = company_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)

    db.commit()
    db.refresh(db_company)
    return db_company


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """
    Delete a company.

    - **company_id**: The ID of the company to delete
    """
    db_company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    db.delete(db_company)
    db.commit()
    return None
