"""
Opportunity routes - CRUD operations for opportunities.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity as OpportunityModel
from app.models.opportunity import ApplicationType, ContractType
from app.schemas.opportunity import Opportunity, OpportunityCreate, OpportunityUpdate


router = APIRouter(prefix="/opportunities", tags=["opportunities"])


@router.get("/", response_model=List[Opportunity])
def get_opportunities(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    application_type: Optional[ApplicationType] = Query(None, description="Filter by application type"),
    contract_type: Optional[ContractType] = Query(None, description="Filter by contract type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of opportunities owned by the current user with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **company_id**: Optional filter by company ID
    - **application_type**: Optional filter by type (job_posting, spontaneous, etc.)
    - **contract_type**: Optional filter by contract (permanent, fixed_term, etc.)

    Returns only opportunities belonging to the authenticated user.
    """
    query = db.query(OpportunityModel).filter(
        OpportunityModel.owner_id == current_user.id
    )

    if company_id is not None:
        query = query.filter(OpportunityModel.company_id == company_id)

    if application_type is not None:
        query = query.filter(OpportunityModel.application_type == application_type)

    if contract_type is not None:
        query = query.filter(OpportunityModel.contract_type == contract_type)

    opportunities = query.offset(skip).limit(limit).all()
    return opportunities


@router.get("/{opportunity_id}", response_model=Opportunity)
def get_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific opportunity by ID.

    - **opportunity_id**: The ID of the opportunity to retrieve

    Returns 404 if opportunity doesn't exist or doesn't belong to the authenticated user.
    """
    opportunity = db.query(OpportunityModel).filter(
        OpportunityModel.id == opportunity_id,
        OpportunityModel.owner_id == current_user.id
    ).first()

    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return opportunity


@router.post("/", response_model=Opportunity, status_code=201)
def create_opportunity(
    opportunity: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new opportunity.

    - **job_title**: Job title (required)
    - **application_type**: Type of application (required)
    - **position_type**: Role type (optional)
    - **contract_type**: Type of contract (optional)
    - **company_id**: Associated company ID (optional)
    - ... and other optional details

    The opportunity will be automatically assigned to the authenticated user.
    """
    # Verify company exists and belongs to user if company_id is provided
    if opportunity.company_id is not None:
        from app.models.company import Company as CompanyModel
        company = db.query(CompanyModel).filter(
            CompanyModel.id == opportunity.company_id,
            CompanyModel.owner_id == current_user.id
        ).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with id {opportunity.company_id} not found")

    opportunity_data = opportunity.model_dump()
    opportunity_data['owner_id'] = current_user.id

    db_opportunity = OpportunityModel(**opportunity_data)
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    return db_opportunity


@router.put("/{opportunity_id}", response_model=Opportunity)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing opportunity.

    - **opportunity_id**: The ID of the opportunity to update
    - All fields are optional - only provided fields will be updated

    Returns 404 if opportunity doesn't exist or doesn't belong to the authenticated user.
    """
    db_opportunity = db.query(OpportunityModel).filter(
        OpportunityModel.id == opportunity_id,
        OpportunityModel.owner_id == current_user.id
    ).first()

    if not db_opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Verify company exists and belongs to user if company_id is being updated
    update_data = opportunity_update.model_dump(exclude_unset=True)
    if "company_id" in update_data and update_data["company_id"] is not None:
        from app.models.company import Company as CompanyModel
        company = db.query(CompanyModel).filter(
            CompanyModel.id == update_data["company_id"],
            CompanyModel.owner_id == current_user.id
        ).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with id {update_data['company_id']} not found")

    # Update only provided fields
    for field, value in update_data.items():
        setattr(db_opportunity, field, value)

    db.commit()
    db.refresh(db_opportunity)
    return db_opportunity


@router.delete("/{opportunity_id}", status_code=204)
def delete_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an opportunity.

    - **opportunity_id**: The ID of the opportunity to delete

    Returns 404 if opportunity doesn't exist or doesn't belong to the authenticated user.
    """
    db_opportunity = db.query(OpportunityModel).filter(
        OpportunityModel.id == opportunity_id,
        OpportunityModel.owner_id == current_user.id
    ).first()

    if not db_opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.delete(db_opportunity)
    db.commit()
    return None
