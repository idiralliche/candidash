"""Pydantic schemas for DocumentAssociation entity."""
from datetime import datetime
from typing import Union, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.document_association import EntityType
from app.schemas.document import Document
from app.schemas.application import Application
from app.schemas.opportunity import Opportunity
from app.schemas.company import Company
from app.schemas.contact import Contact


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
    document: Optional[Document] = None
    entity: Optional[Union[Application, Opportunity, Company, Contact]] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentAssociationInDB(DocumentAssociation):
    """Complete schema representing the association as stored in database."""
    pass
