"""
API routers.
"""
from app.routers.companies import router as companies_router
from app.routers.documents import router as documents_router

__all__ = [
    "companies_router",
    "documents_router",
]
