"""
Pydantic schemas for Company entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CompanyBase(BaseModel):
    """Base schema with common fields for Company."""
    name: str = Field(..., min_length=1, max_length=255, description="Company name")
    industry: Optional[str] = Field(None, max_length=100, description="Industry sector")
    size: Optional[str] = Field(None, max_length=50, description="Company size (e.g., 1-10, 11-50, 51-200)")
    website: Optional[str] = Field(None, max_length=255, description="Company website URL")
    linkedin: Optional[str] = Field(None, max_length=255, description="LinkedIn company page URL")
    address: Optional[str] = Field(None, description="Company address")
    is_intermediary: bool = Field(default=False, description="Whether this company is an intermediary (ESN, agency)")
    notes: Optional[str] = Field(None, description="Additional notes about the company")


class CompanyCreate(CompanyBase):
    """Schema for creating a new company (POST)."""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating a company (PUT/PATCH).

    All fields are optional to support partial updates.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    size: Optional[str] = Field(None, max_length=50)
    website: Optional[str] = Field(None, max_length=255)
    linkedin: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    is_intermediary: Optional[bool] = None
    notes: Optional[str] = None


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
