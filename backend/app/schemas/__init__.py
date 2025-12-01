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
from app.schemas.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationInDB,
)
from app.schemas.scheduled_event import (
    ScheduledEvent,
    ScheduledEventCreate,
    ScheduledEventUpdate,
    ScheduledEventInDB,
)
from app.schemas.action import (
    Action,
    ActionCreate,
    ActionUpdate,
    ActionInDB,
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
    "Application",
    "ApplicationCreate",
    "ApplicationUpdate",
    "ApplicationInDB",
    "ScheduledEvent",
    "ScheduledEventCreate",
    "ScheduledEventUpdate",
    "ScheduledEventInDB",
    "Action",
    "ActionCreate",
    "ActionUpdate",
    "ActionInDB",
]
