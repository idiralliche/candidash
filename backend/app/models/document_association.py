"""
DocumentAssociation model - polymorphic association between documents and entities.
"""
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Index
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
    __tablename__ = "document_associations"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(Enum(EntityType), nullable=False)
    entity_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index('ix_document_associations_entity', 'entity_type', 'entity_id'),
    )

    def __repr__(self):
        return f"<DocumentAssociation(id={self.id}, document_id={self.document_id}, entity={self.entity_type.value}:{self.entity_id})>"

