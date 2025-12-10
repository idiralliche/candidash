"""
Contact model - represents a person contact.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, and_
from sqlalchemy.orm import relationship, foreign
from sqlalchemy.sql import func
from app.database import Base
from app.models.document_association import DocumentAssociation, EntityType


class Contact(Base):
    """
    Contact model.

    Represents a contact person from a company.
    Can be linked to multiple opportunities as primary or secondary contact.
    Each contact belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    last_name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=True)  # Job title
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    linkedin = Column(String(255), nullable=True)  # LinkedIn profile URL

    # Relationship information
    relationship_notes = Column(Text, nullable=True)  # "Contacted me on LinkedIn", "Former colleague", etc.
    is_independent_recruiter = Column(Boolean, default=False, nullable=False)

    notes = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)

    # Multi-tenancy
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    owner = relationship("User")
    company = relationship("Company", back_populates="contacts")
    opportunity_contacts = relationship("OpportunityContact", back_populates="contact")
    document_associations = relationship(
        "DocumentAssociation",
        primaryjoin=and_(
            foreign(DocumentAssociation.entity_id) == id,
            DocumentAssociation.entity_type == EntityType.CONTACT
        ),
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Contact(id={self.id}, name='{self.first_name} {self.last_name}', owner_id={self.owner_id})>"
