"""Pydantic schemas for Contact entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator
from app.utils.validators import validate_name, validate_and_normalize_phone, validate_linkedin_url

class ContactBase(BaseModel):
    """Base schema with common fields for Contact."""
    last_name: str = Field(..., min_length=1, max_length=100, description="Contact's last name")
    first_name: str = Field(..., min_length=1, max_length=100, description="Contact's first name")
    position: Optional[str] = Field(None, max_length=100, description="Job title/position")
    email: Optional[EmailStr] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number (will be normalized to E.164)")
    linkedin: Optional[str] = Field(None, max_length=255, description="LinkedIn profile URL (normalized to short format)")
    relationship_notes: Optional[str] = Field(None, description="How you know this person")
    is_independent_recruiter: bool = Field(default=False, description="Whether this is an independent recruiter")
    notes: Optional[str] = Field(None, description="Additional notes")
    company_id: Optional[int] = Field(None, description="Associated company ID")

    @field_validator('first_name', mode='before')
    @classmethod
    def validate_first_name(cls, v: str) -> str:
        return validate_name(v, "First name")

    @field_validator('last_name', mode='before')
    @classmethod
    def validate_last_name(cls, v: str) -> str:
        return validate_name(v, "Last name")

    @field_validator('phone', mode='before')
    @classmethod
    def validate_phone_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_and_normalize_phone(v)

    @field_validator('linkedin', mode='before')
    @classmethod
    def validate_linkedin_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_linkedin_url(v)


class ContactCreate(ContactBase):
    """Schema for creating a new contact (POST)."""
    pass


class ContactUpdate(BaseModel):
    """Schema for updating a contact (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    linkedin: Optional[str] = Field(None, max_length=255)
    relationship_notes: Optional[str] = None
    is_independent_recruiter: Optional[bool] = None
    notes: Optional[str] = None
    company_id: Optional[int] = None

    @field_validator('first_name', mode='before')
    @classmethod
    def validate_first_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_name(v, "First name")

    @field_validator('last_name', mode='before')
    @classmethod
    def validate_last_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_name(v, "Last name")

    @field_validator('phone', mode='before')
    @classmethod
    def validate_phone_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_and_normalize_phone(v)

    @field_validator('linkedin', mode='before')
    @classmethod
    def validate_linkedin_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_linkedin_url(v)


class Contact(ContactBase):
    """Schema for reading a contact (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    model_config = ConfigDict(from_attributes=True)


class ContactInDB(Contact):
    """Complete schema representing a contact as stored in database.
    This schema includes all database fields and can be used for
    internal operations or detailed responses with relations.
    """
    pass
