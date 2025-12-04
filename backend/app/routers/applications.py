"""
Application routes - CRUD operations for applications.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.application import Application as ApplicationModel
from app.models.application import ApplicationStatus
from app.models.opportunity import Opportunity as OpportunityModel
from app.schemas.application import (
    Application,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationWithOpportunityCreate,
)
from app.utils.validators.ownership_validators import (
    validate_opportunity_exists_and_owned,
    validate_document_exists_and_owned,
    validate_company_exists_and_owned
)
from app.utils.db import get_owned_entity_or_404
from app.utils.db.helpers import JoinSpec

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("/", response_model=List[Application])
def get_applications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    opportunity_id: Optional[int] = Query(None, description="Filter by opportunity ID"),
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    is_archived: Optional[bool] = Query(None, description="Filter by archive status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of applications owned by the current user with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **opportunity_id**: Optional filter by opportunity ID
    - **status**: Optional filter by status (pending, rejected, accepted, etc.)
    - **is_archived**: Optional filter by archive status

    Returns only applications belonging to the authenticated user (via opportunity ownership).
    """
    query = db.query(ApplicationModel).join(
        OpportunityModel, ApplicationModel.opportunity_id == OpportunityModel.id
    ).filter(
        OpportunityModel.owner_id == current_user.id
    )

    if opportunity_id is not None:
        query = query.filter(ApplicationModel.opportunity_id == opportunity_id)

    if status is not None:
        query = query.filter(ApplicationModel.status == status)

    if is_archived is not None:
        query = query.filter(ApplicationModel.is_archived == is_archived)

    applications = query.offset(skip).limit(limit).all()
    return applications

@router.get("/{application_id}", response_model=Application)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific application by ID.

    - **application_id**: The ID of the application to retrieve

    Returns 404 if application doesn't exist or doesn't belong to the authenticated user.
    """
    application = get_owned_entity_or_404(
        db=db,
        entity_model=ApplicationModel,
        entity_id=application_id,
        owner_id=current_user.id,
        entity_name="Application",
        requires_joins=[JoinSpec(model=OpportunityModel, owner_field='owner_id')]
    )
    return application

@router.post("/", response_model=Application, status_code=201)
def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new application.

    - **opportunity_id**: ID of the opportunity (required)
    - **application_date**: Date of application (required)
    - **status**: Status (default: pending)
    - **resume_used_id**: ID of resume document (optional)
    - **cover_letter_id**: ID of cover letter document (optional)
    """
    # Validate foreign keys ownership
    validate_opportunity_exists_and_owned(db, application.opportunity_id, current_user)
    if application.resume_used_id is not None:
        validate_document_exists_and_owned(db, application.resume_used_id, current_user)
    if application.cover_letter_id is not None:
        validate_document_exists_and_owned(db, application.cover_letter_id, current_user)

    db_application = ApplicationModel(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.post("/with-opportunity", response_model=Application, status_code=201)
def create_application_with_opportunity(
    data: ApplicationWithOpportunityCreate,
    current_user: User = Depends(get_current_user),
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
    The opportunity is automatically assigned to the authenticated user.
    """
    try:
        # Validate documents ownership (resume, cover letter)
        if data.application.resume_used_id is not None:
            validate_document_exists_and_owned(
                db, data.application.resume_used_id, current_user
            )
        if data.application.cover_letter_id is not None:
            validate_document_exists_and_owned(
                db, data.application.cover_letter_id, current_user
            )

        # Validate company_id if provided in opportunity
        if data.opportunity.company_id is not None:
            validate_company_exists_and_owned(
                db, data.opportunity.company_id, current_user
            )

        # Create Opportunity with owner_id
        opportunity_data = data.opportunity.model_dump()
        opportunity_data['owner_id'] = current_user.id

        db_opportunity = OpportunityModel(**opportunity_data)
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing application.

    - **application_id**: The ID of the application to update
    - All fields are optional

    Returns 404 if application doesn't exist or doesn't belong to the authenticated user.
    """
    db_application = get_owned_entity_or_404(
        db=db,
        entity_model=ApplicationModel,
        entity_id=application_id,
        owner_id=current_user.id,
        entity_name="Application",
        requires_joins=[JoinSpec(model=OpportunityModel, owner_field='owner_id')]
    )

    update_data = application_update.model_dump(exclude_unset=True)

    # Validate updated FKs if present
    if "opportunity_id" in update_data:
        validate_opportunity_exists_and_owned(db, update_data["opportunity_id"], current_user)
    if "resume_used_id" in update_data and update_data["resume_used_id"] is not None:
        validate_document_exists_and_owned(db, update_data["resume_used_id"], current_user)
    if "cover_letter_id" in update_data and update_data["cover_letter_id"] is not None:
        validate_document_exists_and_owned(db, update_data["cover_letter_id"], current_user)

    # Update fields
    for field, value in update_data.items():
        setattr(db_application, field, value)

    db.commit()
    db.refresh(db_application)
    return db_application

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an application.

    - **application_id**: The ID of the application to delete

    Returns 404 if application doesn't exist or doesn't belong to the authenticated user.
    """
    db_application = get_owned_entity_or_404(
        db=db,
        entity_model=ApplicationModel,
        entity_id=application_id,
        owner_id=current_user.id,
        entity_name="Application",
        requires_joins=[JoinSpec(model=OpportunityModel, owner_field='owner_id')]
    )

    db.delete(db_application)
    db.commit()
    return
