"""
Pydantic schemas for Document entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
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


class DocumentCreate(DocumentBase):
    """
    Schema for creating a new document (POST).

    Used for creating external link references.
    For file uploads, use the /upload endpoint instead.
    """
    @model_validator(mode='after')
    def validate_document(self):
        """Validate path and format consistency after all fields are set."""
        validate_path_format(self.path, self.is_external)
        validate_format_consistency(self.format, self.is_external)
        return self


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

    **Special Cases:**
    - **path + is_external**: Can be updated together to change storage location
      (e.g., local file → external link, or update external URL)
    - **format**: Automatically set to 'external' when is_external=true

    **Notes:**
    - When changing from local to external, the local file will be deleted
    - When changing external URL, old URL remains accessible (not controlled by CandiDash)
    - Cannot change from external to local via PUT (use dedicated upload endpoint instead)
    """
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=5000)
    path: Optional[str] = Field(None, min_length=1, description="New path (URL for external, or leave unchanged)")
    is_external: Optional[bool] = Field(None, description="Change storage type (local ↔ external)")


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
