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
from app.schemas.product import (
    Product,
    ProductCreate,
    ProductUpdate,
    ProductInDB,
)
from app.schemas.opportunity import (
    Opportunity,
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityInDB,
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
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "ProductInDB",
    "Opportunity",
    "OpportunityCreate",
    "OpportunityUpdate",
    "OpportunityInDB",
]
