"""
Company model - represents a company.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    """
    Company model.

    Represents a company with its basic information, industry, and headquarters.
    A company can have multiple opportunities, contacts, and products.
    Each company belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    siret = Column(String(14), nullable=True)  # French business ID
    website = Column(String(255), nullable=True)
    headquarters = Column(Text, nullable=True)  # Full address
    is_intermediary = Column(Boolean, default=False)
    company_type = Column(String(100), nullable=True)  # ESN, startup, enterprise, SME, etc.
    industry = Column(String(100), nullable=True)  # Healthcare, automotive, etc.
    notes = Column(Text, nullable=True)

    # Multi-tenancy
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Composite unique constraint on (siret, owner_id) - only enforced when siret IS NOT NULL
    __table_args__ = (
        Index(
            'ix_company_siret_owner_unique',
            'siret',
            'owner_id',
            unique=True,
            postgresql_where=text('siret IS NOT NULL')
        ),
    )

    # Relationships
    owner = relationship("User")
    opportunities = relationship("Opportunity", back_populates="company")
    contacts = relationship("Contact", back_populates="company")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"
