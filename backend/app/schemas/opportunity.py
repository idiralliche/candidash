"""Pydantic schemas for Opportunity entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.opportunity import ApplicationType, ContractType, RemotePolicy

class OpportunityBase(BaseModel):
    """Base schema with common fields for Opportunity."""
    job_title: str = Field(..., min_length=1, max_length=255, description="Job title")
    application_type: ApplicationType = Field(..., description="Type of application (posting, spontaneous, etc.)")
    company_id: Optional[int] = Field(None, description="Associated company ID")
    position_type: str = Field(..., min_length=1, max_length=100, description="Role type (backend, frontend, etc.)")
    contract_type: ContractType = Field(..., description="Type of employment contract")
    location: Optional[str] = Field(None, max_length=255, description="City, Country or specific location")

    # Job posting information
    job_posting_url: Optional[str] = Field(None, description="Link to original job posting")
    job_description: Optional[str] = Field(None, description="Summary or full text of the job description")

    # Requirements
    required_skills: Optional[str] = Field(None, description="List of required skills")
    technologies: Optional[str] = Field(None, description="Tech stack mentioned")

    # Salary information
    salary_min: Optional[float] = Field(None, description="Minimum salary offered")
    salary_max: Optional[float] = Field(None, description="Maximum salary offered")
    salary_info: Optional[str] = Field(None, description="Additional salary details (benefits, equity, etc.)")

    # Remote work policy
    remote_policy: Optional[RemotePolicy] = Field(None, description="Remote work policy")
    remote_details: Optional[str] = Field(None, description="Specific details about remote policy")

    # Other details
    source: Optional[str] = Field(None, max_length=100, description="Source of the opportunity (LinkedIn, Indeed, etc.)")
    recruitment_process: Optional[str] = Field(None, description="Notes on the recruitment process steps")


class OpportunityCreate(OpportunityBase):
    """Schema for creating a new opportunity (POST)."""
    pass


class OpportunityUpdate(BaseModel):
    """Schema for updating an opportunity (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    job_title: Optional[str] = Field(None, min_length=1, max_length=255)
    application_type: Optional[ApplicationType] = None
    company_id: Optional[int] = None
    position_type: Optional[str] = Field(None, min_length=1, max_length=100)
    contract_type: Optional[ContractType] = None
    location: Optional[str] = Field(None, max_length=255)

    job_posting_url: Optional[str] = None
    job_description: Optional[str] = None

    required_skills: Optional[str] = None
    technologies: Optional[str] = None

    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_info: Optional[str] = None

    remote_policy: Optional[RemotePolicy] = None
    remote_details: Optional[str] = None

    source: Optional[str] = Field(None, max_length=100)
    recruitment_process: Optional[str] = None


class Opportunity(OpportunityBase):
    """Schema for reading an opportunity (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class OpportunityInDB(Opportunity):
    """Complete schema representing an opportunity as stored in database."""
    pass
