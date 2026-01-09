"""
OpportunityProduct routes - CRUD operations for opportunity-product associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.opportunity_product import OpportunityProduct as OpportunityProductModel
from app.schemas.opportunity_product import (
    OpportunityProduct,
    OpportunityProductCreate
)
from app.utils.validators.ownership_validators import (
    validate_opportunity_exists_and_owned,
    validate_product_exists_and_owned
)

router = APIRouter(prefix="/opportunity-products", tags=["opportunity_products"])


@router.get("/", response_model=List[OpportunityProduct])
def get_opportunity_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of opportunity-product associations owned by the current user with pagination and filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **opportunity_id**: Optional filter by opportunity ID
    - **product_id**: Optional filter by product ID

    Returns only associations where the opportunity belongs to the authenticated user.
    """
    query = db.query(OpportunityProductModel).options(
        joinedload(OpportunityProductModel.product),
        joinedload(OpportunityProductModel.opportunity)
    ).join(
        OpportunityProductModel.opportunity
    ).filter(
        Opportunity.owner_id == current_user.id
    )

    if opportunity_id is not None:
        validate_opportunity_exists_and_owned(db, opportunity_id, current_user)
        query = query.filter(OpportunityProductModel.opportunity_id == opportunity_id)

    if product_id is not None:
        validate_product_exists_and_owned(db, product_id, current_user)
        query = query.filter(OpportunityProductModel.product_id == product_id)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=OpportunityProduct)
def get_opportunity_product(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific opportunity-product association by ID.

    - **association_id**: The ID of the association to retrieve

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    association = db.query(OpportunityProductModel).options(
        joinedload(OpportunityProductModel.product),
        joinedload(OpportunityProductModel.opportunity)
    ).join(
        OpportunityProductModel.opportunity
    ).filter(
        OpportunityProductModel.id == association_id,
        Opportunity.owner_id == current_user.id
    ).first()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OpportunityProduct association not found"
        )

    return association


@router.post("/", response_model=OpportunityProduct, status_code=status.HTTP_201_CREATED)
def create_opportunity_product(
    association: OpportunityProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new link between an opportunity and a product.

    - **opportunity_id**: ID of the opportunity (required)
    - **product_id**: ID of the product (required)

    Both opportunity and product must belong to the authenticated user.
    The association will be timestamped automatically.
    """
    # Validate ownership of both entities (ensures same owner_id)
    validate_opportunity_exists_and_owned(db, association.opportunity_id, current_user)
    validate_product_exists_and_owned(db, association.product_id, current_user)

    db_association = OpportunityProductModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity_product(
    association_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an opportunity-product association.

    - **association_id**: The ID of the association to delete

    Returns 404 if association doesn't exist or doesn't belong to the authenticated user.
    """
    db_association = db.query(OpportunityProductModel).join(
        OpportunityProductModel.opportunity
    ).filter(
        OpportunityProductModel.id == association_id,
        Opportunity.owner_id == current_user.id
    ).first()

    if not db_association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OpportunityProduct association not found"
        )

    db.delete(db_association)
    db.commit()
    return
