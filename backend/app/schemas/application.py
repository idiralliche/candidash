"""Pydantic schemas for Application entity."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.application import ApplicationStatus
from app.schemas.opportunity import OpportunityCreate


class ApplicationBase(BaseModel):
    """Base schema with common fields for Application."""
    application_date: date = Field(..., description="Date when the application was sent")
    status: ApplicationStatus = Field(default=ApplicationStatus.PENDING, description="Current status of the application")
    salary_expectation: Optional[float] = Field(None, ge=0, le=10_000_000, description="Expected gross annual salary")
    is_archived: bool = Field(default=False, description="Whether the application is archived")
    resume_used_id: Optional[int] = Field(None, gt=0, description="ID of the resume (Document) used")
    cover_letter_id: Optional[int] = Field(None, gt=0, description="ID of the cover letter (Document) used")


class ApplicationCreate(ApplicationBase):
    """Schema for creating a new application (POST)."""
    opportunity_id: int = Field(..., gt=0, description="ID of the related opportunity")


class ApplicationCreateWithoutOpportunityId(ApplicationBase):
    """
    Schema for creating an application without opportunity_id.
    Used in composite endpoint where opportunity is created at the same time.
    """
    pass


class ApplicationWithOpportunityCreate(BaseModel):
    """
    Composite schema for creating Application with its Opportunity in one call.

    Used when the opportunity doesn't exist yet (new job application).
    Frontend sends both opportunity details and application details,
    backend creates them in a single transaction.

    Example:
    {
        "opportunity": {
            "job_title": "Senior Python Developer",
            "application_type": "job_posting",
            "company_id": 42,
            ...
        },
        "application": {
            "application_date": "2024-12-02",
            "status": "pending",
            "resume_used_id": 5
        }
    }
    """
    opportunity: OpportunityCreate = Field(..., description="Opportunity details to create")
    application: ApplicationCreateWithoutOpportunityId = Field(..., description="Application details to create")


class ApplicationUpdate(BaseModel):
    """Schema for updating an application (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    application_date: Optional[date] = None
    status: Optional[ApplicationStatus] = None
    salary_expectation: Optional[float] = Field(None, ge=0, le=10_000_000)
    is_archived: Optional[bool] = None
    resume_used_id: Optional[int] = Field(None, gt=0)
    cover_letter_id: Optional[int] = Field(None, gt=0)
    opportunity_id: Optional[int] = Field(None, gt=0)


class Application(ApplicationBase):
    """Schema for reading an application (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    owner_id: int = Field(..., description="Owner user ID")
    opportunity_id: int = Field(..., description="ID of the related opportunity")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class ApplicationInDB(Application):
    """Complete schema representing an application as stored in database."""
    pass
