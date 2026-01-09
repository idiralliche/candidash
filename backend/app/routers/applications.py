"""
Application routes - CRUD operations for applications.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
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
    validate_company_exists_and_owned
)
from app.utils.db import get_owned_entity_or_404
from app.utils.documents.helpers import (
    create_or_update_document_association_or_404,
    remove_document_association
)


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

    Returns only applications belonging to the authenticated user (owner_id direct).
    """
    query = db.query(ApplicationModel).options(
        joinedload(ApplicationModel.opportunity).joinedload(OpportunityModel.company),
        joinedload(ApplicationModel.resume_used),
        joinedload(ApplicationModel.cover_letter)
    ).filter(ApplicationModel.owner_id == current_user.id)

    if opportunity_id is not None:
        validate_opportunity_exists_and_owned(db, opportunity_id, current_user)
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
        options=[
            joinedload(ApplicationModel.opportunity).joinedload(OpportunityModel.company),
            joinedload(ApplicationModel.resume_used),
            joinedload(ApplicationModel.cover_letter)
        ]
    )
    return application

@router.post("/", response_model=Application, status_code=status.HTTP_201_CREATED)
def create_application(
    application: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new application.

    **Required Fields:**
    - **opportunity_id**: ID of the opportunity (must exist and belong to user)
    - **application_date**: Date of application (ISO format)

    **Optional Fields:**
    - **resume_used_id**: ID of resume document (auto-creates DocumentAssociation)
    - **cover_letter_id**: ID of cover letter document (auto-creates DocumentAssociation)
    - **status**: Application status (default: "pending")
    - **notes**: Additional notes

    **Automatic Associations:**
    When resume_used_id or cover_letter_id are provided, the system automatically
    creates DocumentAssociation linking the document to this application.

    **Returns:**
    - **201**: Application created successfully

    **Raises:**
    - **400**: Opportunity doesn't exist or belong to user
    - **404**: Document (resume/cover_letter) doesn't exist or belong to user
    - **401**: Unauthorized
    - **422**: Validation error
    """
    # Validate foreign keys ownership
    validate_opportunity_exists_and_owned(db, application.opportunity_id, current_user)

    # Create application
    application_data = application.model_dump()
    application_data['owner_id'] = current_user.id

    db_application = ApplicationModel(**application_data)
    db.add(db_application)
    db.flush()  # Get the application ID without committing

    if application.resume_used_id is not None:
        create_or_update_document_association_or_404(
            db=db,
            document_id=application.resume_used_id,
            entity_type="application",
            entity_id=db_application.id,
            current_user=current_user
        )

    if application.cover_letter_id is not None:
        create_or_update_document_association_or_404(
            db=db,
            document_id=application.cover_letter_id,
            entity_type="application",
            entity_id=db_application.id,
            current_user=current_user
        )

    db.commit()
    db.refresh(db_application)
    return db_application

@router.post("/with-opportunity", response_model=Application, status_code=status.HTTP_201_CREATED)
def create_application_with_opportunity(
    data: ApplicationWithOpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create an application and its linked opportunity in a single request.

    **Composite Endpoint Benefits:**
    - Atomicity: Both opportunity and application created in single transaction
    - Convenience: No need for separate API calls
    - Consistency: Guaranteed link between opportunity and application

    **Request Structure:**
    - **opportunity**: OpportunityCreate object (without opportunity_id)
    - **application_date**: Date of application
    - **resume_used_id**: Optional resume document (auto-creates DocumentAssociation)
    - **cover_letter_id**: Optional cover letter document (auto-creates DocumentAssociation)
    - **status**: Optional status (default: "pending")
    - **notes**: Optional notes

    **Automatic Associations:**
    When resume_used_id or cover_letter_id are provided, the system automatically
    creates DocumentAssociation linking the documents to the new application.

    **Returns:**
    - **201**: Application (with embedded opportunity_id) created successfully

    **Raises:**
    - **400**: Company doesn't exist or belong to user
    - **404**: Document (resume/cover_letter) doesn't exist or belong to user
    - **401**: Unauthorized
    - **422**: Validation error
    """
    try:
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

        # Create Application with owner_id and the generated opportunity_id
        application_data = data.application.model_dump()
        application_data['owner_id'] = current_user.id
        application_data['opportunity_id'] = db_opportunity.id
        db_application = ApplicationModel(**application_data)
        db.add(db_application)
        db.flush()  # Get application ID without committing

        # Auto-create document associations if resume_used_id or cover_letter_id provided
        if data.application.resume_used_id:
            create_or_update_document_association_or_404(
                db=db,
                document_id=data.application.resume_used_id,
                entity_type="application",
                entity_id=db_application.id,
                current_user=current_user
            )

        if data.application.cover_letter_id:
            create_or_update_document_association_or_404(
                db=db,
                document_id=data.application.cover_letter_id,
                entity_type="application",
                entity_id=db_application.id,
                current_user=current_user
            )

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

    **Updatable Fields:**
    - **opportunity_id**: Change linked opportunity (must exist and belong to user)
    - **application_date**: Update application date
    - **resume_used_id**: Change resume (auto-updates DocumentAssociation)
    - **cover_letter_id**: Change cover letter (auto-updates DocumentAssociation)
    - **status**: Update status
    - **notes**: Update notes

    **Automatic Association Management:**
    - Setting resume_used_id/cover_letter_id → creates DocumentAssociation
    - Changing resume_used_id/cover_letter_id → updates DocumentAssociation
    - Setting to null → removes DocumentAssociation

    **Returns:**
    - **200**: Application updated successfully

    **Raises:**
    - **400**: Opportunity doesn't exist or belong to user
    - **404**: Application or document not found or doesn't belong to user
    - **401**: Unauthorized
    - **422**: Validation error
    """
    db_application = get_owned_entity_or_404(
        db=db,
        entity_model=ApplicationModel,
        entity_id=application_id,
        owner_id=current_user.id,
        entity_name="Application",
    )

    update_data = application_update.model_dump(exclude_unset=True)

    # Validate updated FKs if present
    if "opportunity_id" in update_data:
        validate_opportunity_exists_and_owned(db, update_data["opportunity_id"], current_user)

    # Track old document IDs for association cleanup
    old_resume_id = db_application.resume_used_id
    old_cover_letter_id = db_application.cover_letter_id

    # Update fields (no ownership change allowed)
    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_application, field, value)

    db.flush()  # Apply changes without committing

    # Handle resume_used_id association changes
    if 'resume_used_id' in update_data:
        new_resume_id = update_data['resume_used_id']

        # Remove old association if resume changed
        if old_resume_id and old_resume_id != new_resume_id:
            remove_document_association(
                db=db,
                document_id=old_resume_id,
                entity_type="application",
                entity_id=application_id
            )

        # Create/update association if new resume provided
        if new_resume_id:
            create_or_update_document_association_or_404(
                db=db,
                document_id=new_resume_id,
                entity_type="application",
                entity_id=application_id,
                current_user=current_user
            )

    # Handle cover_letter_id association changes
    if 'cover_letter_id' in update_data:
        new_cover_letter_id = update_data['cover_letter_id']

        # Remove old association if cover letter changed
        if old_cover_letter_id and old_cover_letter_id != new_cover_letter_id:
            remove_document_association(
                db=db,
                document_id=old_cover_letter_id,
                entity_type="application",
                entity_id=application_id
            )

        # Create/update association if new cover letter provided
        if new_cover_letter_id:
            create_or_update_document_association_or_404(
                db=db,
                document_id=new_cover_letter_id,
                entity_type="application",
                entity_id=application_id,
                current_user=current_user
            )

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
    )

    db.delete(db_application)
    db.commit()
    return
