"""
Ownership validation functions for database entities.

These validators ensure that entities exist in the database and belong
to the authenticated user (multi-tenancy enforcement).

Usage: Call these functions in routers after getting current_user from Depends(get_current_user).
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.document_association import EntityType
from app.utils.db.helpers import get_owned_entity_or_404, JoinSpec


def validate_owned_entity(
    db: Session,
    entity_model: type,
    entity_id: int,
    current_user: User,
    entity_name: Optional[str] = None,
    requires_joins: Optional[list[JoinSpec]] = None
) -> None:
    """
    Validate entity ownership without returning the entity.

    This is a semantic wrapper around get_owned_entity_or_404 for cases
    where you only need to validate ownership without retrieving the entity
    (e.g., before creating a related entity).

    Supports both direct ownership and inherited ownership through JOIN relationships.

    Args:
        db: Database session
        entity_model: SQLAlchemy model class (Company, Document, Opportunity, etc.)
        entity_id: ID of the entity to validate
        current_user: Current authenticated user (from Depends(get_current_user))
        entity_name: Display name for error messages (auto-deduced if None)
        requires_joins: List of JoinSpec for entities that inherit ownership
                       through relationships

    Raises:
        HTTPException 404: If entity doesn't exist or doesn't belong to user

    Examples:
        # Direct ownership validation (before creating a contact)
        validate_owned_entity(db, Company, company_id, current_user)

        # Inherited ownership validation (before creating an action)
        validate_owned_entity(
            db, Application, application_id, current_user,
            requires_joins=[JoinSpec(model=Opportunity, owner_field='owner_id')]
        )
    """
    # Call get_owned_entity_or_404 but discard the result
    get_owned_entity_or_404(
        db=db,
        entity_model=entity_model,
        entity_id=entity_id,
        owner_id=current_user.id,
        entity_name=entity_name,
        requires_joins=requires_joins
    )


def validate_company_exists_and_owned(
    db: Session,
    company_id: Optional[int],
    current_user: User
) -> None:
    """
    Validate that a company exists and belongs to the current user.

    Supports optional FK (returns silently if company_id is None).

    Args:
        db: Database session
        company_id: ID of the company (can be None for optional FK)
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If company_id is provided but doesn't exist or doesn't belong to user
    """
    if company_id is None:
        return

    from app.models.company import Company

    validate_owned_entity(
        db=db,
        entity_model=Company,
        entity_id=company_id,
        current_user=current_user
    )


def validate_document_exists_and_owned(
    db: Session,
    document_id: int,
    current_user: User
) -> None:
    """
    Validate that a document exists and belongs to the current user.

    Args:
        db: Database session
        document_id: ID of the document
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If document doesn't exist or doesn't belong to user
    """
    from app.models.document import Document

    validate_owned_entity(
        db=db,
        entity_model=Document,
        entity_id=document_id,
        current_user=current_user
    )


def validate_opportunity_exists_and_owned(
    db: Session,
    opportunity_id: int,
    current_user: User
) -> None:
    """
    Validate that an opportunity exists and belongs to the current user.

    Args:
        db: Database session
        opportunity_id: ID of the opportunity
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If opportunity doesn't exist or doesn't belong to user
    """
    from app.models.opportunity import Opportunity

    validate_owned_entity(
        db=db,
        entity_model=Opportunity,
        entity_id=opportunity_id,
        current_user=current_user
    )


def validate_application_exists_and_owned(
    db: Session,
    application_id: int,
    current_user: User
) -> None:
    """
    Validate that an application exists and belongs to the current user.

    Application inherits ownership through Opportunity, so this performs a JOIN.

    Args:
        db: Database session
        application_id: ID of the application
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If application doesn't exist or doesn't belong to user
    """
    from app.models.application import Application
    from app.models.opportunity import Opportunity

    validate_owned_entity(
        db=db,
        entity_model=Application,
        entity_id=application_id,
        current_user=current_user,
        requires_joins=[JoinSpec(model=Opportunity, owner_field='owner_id')]
    )


def validate_scheduled_event_exists_and_owned(
    db: Session,
    scheduled_event_id: Optional[int],
    current_user: User
) -> None:
    """
    Validate that a scheduled event exists and belongs to the current user.

    Supports optional FK (returns silently if scheduled_event_id is None).

    Args:
        db: Database session
        scheduled_event_id: ID of the scheduled event (can be None for optional FK)
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If scheduled_event_id is provided but doesn't exist or doesn't belong to user
    """
    if scheduled_event_id is None:
        return

    from app.models.scheduled_event import ScheduledEvent

    validate_owned_entity(
        db=db,
        entity_model=ScheduledEvent,
        entity_id=scheduled_event_id,
        current_user=current_user
    )


def validate_entity_exists_and_owned(
    db: Session,
    entity_type: EntityType,
    entity_id: int,
    current_user: User
) -> None:
    """
    Validate that a polymorphic entity exists and belongs to the current user.

    Used specifically for DocumentAssociation's polymorphic relationships.
    Maps EntityType enum values to their corresponding models and validates ownership.

    Args:
        db: Database session
        entity_type: Type of entity from EntityType enum (application, opportunity, company, contact)
        entity_id: ID of the entity
        current_user: Current authenticated user

    Raises:
        HTTPException 404: If entity doesn't exist or doesn't belong to user
        HTTPException 500: If entity_type is not handled (should never happen)
    """
    from fastapi import HTTPException

    if entity_type == EntityType.APPLICATION:
        validate_application_exists_and_owned(db, entity_id, current_user)

    elif entity_type == EntityType.OPPORTUNITY:
        validate_opportunity_exists_and_owned(db, entity_id, current_user)

    elif entity_type == EntityType.COMPANY:
        validate_company_exists_and_owned(db, entity_id, current_user)

    elif entity_type == EntityType.CONTACT:
        from app.models.contact import Contact
        validate_owned_entity(db, Contact, entity_id, current_user)

    else:
        # Should never happen if EntityType enum is properly defined
        raise HTTPException(
            status_code=500,
            detail=f"Unhandled entity type: {entity_type}"
        )
