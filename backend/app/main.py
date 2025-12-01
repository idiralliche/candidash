"""
Main FastAPI application.
"""
from fastapi import FastAPI
from app.routers import companies_router, documents_router, contacts_router, products_router, opportunities_router, applications_router

app = FastAPI(
    title="CandiDash API",
    description="Job application tracking system API",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Register routers
app.include_router(companies_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(contacts_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(opportunities_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
