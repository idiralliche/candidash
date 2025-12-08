"""
OpportunityProduct model - links opportunities with products.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class OpportunityProduct(Base):
    """
    OpportunityProduct model.

    Association table between Opportunity and Product.
    Links job opportunities with the products they involve.
    Each association is timestamped for traceability.
    """
    __tablename__ = "opportunity_products"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    opportunity = relationship("Opportunity", back_populates="opportunity_products")
    product = relationship("Product", back_populates="opportunity_products")

    def __repr__(self):
        return f"<OpportunityProduct(id={self.id}, opportunity_id={self.opportunity_id}, product_id={self.product_id})>"
