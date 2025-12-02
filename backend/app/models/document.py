"""
Document model - represents a file (resume, cover letter, etc.).
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Document(Base):
    """
    Document model.

    Represents a file stored in the system (resume, cover letter, portfolio, etc.).
    Documents can be described and reused across multiple applications.
    Each document belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # resume, cover_letter, portfolio, certificate, job_posting, other
    format = Column(String(10), nullable=False)  # pdf, docx, jpg, etc.
    path = Column(Text, nullable=False)  # Storage path or URL
    description = Column(Text, nullable=True)  # Free text description

    # Multi-tenancy
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    owner = relationship("User")

    def __repr__(self):
        return f"<Document(id={self.id}, name='{self.name}', type={self.type}, owner_id={self.owner_id})>"
