"""Pydantic schemas for OpportunityProduct entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.opportunity import Opportunity
from app.schemas.product import Product

class OpportunityProductBase(BaseModel):
    """Base schema with common fields for OpportunityProduct."""
    opportunity_id: int = Field(..., gt=0, description="ID of the opportunity")
    product_id: int = Field(..., gt=0, description="ID of the product")

class OpportunityProductCreate(OpportunityProductBase):
    """Schema for creating a new opportunity-product association (POST)."""
    pass

class OpportunityProduct(OpportunityProductBase):
    """Schema for reading an opportunity-product association (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    opportunity: Optional[Opportunity] = None
    product: Optional[Product] = None

    model_config = ConfigDict(from_attributes=True)

class OpportunityProductInDB(OpportunityProduct):
    """Complete schema representing the association as stored in database."""
    pass
