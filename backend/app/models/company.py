"""
Company model - represents a company.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    """
    Company model.

    Represents a company with its basic information, industry, and headquarters.
    A company can have multiple opportunities, contacts, and products.
    """
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    siret = Column(String(14), nullable=True, unique=True)  # French business ID
    website = Column(String(255), nullable=True)
    headquarters = Column(Text, nullable=True)  # Full address
    is_intermediary = Column(Boolean, default=False)
    company_type = Column(String(100), nullable=True)  # ESN, startup, enterprise, SME, etc.
    industry = Column(String(100), nullable=True)  # Healthcare, automotive, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    opportunities = relationship("Opportunity", back_populates="company")
    contacts = relationship("Contact", back_populates="company")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}')>"
