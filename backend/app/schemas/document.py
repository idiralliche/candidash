"""
Pydantic schemas for Document entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    """Base schema with common fields for Document."""
    name: str = Field(..., min_length=1, max_length=255, description="Document name")
    type: str = Field(..., min_length=1, max_length=50, description="Document type: resume, cover_letter, portfolio, certificate, job_posting, other")
    format: str = Field(..., min_length=1, max_length=10, description="File format: pdf, docx, jpg, etc.")
    path: str = Field(..., min_length=1, max_length=255, description="Storage path or URL")
    description: Optional[str] = Field(None, max_length=50000, description="Free text description")


class DocumentCreate(DocumentBase):
    """Schema for creating a new document (POST)."""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document (PUT/PATCH).

    All fields are optional to support partial updates.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    format: Optional[str] = Field(None, min_length=1, max_length=10)
    path: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=50000)


class Document(DocumentBase):
    """Schema for reading a document (GET).

    Includes all fields including generated ones (id, timestamp).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class DocumentInDB(Document):
    """Complete schema representing a document as stored in database.

    This schema includes all database fields and can be used for
    internal operations or detailed responses.
    """
    pass
