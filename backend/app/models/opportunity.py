"""
Opportunity model - represents a job opportunity.
"""
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ApplicationType(str, enum.Enum):
    """Type of application."""
    JOB_POSTING = "job_posting"
    SPONTANEOUS = "spontaneous"
    REACHED_OUT = "reached_out"  # Contacted by recruiter


class ContractType(str, enum.Enum):
    """Type of employment contract."""
    PERMANENT = "permanent"  # CDI
    FIXED_TERM = "fixed_term"  # CDD
    FREELANCE = "freelance"
    CONTRACTOR = "contractor"  # Umbrella company / portage salarial
    INTERNSHIP = "internship"
    APPRENTICESHIP = "apprenticeship"


class RemotePolicy(str, enum.Enum):
    """Remote work policy."""
    ON_SITE = "on_site"  # 100% on-site
    FULL_REMOTE = "full_remote"  # 100% remote
    HYBRID = "hybrid"  # Mix (details in remote_details)
    FLEXIBLE = "flexible"  # Flexible, negotiable


class Opportunity(Base):
    """
    Opportunity model.

    Represents a job opportunity, either from a job posting or spontaneous application.
    Contains all details about the position, requirements, and work conditions.
    Each opportunity belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(255), nullable=False)
    application_type = Column(Enum(ApplicationType), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    position_type = Column(String(100), nullable=True)  # backend, frontend, devops, etc.
    contract_type = Column(Enum(ContractType), nullable=True)
    location = Column(String(255), nullable=True)

    # Job posting information
    job_posting_url = Column(Text, nullable=True)  # Link to original job posting
    job_description = Column(Text, nullable=True)  # Your summary/notes about the position

    # Requirements
    required_skills = Column(Text, nullable=True)
    technologies = Column(Text, nullable=True)

    # Salary information (simplified)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_info = Column(Text, nullable=True)  # Free text: "40-45k gross/year, 13th month, profit sharing"

    # Remote work policy
    remote_policy = Column(Enum(RemotePolicy), nullable=True)
    remote_details = Column(Text, nullable=True)  # "2 days/week on-site, Tuesdays mandatory"

    # Other details
    source = Column(String(100), nullable=True)  # LinkedIn, Malt, Indeed, etc.
    recruitment_process = Column(Text, nullable=True)

    # Multi-tenancy
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    owner = relationship("User")
    company = relationship("Company", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")
    opportunity_contacts = relationship("OpportunityContact", back_populates="opportunity", cascade="all, delete-orphan")
    opportunity_products = relationship("OpportunityProduct", back_populates="opportunity", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Opportunity(id={self.id}, job_title='{self.job_title}', type={self.application_type}, owner_id={self.owner_id})>"
