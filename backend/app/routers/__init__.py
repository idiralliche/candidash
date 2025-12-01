"""
API routers.
"""
from app.routers.companies import router as companies_router
from app.routers.documents import router as documents_router
from app.routers.contacts import router as contacts_router
from app.routers.products import router as products_router
from app.routers.opportunities import router as opportunities_router
from app.routers.applications import router as applications_router
from app.routers.scheduled_events import router as scheduled_events_router
from app.routers.actions import router as actions_router
from app.routers.opportunity_contacts import router as opportunity_contacts_router
from app.routers.opportunity_products import router as opportunity_products_router

__all__ = [
    "companies_router",
    "documents_router",
    "contacts_router",
    "products_router",
    "opportunities_router",
    "applications_router",
    "scheduled_events_router",
    "actions_router",
    "opportunity_contacts_router",
    "opportunity_products_router",
]
