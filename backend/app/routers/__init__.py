"""
API routers.
"""
from app.routers.companies import router as companies_router
from app.routers.documents import router as documents_router
from app.routers.contacts import router as contacts_router
from app.routers.products import router as products_router

__all__ = [
    "companies_router",
    "documents_router",
    "contacts_router",
    "products_router",
]
