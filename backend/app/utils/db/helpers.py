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
    options: Optional[List[Any]] = None,
) -> T:
    """
    Retrieve an entity by its ID with ownership validation.

    Supports both direct ownership (entity.owner_id) and inherited ownership
    through JOIN relationships. Returns the entity in a single query.

    Args:
        db: SQLAlchemy session
        entity_model: SQLAlchemy model class (e.g., Company, Application)
        entity_id: Primary key of the entity to retrieve (must be positive)
        owner_id: ID of the user who should own the entity
        entity_name: Optional human-readable name for error messages
                    (defaults to model.__name__)
        requires_joins: List of JoinSpec for entities whose ownership
                       is inherited through relationships
        options: List of SQLAlchemy query options (e.g., [joinedload(Model.field)])

    Returns:
        The entity instance if found and owned by the user

    Raises:
        ValueError: If entity_id <= 0 or entity_model is None
        ValueError: If requires_joins is provided but contains no owner_field
        HTTPException: 404 if the entity does not exist or is not owned by the user

    Examples:
        # Direct ownership with eager loading
        contact = get_owned_entity_or_404(
            db=db,
            entity_model=Contact,
            entity_id=contact_id,
            owner_id=current_user.id,
            options=[joinedload(Contact.company)]
        )
    """
    # Input validation
    if entity_id <= 0:
        raise ValueError(f"entity_id must be a positive integer, got: {entity_id}")

    if entity_model is None:
        raise ValueError("entity_model cannot be None")

    entity_name = entity_name or entity_model.__name__
    query: Query = db.query(entity_model)

    # Apply query options (optimizations like joinedload)
    if options:
        for option in options:
            query = query.options(option)

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
