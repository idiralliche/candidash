"""
Pydantic schemas for API request/response validation.
"""
from app.schemas.company import (
    Company,
    CompanyCreate,
    CompanyUpdate,
    CompanyInDB,
)
from app.schemas.document import (
    Document,
    DocumentCreate,
    DocumentUpdate,
    DocumentInDB,
)
from app.schemas.contact import (
    Contact,
    ContactCreate,
    ContactUpdate,
    ContactInDB,
)

__all__ = [
    "Company",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyInDB",
    "Document",
    "DocumentCreate",
    "DocumentUpdate",
    "DocumentInDB",
    "Contact",
    "ContactCreate",
    "ContactUpdate",
    "ContactInDB",
]
