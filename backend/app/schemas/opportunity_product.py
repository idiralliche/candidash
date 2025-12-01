"""Pydantic schemas for OpportunityProduct entity."""
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class OpportunityProductBase(BaseModel):
    """Base schema with common fields for OpportunityProduct."""
    # No additional metadata fields in this model
    pass


class OpportunityProductCreate(OpportunityProductBase):
    """Schema for creating a new opportunity-product association (POST)."""
    opportunity_id: int = Field(..., description="ID of the opportunity")
    product_id: int = Field(..., description="ID of the product")


class OpportunityProductUpdate(BaseModel):
    """Schema for updating an opportunity-product association (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    opportunity_id: Optional[int] = None
    product_id: Optional[int] = None


class OpportunityProduct(OpportunityProductBase):
    """Schema for reading an opportunity-product association (GET).
    Includes all fields including generated ones (id).
    """
    id: int = Field(..., description="Unique identifier")
    opportunity_id: int = Field(..., description="ID of the opportunity")
    product_id: int = Field(..., description="ID of the product")

    model_config = ConfigDict(from_attributes=True)


class OpportunityProductInDB(OpportunityProduct):
    """Complete schema representing the association as stored in database."""
    pass
