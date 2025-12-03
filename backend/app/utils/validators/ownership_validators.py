"""
Ownership validation functions for database entities.

These validators ensure that entities exist in the database and belong
to the authenticated user (multi-tenancy enforcement).

Usage: Call these functions in routers after getting current_user from Depends(get_current_user).
"""
from typing import Optional, Type, List, Tuple
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.document_association import EntityType


def validate_owned_entity(
    db: Session,
    entity_model: Type,
    entity_id: int,
    current_user: User,
    entity_name: Optional[str] = None,
    requires_joins: Optional[List[Tuple[Type, str]]] = None
) -> None:
    """
    Generic validator for entities with owner_id.

    Supports both direct ownership and inherited ownership through JOIN relationships.
    Automatically deduces entity name from model if not provided.

    Args:
        db: Database session
        entity_model: SQLAlchemy model class (Company, Document, Opportunity, etc.)
        entity_id: ID of the entity to validate
        current_user: Current authenticated user (from Depends(get_current_user))
        entity_name: Display name for error messages (auto-deduced if None)
        requires_joins: List of (JoinModel, owner_field_name) tuples for entities that
                        inherit ownership through relationships.
                        Example: [(Application, None), (Opportunity, 'owner_id')] for Action

    Raises:
        HTTPException 404: If entity doesn't exist or doesn't belong to user

    Examples:
        # Direct ownership
        validate_owned_entity(db, Company, 42, current_user)

        # With custom name
        validate_owned_entity(db, Company, 42, current_user, "Entreprise")

        # Inherited ownership (Application via Opportunity)
        validate_owned_entity(
            db, Application, 10, current_user,
            requires_joins=[(Opportunity, 'owner_id')]
        )

        # Multiple JOINs (Action via Application via Opportunity)
        validate_owned_entity(
            db, Action, 5, current_user,
            requires_joins=[(Application, None), (Opportunity, 'owner_id')]
        )
    """
    # Auto-deduce entity name from model if not provided
    if entity_name is None:
        entity_name = entity_model.__name__

    if requires_joins:
        # Build query with multiple JOINs
        query = db.query(entity_model)

        for join_model, _ in requires_joins:
            query = query.join(join_model)

        # Get the last model that contains owner_id
        last_model = None
        owner_field = None
        for join_model, field in requires_joins:
            if field is not None:
                last_model = join_model
                owner_field = field

        if last_model is None or owner_field is None:
            raise ValueError("requires_joins must contain at least one tuple with owner_field")

        # Filter by entity ID and owner_id on the last model
        entity = query.filter(
            entity_model.id == entity_id,
            getattr(last_model, owner_field) == current_user.id
        ).first()
    else:
        # Direct ownership - entity has owner_id
        entity = db.query(entity_model).filter(
            entity_model.id == entity_id,
            entity_model.owner_id == current_user.id
        ).first()

    if not entity:
        raise HTTPException(
            status_code=404,
            detail=f"{entity_name} with id {entity_id} not found or doesn't belong to you"
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
        requires_joins=[(Opportunity, 'owner_id')]
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
