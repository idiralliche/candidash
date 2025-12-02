"""
OpportunityProduct model - links opportunities with products.
"""
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class OpportunityProduct(Base):
    """
    OpportunityProduct model.

    Association table between Opportunity and Product.
    Links job opportunities with the products they involve.
    """
    __tablename__ = "opportunity_products"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="opportunity_products")
    product = relationship("Product", back_populates="opportunity_products")

    def __repr__(self):
        return f"<OpportunityProduct(opportunity_id={self.opportunity_id}, product_id={self.product_id})>"
