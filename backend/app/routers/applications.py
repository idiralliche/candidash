"""
Application routes - CRUD operations for applications.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.application import Application as ApplicationModel
from app.models.application import ApplicationStatus
from app.models.opportunity import Opportunity as OpportunityModel
from app.schemas.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationWithOpportunityCreate,
)


router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/", response_model=List[Application])
def get_applications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    is_archived: Optional[bool] = Query(None, description="Filter by archive status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of applications with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **opportunity_id**: Optional filter by opportunity
    - **status**: Optional filter by status (pending, rejected, accepted, etc.)
    - **is_archived**: Optional filter by archive status
    """
    query = db.query(ApplicationModel)

    if opportunity_id is not None:
        query = query.filter(ApplicationModel.opportunity_id == opportunity_id)

    if status is not None:
        query = query.filter(ApplicationModel.status == status)

    if is_archived is not None:
        query = query.filter(ApplicationModel.is_archived == is_archived)

    applications = query.offset(skip).limit(limit).all()
    return applications


@router.get("/{application_id}", response_model=Application)
def get_application(application_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific application by ID.

    - **application_id**: The ID of the application to retrieve
    """
    application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


def validate_foreign_keys(db: Session, opportunity_id: Optional[int] = None, resume_id: Optional[int] = None, cover_letter_id: Optional[int] = None):
    """Helper to validate foreign keys existence."""
    if opportunity_id is not None:
        from app.models.opportunity import Opportunity
        if not db.query(Opportunity).filter(Opportunity.id == opportunity_id).first():
            raise HTTPException(status_code=404, detail=f"Opportunity with id {opportunity_id} not found")

    if resume_id is not None:
        from app.models.document import Document
        if not db.query(Document).filter(Document.id == resume_id).first():
            raise HTTPException(status_code=404, detail=f"Document (resume) with id {resume_id} not found")

    if cover_letter_id is not None:
        from app.models.document import Document
        if not db.query(Document).filter(Document.id == cover_letter_id).first():
            raise HTTPException(status_code=404, detail=f"Document (cover letter) with id {cover_letter_id} not found")


@router.post("/", response_model=Application, status_code=201)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    """
    Create a new application.

    - **opportunity_id**: ID of the opportunity (required)
    - **application_date**: Date of application (required)
    - **status**: Status (default: pending)
    - **resume_used_id**: ID of resume document (optional)
    - **cover_letter_id**: ID of cover letter document (optional)
    """
    # Verify FKs
    validate_foreign_keys(
        db,
        opportunity_id=application.opportunity_id,
        resume_id=application.resume_used_id,
        cover_letter_id=application.cover_letter_id
    )

    db_application = ApplicationModel(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.post("/with-opportunity", response_model=Application, status_code=201)
def create_application_with_opportunity(
    data: ApplicationWithOpportunityCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new application with its opportunity in a single transaction.

    This endpoint is useful when creating a new job application where
    the opportunity doesn't exist yet. Both opportunity and application
    are created atomically.

    - **opportunity**: Opportunity details (job_title, application_type, company_id, etc.)
    - **application**: Application details (application_date, status, resume_used_id, etc.)

    Returns the created application with its generated ID and opportunity_id.

    Example payload:
    ```
    {
        "opportunity": {
            "job_title": "Senior Python Developer",
            "application_type": "job_posting",
            "company_id": 42,
            "contract_type": "permanent"
        },
        "application": {
            "application_date": "2024-12-02",
            "status": "pending",
            "resume_used_id": 5
        }
    }
    ```
    """
    try:
        # Validate foreign keys in application data (resume, cover letter)
        validate_foreign_keys(
            db,
            resume_id=data.application.resume_used_id,
            cover_letter_id=data.application.cover_letter_id
        )

        # Validate company_id if provided in opportunity
        if data.opportunity.company_id is not None:
            from app.models.company import Company
            company = db.query(Company).filter(Company.id == data.opportunity.company_id).first()
            if not company:
                raise HTTPException(
                    status_code=404,
                    detail=f"Company with id {data.opportunity.company_id} not found"
                )

        # Create Opportunity first
        db_opportunity = OpportunityModel(**data.opportunity.model_dump())
        db.add(db_opportunity)
        db.flush()  # Get opportunity.id without committing yet

        # Create Application with the generated opportunity_id
        application_data = data.application.model_dump()
        application_data['opportunity_id'] = db_opportunity.id
        db_application = ApplicationModel(**application_data)
        db.add(db_application)

        # Commit both in a single transaction
        db.commit()
        db.refresh(db_application)

        return db_application

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create application with opportunity: {str(e)}"
        )


@router.put("/{application_id}", response_model=Application)
def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing application.

    - **application_id**: The ID of the application to update
    - All fields are optional
    """
    db_application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check validation for FKs if they are present in update data
    update_data = application_update.model_dump(exclude_unset=True)

    validate_foreign_keys(
        db,
        opportunity_id=update_data.get("opportunity_id"),
        resume_id=update_data.get("resume_used_id"),
        cover_letter_id=update_data.get("cover_letter_id")
    )

    # Update fields
    for field, value in update_data.items():
        setattr(db_application, field, value)

    db.commit()
    db.refresh(db_application)
    return db_application


@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    """
    Delete an application.

    - **application_id**: The ID of the application to delete
    """
    db_application = db.query(ApplicationModel).filter(ApplicationModel.id == application_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(db_application)
    db.commit()
    return None
