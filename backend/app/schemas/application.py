"""Pydantic schemas for Application entity."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.application import ApplicationStatus

class ApplicationBase(BaseModel):
    """Base schema with common fields for Application."""
    application_date: date = Field(..., description="Date when the application was sent")
    status: ApplicationStatus = Field(default=ApplicationStatus.PENDING, description="Current status of the application")
    salary_expectation: Optional[float] = Field(None, description="Expected gross annual salary")
    is_archived: bool = Field(default=False, description="Whether the application is archived")
    resume_used_id: Optional[int] = Field(None, description="ID of the resume (Document) used")
    cover_letter_id: Optional[int] = Field(None, description="ID of the cover letter (Document) used")


class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application (POST)."""
    opportunity_id: int = Field(..., description="ID of the related opportunity")


class ApplicationUpdate(BaseModel):
    """Schema for updating an application (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    application_date: Optional[date] = None
    status: Optional[ApplicationStatus] = None
    salary_expectation: Optional[float] = None
    is_archived: Optional[bool] = None
    resume_used_id: Optional[int] = None
    cover_letter_id: Optional[int] = None
    opportunity_id: Optional[int] = None


class Application(ApplicationBase):
    """Schema for reading an application (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    opportunity_id: int = Field(..., description="ID of the related opportunity")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class ApplicationInDB(Application):
    """Complete schema representing an application as stored in database."""
    pass
