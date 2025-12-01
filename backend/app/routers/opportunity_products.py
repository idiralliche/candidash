"""
OpportunityProduct routes - CRUD operations for opportunity-product associations.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.opportunity_product import OpportunityProduct as OpportunityProductModel
from app.schemas.opportunity_product import (
    OpportunityProduct,
    OpportunityProductCreate,
    OpportunityProductUpdate
)

router = APIRouter(prefix="/opportunity-products", tags=["opportunity_products"])


@router.get("/", response_model=List[OpportunityProduct])
def get_opportunity_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of opportunity-product associations with pagination and filtering.

    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **opportunity_id**: Optional filter by opportunity
    - **product_id**: Optional filter by product
    """
    query = db.query(OpportunityProductModel)

    if opportunity_id is not None:
        query = query.filter(OpportunityProductModel.opportunity_id == opportunity_id)

    if product_id is not None:
        query = query.filter(OpportunityProductModel.product_id == product_id)

    associations = query.offset(skip).limit(limit).all()
    return associations


@router.get("/{association_id}", response_model=OpportunityProduct)
def get_opportunity_product(association_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific association by ID.

    - **association_id**: The ID of the association to retrieve
    """
    association = db.query(OpportunityProductModel).filter(OpportunityProductModel.id == association_id).first()
    if not association:
        raise HTTPException(status_code=404, detail="OpportunityProduct association not found")
    return association


def validate_foreign_keys(db: Session, opportunity_id: Optional[int] = None, product_id: Optional[int] = None):
    """Helper to validate foreign keys existence."""
    if opportunity_id is not None:
        from app.models.opportunity import Opportunity
        if not db.query(Opportunity).filter(Opportunity.id == opportunity_id).first():
            raise HTTPException(status_code=404, detail=f"Opportunity with id {opportunity_id} not found")

    if product_id is not None:
        from app.models.product import Product
        if not db.query(Product).filter(Product.id == product_id).first():
            raise HTTPException(status_code=404, detail=f"Product with id {product_id} not found")


@router.post("/", response_model=OpportunityProduct, status_code=201)
def create_opportunity_product(association: OpportunityProductCreate, db: Session = Depends(get_db)):
    """
    Create a new link between an opportunity and a product.

    - **opportunity_id**: ID of the opportunity (required)
    - **product_id**: ID of the product (required)
    """
    # Verify FKs
    validate_foreign_keys(
        db,
        opportunity_id=association.opportunity_id,
        product_id=association.product_id
    )

    db_association = OpportunityProductModel(**association.model_dump())
    db.add(db_association)
    db.commit()
    db.refresh(db_association)
    return db_association


@router.put("/{association_id}", response_model=OpportunityProduct)
def update_opportunity_product(
    association_id: int,
    association_update: OpportunityProductUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing association.

    - **association_id**: The ID of the association to update
    - All fields are optional
    """
    db_association = db.query(OpportunityProductModel).filter(OpportunityProductModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="OpportunityProduct association not found")

    update_data = association_update.model_dump(exclude_unset=True)

    # Check validation for FKs if they are present in update data
    validate_foreign_keys(
        db,
        opportunity_id=update_data.get("opportunity_id"),
        product_id=update_data.get("product_id")
    )

    for field, value in update_data.items():
        setattr(db_association, field, value)

    db.commit()
    db.refresh(db_association)
    return db_association


@router.delete("/{association_id}", status_code=204)
def delete_opportunity_product(association_id: int, db: Session = Depends(get_db)):
    """
    Delete an association.

    - **association_id**: The ID of the association to delete
    """
    db_association = db.query(OpportunityProductModel).filter(OpportunityProductModel.id == association_id).first()
    if not db_association:
        raise HTTPException(status_code=404, detail="OpportunityProduct association not found")

    db.delete(db_association)
    db.commit()
    return None
