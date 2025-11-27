"""
Product model - represents a company's product or service.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    """
    Product model.

    Represents a product or service offered by a company.
    Can be linked to opportunities when the job posting mentions specific products.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    website = Column(String(255), nullable=True)
    technologies_used = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="products")
    opportunity_products = relationship("OpportunityProduct", back_populates="product")

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}')>"
