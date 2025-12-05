"""
Application model - represents a job application.
"""
from sqlalchemy import Column, Integer, Date, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ApplicationStatus(str, enum.Enum):
    """Application status enumeration."""
    PENDING = "pending"
    FOLLOW_UP_SCHEDULED = "follow_up_scheduled"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    OBSOLETE = "obsolete"


class Application(Base):
    """
    Application model.

    Represents a job application with its status, dates, and associated documents.
    Each application belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    application_date = Column(Date, nullable=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.PENDING)
    salary_expectation = Column(Float, nullable=True)  # Your expected salary
    resume_used_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    cover_letter_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    is_archived = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
    resume_used = relationship("Document", foreign_keys=[resume_used_id])
    cover_letter = relationship("Document", foreign_keys=[cover_letter_id])
    actions = relationship("Action", back_populates="application", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application(id={self.id}, owner_id={self.owner_id}, opportunity_id={self.opportunity_id}, status={self.status})>"
