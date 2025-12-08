"""Pydantic schemas for DocumentAssociation entity."""
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.document_association import EntityType


class DocumentAssociationBase(BaseModel):
    """Base schema with common fields for DocumentAssociation."""
    document_id: int = Field(..., gt=0, description="ID of the document")
    entity_type: EntityType = Field(..., description="Type of the associated entity (application, opportunity, etc.)")
    entity_id: int = Field(..., gt=0, description="ID of the associated entity")


class DocumentAssociationCreate(DocumentAssociationBase):
    """Schema for creating a new document association (POST)."""
    pass


class DocumentAssociation(DocumentAssociationBase):
    """Schema for reading a document association (GET).
    Includes all fields including generated ones (id, created_at).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class DocumentAssociationInDB(DocumentAssociation):
    """Complete schema representing the association as stored in database."""
    pass
