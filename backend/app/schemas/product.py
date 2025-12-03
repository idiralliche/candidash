"""Pydantic schemas for Product entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ProductBase(BaseModel):
    """Base schema with common fields for Product."""
    name: str = Field(..., min_length=1, max_length=255, description="Product or service name")
    description: Optional[str] = Field(None, max_length=5000, description="Detailed description of the product")
    company_id: int = Field(..., gt=0, description="Associated company ID")
    website: Optional[str] = Field(None, max_length=255, description="Product specific website URL")
    technologies_used: Optional[str] = Field(None, max_length=5000, description="Stack or technologies used in this product")


class ProductCreate(ProductBase):
    """Schema for creating a new product (POST)."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    company_id: Optional[int] = Field(None, gt=0)
    website: Optional[str] = Field(None, max_length=255)
    technologies_used: Optional[str] = Field(None, max_length=5000)


class Product(ProductBase):
    """Schema for reading a product (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class ProductInDB(Product):
    """Complete schema representing a product as stored in database.
    This schema includes all database fields and can be used for
    internal operations or detailed responses with relations.
    """
    pass
