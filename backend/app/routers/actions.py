"""
Action routes - CRUD operations for actions.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.action import Action as ActionModel
from app.schemas.action import Action, ActionCreate, ActionUpdate
from app.utils.validators.ownership_validators import (
    validate_application_exists_and_owned,
    validate_scheduled_event_exists_and_owned
)
from app.utils.db import get_owned_entity_or_404

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("/", response_model=List[Action])
def get_actions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    completed: Optional[bool] = Query(None, description="Filter by completion status (true=completed_date IS NOT NULL)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of actions owned by the current user with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **application_id**: Optional filter by application ID
    - **completed**: Filter by completion (true=completed_date NOT NULL, false=NULL)
    """
    query = db.query(ActionModel).filter(
        ActionModel.owner_id == current_user.id
    )

    if application_id is not None:
        validate_application_exists_and_owned(db, application_id, current_user)
        query = query.filter(ActionModel.application_id == application_id)

    if completed is not None:
        if completed:
            query = query.filter(ActionModel.completed_date.isnot(None))
        else:
            query = query.filter(ActionModel.completed_date.is_(None))

    actions = query.order_by(ActionModel.created_at.asc()).offset(skip).limit(limit).all()
    return actions

@router.get("/{action_id}", response_model=Action)
def get_action(
    action_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific action by ID.

    - **action_id**: The ID of the action to retrieve

    Returns 404 if action doesn't exist or doesn't belong to the authenticated user.
    """
    action = get_owned_entity_or_404(
        db=db,
        entity_model=ActionModel,
        entity_id=action_id,
        owner_id=current_user.id,
        entity_name="Action",
    )
    return action

@router.post("/", response_model=Action, status_code=201)
def create_action(
    action: ActionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new action.

    - **application_id**: ID of the application (required)
    - **type**: Type of action (required)
    - **scheduled_event_id**: ID of associated event (optional)
    """
    # Validate foreign keys ownership
    validate_application_exists_and_owned(db, action.application_id, current_user)
    if action.scheduled_event_id is not None:
        validate_scheduled_event_exists_and_owned(db, action.scheduled_event_id, current_user)

    # owner_id automatique
    action_data = action.model_dump()
    action_data['owner_id'] = current_user.id

    db_action = ActionModel(**action_data)
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action

@router.put("/{action_id}", response_model=Action)
def update_action(
    action_id: int,
    action_update: ActionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing action.

    - **action_id**: The ID of the action to update
    - All fields are optional

    Returns 404 if action doesn't exist or doesn't belong to the authenticated user.
    """
    db_action = get_owned_entity_or_404(
        db=db,
        entity_model=ActionModel,
        entity_id=action_id,
        owner_id=current_user.id,
        entity_name="Action"
    )

    update_data = action_update.model_dump(exclude_unset=True)

    if "application_id" in update_data :
        validate_application_exists_and_owned(db, update_data["application_id"], current_user)

    if "scheduled_event_id" in update_data and update_data["scheduled_event_id"] is not None:
        validate_scheduled_event_exists_and_owned(db, update_data["scheduled_event_id"], current_user)

    # Update fields (no ownership change allowed)
    for field, value in update_data.items():
        if field != 'owner_id':  # Protection
            setattr(db_action, field, value)

    db.commit()
    db.refresh(db_action)
    return db_action

@router.delete("/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action(
    action_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an action.

    - **action_id**: The ID of the action to delete

    Returns 404 if action doesn't exist or doesn't belong to the authenticated user.
    """
    db_action = get_owned_entity_or_404(
        db=db,
        entity_model=ActionModel,
        entity_id=action_id,
        owner_id=current_user.id,
        entity_name="Action"
    )

    db.delete(db_action)
    db.commit()
    return
