"""
Product routes - CRUD operations for products.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product as ProductModel
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.utils.validators.ownership_validators import validate_company_exists_and_owned
from app.utils.db import get_owned_entity_or_404


router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[Product])
def get_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of products owned by the current user with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **company_id**: Optional filter by company ID

    Returns only products belonging to the authenticated user.
    """
    query = db.query(ProductModel).filter(
        ProductModel.owner_id == current_user.id
    )

    if company_id is not None:
        validate_company_exists_and_owned(db, company_id, current_user)
        query = query.filter(ProductModel.company_id == company_id)

    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=Product)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific product by ID.

    - **product_id**: The ID of the product to retrieve

    Returns 404 if product doesn't exist or doesn't belong to the authenticated user.
    """
    product = get_owned_entity_or_404(
        db=db,
        entity_model=ProductModel,
        entity_id=product_id,
        owner_id=current_user.id,
        entity_name="Product"
    )
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new product.

    - **name**: Product or service name (required)
    - **description**: Detailed description (optional)
    - **company_id**: Associated company ID (required)
    - **website**: Product specific website URL (optional)
    - **technologies_used**: Stack or technologies used (optional)

    The product will be automatically assigned to the authenticated user.
    """
    validate_company_exists_and_owned(db, product.company_id, current_user)

    product_data = product.model_dump()
    product_data['owner_id'] = current_user.id

    db_product = ProductModel(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing product.

    - **product_id**: The ID of the product to update
    - All fields are optional - only provided fields will be updated

    Returns 404 if product doesn't exist or doesn't belong to the authenticated user.
    """
    db_product = get_owned_entity_or_404(
        db=db,
        entity_model=ProductModel,
        entity_id=product_id,
        owner_id=current_user.id,
        entity_name="Product"
    )

    update_data = product_update.model_dump(exclude_unset=True)
    if "company_id" in update_data and update_data["company_id"] is not None:
        validate_company_exists_and_owned(
            db, update_data["company_id"], current_user
        )

    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a product.

    - **product_id**: The ID of the product to delete

    Returns 404 if product doesn't exist or doesn't belong to the authenticated user.
    """
    db_product = get_owned_entity_or_404(
        db=db,
        entity_model=ProductModel,
        entity_id=product_id,
        owner_id=current_user.id,
        entity_name="Product"
    )

    db.delete(db_product)
    db.commit()
    return
