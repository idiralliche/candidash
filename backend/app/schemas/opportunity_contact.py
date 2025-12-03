"""Pydantic schemas for OpportunityContact entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class OpportunityContactBase(BaseModel):
    """Base schema with common fields for OpportunityContact."""
    is_primary_contact: bool = Field(default=False, description="Whether this is the primary contact for this opportunity")
    contact_role: Optional[str] = Field(None, max_length=50, description="Role of the contact in this specific opportunity (e.g. Recruiter, Hiring Manager)")
    origin: Optional[str] = Field(None, max_length=100, description="How this contact is related (e.g. direct approach, referral)")
    notes: Optional[str] = Field(None, max_length=50000, description="Contextual notes for this association")


class OpportunityContactCreate(OpportunityContactBase):
    """Schema for creating a new opportunity-contact association (POST)."""
    opportunity_id: int = Field(..., gt=0, description="ID of the opportunity")
    contact_id: int = Field(..., gt=0, description="ID of the contact")


class OpportunityContactUpdate(BaseModel):
    """Schema for updating an opportunity-contact association (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    is_primary_contact: Optional[bool] = None
    contact_role: Optional[str] = Field(None, max_length=50)
    origin: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=50000)
    opportunity_id: Optional[int] = Field(None, gt=0)
    contact_id: Optional[int] = Field(None, gt=0)


class OpportunityContact(OpportunityContactBase):
    """Schema for reading an opportunity-contact association (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    opportunity_id: int = Field(..., description="ID of the opportunity")
    contact_id: int = Field(..., description="ID of the contact")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class OpportunityContactInDB(OpportunityContact):
    """Complete schema representing the association as stored in database."""
    pass
