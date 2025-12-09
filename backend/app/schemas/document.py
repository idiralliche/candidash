"""
Pydantic schemas for Document entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.document import DocumentFormat
from app.utils.validators.document_validators import validate_path_format, validate_format_consistency


class DocumentBase(BaseModel):
    """Base schema with common fields for Document."""
    name: str = Field(..., min_length=1, max_length=255, description="Document name")
    type: str = Field(..., min_length=1, max_length=50, description="Document type: resume, cover_letter, portfolio, certificate, job_posting, other")
    format: DocumentFormat = Field(..., description="File format: pdf, docx, jpg, external, etc.")
    path: str = Field(..., min_length=1, description="Storage path (local) or URL (external)")
    description: Optional[str] = Field(None, max_length=5000, description="Free text description")
    is_external: bool = Field(default=False, description="Whether document is an external link")

    @field_validator('path')
    @classmethod
    def validate_path(cls, v: str, info) -> str:
        """Validate path format based on is_external flag."""
        is_external = info.data.get('is_external', False)
        validate_path_format(v, is_external)
        return v

    @field_validator('format')
    @classmethod
    def validate_format(cls, v: DocumentFormat, info) -> DocumentFormat:
        """Ensure format is consistent with is_external."""
        is_external = info.data.get('is_external', False)
        validate_format_consistency(v, is_external)
        return v


class DocumentCreate(DocumentBase):
    """
    Schema for creating a new document (POST).

    Used for creating external link references.
    For file uploads, use the /upload endpoint instead.
    """
    pass


class DocumentUpload(BaseModel):
    """
    Schema for uploading a document file via multipart/form-data.

    Used with POST /documents/upload endpoint.
    The file itself is sent as UploadFile, these are the metadata fields.
    """
    name: str = Field(..., min_length=1, max_length=255, description="Document name")
    type: str = Field(..., min_length=1, max_length=50, description="Document type: resume, cover_letter, portfolio, certificate, job_posting, other")
    description: Optional[str] = Field(None, max_length=5000, description="Free text description")


class DocumentUpdate(BaseModel):
    """
    Schema for updating a document (PUT/PATCH).

    All fields are optional to support partial updates.
    Note: Cannot change is_external or format after creation (would require file migration).
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=5000)
    # path, format, is_external are immutable after creation


class Document(DocumentBase):
    """
    Schema for reading a document (GET).

    Includes all fields including generated ones (id, timestamp).
    """
    id: int = Field(..., description="Unique identifier")
    owner_id: int = Field(..., description="Owner user ID")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class DocumentInDB(Document):
    """
    Complete schema representing a document as stored in database.

    This schema includes all database fields and can be used for
    internal operations or detailed responses.
    """
    pass
