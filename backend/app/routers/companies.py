"""
Company routes - CRUD operations for companies.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.company import Company as CompanyModel
from app.schemas.company import Company, CompanyCreate, CompanyUpdate
from app.utils.db import get_owned_entity_or_404


router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/", response_model=list[Company])
def get_companies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of companies owned by the current user with pagination.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)

    Returns only companies belonging to the authenticated user.
    """
    companies = db.query(CompanyModel).filter(
        CompanyModel.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return companies


@router.get("/{company_id}", response_model=Company)
def get_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific company by ID.

    - **company_id**: The ID of the company to retrieve

    Returns 404 if company doesn't exist or doesn't belong to the authenticated user.
    """
    company = get_owned_entity_or_404(
        db=db,
        entity_model=CompanyModel,
        entity_id=company_id,
        owner_id=current_user.id,
        entity_name="Company"
    )
    return company


@router.post("/", response_model=Company, status_code=201)
def create_company(
    company: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new company.

    - **name**: Company name (required)
    - **siret**: French business ID - 14 digits (optional)
    - **website**: Company website URL (optional)
    - **headquarters**: Company headquarters address (optional)
    - **is_intermediary**: Whether this is an intermediary company like ESN or agency (default: false)
    - **company_type**: Type of company: ESN, startup, enterprise, SME, etc. (optional)
    - **industry**: Industry sector: Healthcare, automotive, technology, etc. (optional)
    - **notes**: Additional notes (optional)

    The company will be automatically assigned to the authenticated user.
    """
    try:
        company_data = company.model_dump()
        company_data['owner_id'] = current_user.id

        db_company = CompanyModel(**company_data)
        db.add(db_company)
        db.commit()
        db.refresh(db_company)
        return db_company
    except IntegrityError as e:
        db.rollback()
        # Check for Postgres Unique Violation (pgcode 23505)
        if hasattr(e.orig, 'pgcode') and e.orig.pgcode == '23505':
            if "siret" in str(e.orig):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A company with SIRET {company.siret} already exists in your account."
                )
        # Other integrity errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error."
        )


@router.put("/{company_id}", response_model=Company)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing company.

    - **company_id**: The ID of the company to update
    - All fields are optional - only provided fields will be updated

    Returns 404 if company doesn't exist or doesn't belong to the authenticated user.
    """
    db_company = get_owned_entity_or_404(
        db=db,
        entity_model=CompanyModel,
        entity_id=company_id,
        owner_id=current_user.id,
        entity_name="Company"
    )

    # Update only provided fields
    update_data = company_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_company, field, value)

    try:
        db.commit()
        db.refresh(db_company)
        return db_company
    except IntegrityError as e:
        db.rollback()
        # Check for Postgres Unique Violation (pgcode 23505)
        if hasattr(e.orig, 'pgcode') and e.orig.pgcode == '23505':
            if "siret" in str(e.orig):
                siret_val = update_data.get('siret', 'provided')
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A company with SIRET {siret_val} already exists in your account."
                )
        # Other integrity errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error."
        )


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a company.

    - **company_id**: The ID of the company to delete

    Note: This will cascade delete all associated products.
    Opportunities and contacts will have their company_id set to NULL.

    Returns 404 if company doesn't exist or doesn't belong to the authenticated user.
    """
    db_company = get_owned_entity_or_404(
        db=db,
        entity_model=CompanyModel,
        entity_id=company_id,
        owner_id=current_user.id,
        entity_name="Company"
    )

    db.delete(db_company)
    db.commit()
    return
