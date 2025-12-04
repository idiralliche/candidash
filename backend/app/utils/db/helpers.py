"""
Database query helpers for common operations.

Provides reusable functions for querying owned entities with proper
error handling and multi-tenancy enforcement.
"""
from dataclasses import dataclass
from typing import Type, Any, Optional, List, TypeVar
from sqlalchemy.orm import Session, Query
from fastapi import HTTPException, status

T = TypeVar('T')


@dataclass
class JoinSpec:
    """
    Specification for a JOIN required to validate entity ownership.

    Attributes:
        model: SQLAlchemy model class to join (e.g., Opportunity, Application)
        owner_field: Name of the owner_id field on this model (e.g., 'owner_id').
                    Set to None for intermediate joins without ownership.

    Examples:
        # Application ownership through Opportunity
        JoinSpec(model=Opportunity, owner_field='owner_id')

        # Action ownership through Application then Opportunity
        [
            JoinSpec(model=Application, owner_field=None),  # Intermediate join
            JoinSpec(model=Opportunity, owner_field='owner_id')  # Final owner
        ]
    """
    model: Type[Any]
    owner_field: Optional[str] = None


def get_owned_entity_or_404(
    db: Session,
    entity_model: Type[T],
    entity_id: int,
    owner_id: int,
    *,
    entity_name: Optional[str] = None,
    requires_joins: Optional[List[JoinSpec]] = None,
) -> T:
    """
    Retrieve an entity by its ID with ownership validation.

    Supports both direct ownership (entity.owner_id) and inherited ownership
    through JOIN relationships. Returns the entity in a single query.

    Args:
        db: SQLAlchemy session
        entity_model: SQLAlchemy model class (e.g., Company, Application)
        entity_id: Primary key of the entity to retrieve
        owner_id: ID of the user who should own the entity
        entity_name: Optional human-readable name for error messages
                    (defaults to model.__name__)
        requires_joins: List of JoinSpec for entities whose ownership
                       is inherited through relationships

    Returns:
        The entity instance if found and owned by the user

    Raises:
        HTTPException: 404 if the entity does not exist or is not owned by the user
        ValueError: If requires_joins is provided but contains no owner_field

    Examples:
        # Direct ownership
        company = get_owned_entity_or_404(
            db=db,
            entity_model=Company,
            entity_id=company_id,
            owner_id=current_user.id
        )

        # Inherited ownership via single JOIN
        application = get_owned_entity_or_404(
            db=db,
            entity_model=Application,
            entity_id=application_id,
            owner_id=current_user.id,
            requires_joins=[JoinSpec(model=Opportunity, owner_field='owner_id')]
        )

        # Inherited ownership via multiple JOINs
        action = get_owned_entity_or_404(
            db=db,
            entity_model=Action,
            entity_id=action_id,
            owner_id=current_user.id,
            requires_joins=[
                JoinSpec(model=Application, owner_field=None),
                JoinSpec(model=Opportunity, owner_field='owner_id')
            ]
        )
    """
    entity_name = entity_name or entity_model.__name__
    query: Query = db.query(entity_model)

    # Apply joins if required
    if requires_joins:
        for join_spec in requires_joins:
            query = query.join(join_spec.model)

        # Find the model with owner_field
        owner_spec = next(
            (spec for spec in requires_joins if spec.owner_field is not None),
            None
        )
        if not owner_spec:
            raise ValueError(
                "requires_joins must contain at least one JoinSpec with owner_field"
            )

        # Filter by entity ID and owner
        query = query.filter(
            entity_model.id == entity_id,
            getattr(owner_spec.model, owner_spec.owner_field) == owner_id,
        )
    else:
        # Direct ownership
        query = query.filter(
            entity_model.id == entity_id,
            entity_model.owner_id == owner_id,
        )

    # Execute the query
    entity = query.first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} not found",
        )

    return entity
