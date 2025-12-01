"""Pydantic schemas for DocumentAssociation entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.document_association import EntityType

class DocumentAssociationBase(BaseModel):
    """Base schema with common fields for DocumentAssociation."""
    # No additional metadata fields in this model
    pass


class DocumentAssociationCreate(DocumentAssociationBase):
    """Schema for creating a new document association (POST)."""
    document_id: int = Field(..., description="ID of the document")
    entity_type: EntityType = Field(..., description="Type of the associated entity (application, opportunity, etc.)")
    entity_id: int = Field(..., description="ID of the associated entity")


class DocumentAssociationUpdate(BaseModel):
    """Schema for updating a document association (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    document_id: Optional[int] = None
    entity_type: Optional[EntityType] = None
    entity_id: Optional[int] = None


class DocumentAssociation(DocumentAssociationBase):
    """Schema for reading a document association (GET).
    Includes all fields including generated ones (id).
    """
    id: int = Field(..., description="Unique identifier")
    document_id: int = Field(..., description="ID of the document")
    entity_type: EntityType = Field(..., description="Type of the associated entity")
    entity_id: int = Field(..., description="ID of the associated entity")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class DocumentAssociationInDB(DocumentAssociation):
    """Complete schema representing the association as stored in database."""
    pass
