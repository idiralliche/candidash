"""
DocumentAssociation model - polymorphic association between documents and entities.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


class EntityType(str, enum.Enum):
    """Entity types that can have associated documents."""
    APPLICATION = "application"
    OPPORTUNITY = "opportunity"
    COMPANY = "company"
    CONTACT = "contact"


class DocumentAssociation(Base):
    """
    DocumentAssociation model.

    Polymorphic association table to link documents to any entity type.
    Uses entity_type + entity_id to reference the associated entity.
    """
    __tablename__ = "document_associations"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(Enum(EntityType), nullable=False)
    entity_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<DocumentAssociation(document_id={self.document_id}, entity={self.entity_type}:{self.entity_id})>"
