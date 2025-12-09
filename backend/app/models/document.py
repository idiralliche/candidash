"""
Document model - represents a file (resume, cover letter, etc.).
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class DocumentFormat(str, enum.Enum):
    """Document format enumeration."""
    # Documents
    PDF = "pdf"
    DOC = "doc"
    DOCX = "docx"
    RTF = "rtf"
    TXT = "txt"
    MD = "md"
    # Presentations
    PPT = "ppt"
    PPTX = "pptx"
    ODP = "odp"
    # Spreadsheets
    XLS = "xls"
    XLSX = "xlsx"
    ODS = "ods"
    CSV = "csv"
    TSV = "tsv"
    # LibreOffice
    ODT = "odt"
    # Images
    JPG = "jpg"
    JPEG = "jpeg"
    PNG = "png"
    GIF = "gif"
    WEBP = "webp"
    # Data
    JSON = "json"
    # External links (no physical file)
    EXTERNAL = "external"


class Document(Base):
    """
    Document model.

    Represents a file stored in the system (resume, cover letter, portfolio, etc.)
    or an external link to a document hosted elsewhere (Google Drive, Dropbox, etc.).
    Documents can be described and reused across multiple applications.
    Each document belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # resume, cover_letter, portfolio, certificate, job_posting, other
    format = Column(Enum(DocumentFormat), nullable=False)  # pdf, docx, jpg, external, etc.
    path = Column(Text, nullable=False)  # Storage path (local) or URL (external)
    description = Column(Text, nullable=True)  # Free text description
    is_external = Column(Boolean, nullable=False, default=False, server_default='false')  # True for external links

    # Multi-tenancy
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    owner = relationship("User")

    def __repr__(self):
        return f"<Document(id={self.id}, name='{self.name}', type={self.type}, is_external={self.is_external}, owner_id={self.owner_id})>"
