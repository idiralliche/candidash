"""
Product routes - CRUD operations for products.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product as ProductModel
from app.schemas.product import Product, ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[Product])
def get_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of products with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **company_id**: Optional filter by company ID
    """
    query = db.query(ProductModel)

    if company_id is not None:
        query = query.filter(ProductModel.company_id == company_id)

    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific product by ID.

    - **product_id**: The ID of the product to retrieve
    """
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=Product, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """
    Create a new product.

    - **name**: Product or service name (required)
    - **description**: Detailed description (optional)
    - **company_id**: Associated company ID (required)
    - **website**: Product specific website URL (optional)
    - **technologies_used**: Stack or technologies used (optional)
    """
    # Verify company exists
    from app.models.company import Company as CompanyModel
    company = db.query(CompanyModel).filter(CompanyModel.id == product.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail=f"Company with id {product.company_id} not found")

    db_product = ProductModel(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing product.

    - **product_id**: The ID of the product to update
    - All fields are optional - only provided fields will be updated
    """
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Verify company exists if company_id is being updated
    update_data = product_update.model_dump(exclude_unset=True)
    if "company_id" in update_data and update_data["company_id"] is not None:
        from app.models.company import Company as CompanyModel
        company = db.query(CompanyModel).filter(CompanyModel.id == update_data["company_id"]).first()
        if not company:
            raise HTTPException(status_code=404, detail=f"Company with id {update_data['company_id']} not found")

    # Update only provided fields
    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Delete a product.

    - **product_id**: The ID of the product to delete
    """
    db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return None
