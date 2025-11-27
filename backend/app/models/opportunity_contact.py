"""
OpportunityContact model - links opportunities with contacts.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class OpportunityContact(Base):
    """
    OpportunityContact model.

    Association table between Opportunity and Contact with additional metadata.
    Allows tracking multiple contacts per opportunity with roles and primary contact flag.
    """
    __tablename__ = "opportunity_contacts"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    is_primary_contact = Column(Boolean, default=False, nullable=False)
    contact_role = Column(String(50), nullable=True)  # HR, technical, manager, recruiter, other
    origin = Column(String(100), nullable=True)  # direct_approach, recruiter_approach, spontaneous_application
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="opportunity_contacts")
    contact = relationship("Contact", back_populates="opportunity_contacts")

    def __repr__(self):
        return f"<OpportunityContact(opportunity_id={self.opportunity_id}, contact_id={self.contact_id})>"
