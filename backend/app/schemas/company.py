"""
Pydantic schemas for Company entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    """Base schema with common fields for Company."""
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    siret: Optional[str] = Field(None, min_length=14, max_length=14, description="French business ID (SIRET)")
    website: Optional[str] = Field(None, max_length=255, description="Company website URL")
    headquarters: Optional[str] = Field(None, max_length=500, description="Company headquarters address")
    is_intermediary: bool = Field(default=False, description="Whether this company is an intermediary (ESN, agency)")
    company_type: Optional[str] = Field(None, min_length=2, max_length=100, description="Type: ESN, startup, enterprise, SME, etc.")
    industry: Optional[str] = Field(None, min_length=2, max_length=100, description="Industry: Healthcare, automotive, etc.")
    notes: Optional[str] = Field(None, max_length=50000, description="Additional notes about the company")


class CompanyCreate(CompanyBase):
    """Schema for creating a new company (POST)."""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating a company (PUT/PATCH).

    All fields are optional to support partial updates.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    siret: Optional[str] = Field(None, min_length=14, max_length=14)
    website: Optional[str] = Field(None, max_length=255)
    headquarters: Optional[str] = Field(None, max_length=500)
    is_intermediary: Optional[bool] = None
    company_type: Optional[str] = Field(None, min_length=2, max_length=100)
    industry: Optional[str] = Field(None, min_length=2, max_length=100)
    notes: Optional[str] = Field(None, max_length=50000)


class Company(CompanyBase):
    """Schema for reading a company (GET).

    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class CompanyInDB(Company):
    """Complete schema representing a company as stored in database.

    This schema includes all database fields and can be used for
    internal operations or detailed responses with relations.
    """
    pass
