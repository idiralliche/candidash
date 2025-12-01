"""
Action routes - CRUD operations for actions.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.action import Action as ActionModel
from app.schemas.action import Action, ActionCreate, ActionUpdate

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("/", response_model=List[Action])
def get_actions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    application_id: Optional[int] = Query(None, description="Filter by application ID"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of actions with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **application_id**: Optional filter by application
    - **is_completed**: Optional filter by completion status
    """
    query = db.query(ActionModel)

    if application_id is not None:
        query = query.filter(ActionModel.application_id == application_id)

    if is_completed is not None:
        query = query.filter(ActionModel.is_completed == is_completed)

    actions = query.offset(skip).limit(limit).all()
    return actions


@router.get("/{action_id}", response_model=Action)
def get_action(action_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific action by ID.

    - **action_id**: The ID of the action to retrieve
    """
    action = db.query(ActionModel).filter(ActionModel.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action


def validate_foreign_keys(
    db: Session,
    application_id: Optional[int] = None,
    scheduled_event_id: Optional[int] = None,
    parent_action_id: Optional[int] = None
):
    """Helper to validate foreign keys existence."""
    if application_id is not None:
        from app.models.application import Application
        if not db.query(Application).filter(Application.id == application_id).first():
            raise HTTPException(status_code=404, detail=f"Application with id {application_id} not found")

    if scheduled_event_id is not None:
        from app.models.scheduled_event import ScheduledEvent
        if not db.query(ScheduledEvent).filter(ScheduledEvent.id == scheduled_event_id).first():
            raise HTTPException(status_code=404, detail=f"ScheduledEvent with id {scheduled_event_id} not found")

    if parent_action_id is not None:
        # Check if parent action exists (self-referential)
        if not db.query(ActionModel).filter(ActionModel.id == parent_action_id).first():
            raise HTTPException(status_code=404, detail=f"Parent Action with id {parent_action_id} not found")


def validate_circular_dependency(db: Session, action_id: int, parent_id: int):
    """Check for circular dependencies when setting a parent action."""
    if action_id == parent_id:
        raise HTTPException(status_code=400, detail="Self-reference detected: Action cannot be its own parent")

    current_id = parent_id
    # We use a set to track visited nodes to handle existing cycles in DB if any
    visited = {action_id}

    # Safety limit to prevent infinite loops if data is already corrupted
    max_depth = 50
    depth = 0

    while current_id is not None:
        if current_id in visited:
             raise HTTPException(status_code=400, detail="Circular dependency detected in action chain")

        visited.add(current_id)
        depth += 1
        if depth > max_depth:
            # Stop verification if chain is too deep
            break

        # Fetch parent of current node
        result = db.query(ActionModel).filter(ActionModel.id == current_id).first()

        if not result:
            break

        current_id = result.parent_action_id


@router.post("/", response_model=Action, status_code=201)
def create_action(action: ActionCreate, db: Session = Depends(get_db)):
    """
    Create a new action.

    - **application_id**: ID of the application (required)
    - **type**: Type of action (required)
    - **scheduled_event_id**: ID of associated event (optional)
    - **parent_action_id**: ID of parent action (optional)
    """
    # Verify FKs
    validate_foreign_keys(
        db,
        application_id=action.application_id,
        scheduled_event_id=action.scheduled_event_id,
        parent_action_id=action.parent_action_id
    )

    db_action = ActionModel(**action.model_dump())
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    return db_action


@router.put("/{action_id}", response_model=Action)
def update_action(
    action_id: int,
    action_update: ActionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing action.

    - **action_id**: The ID of the action to update
    - All fields are optional
    """
    db_action = db.query(ActionModel).filter(ActionModel.id == action_id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action not found")

    # Check validation for FKs if they are present in update data
    update_data = action_update.model_dump(exclude_unset=True)

    validate_foreign_keys(
        db,
        application_id=update_data.get("application_id"),
        scheduled_event_id=update_data.get("scheduled_event_id"),
        parent_action_id=update_data.get("parent_action_id")
    )

    # Check for circular dependency if parent_action_id is being updated
    if "parent_action_id" in update_data and update_data["parent_action_id"] is not None:
        validate_circular_dependency(db, action_id, update_data["parent_action_id"])

    # Update fields
    for field, value in update_data.items():
        setattr(db_action, field, value)

    db.commit()
    db.refresh(db_action)
    return db_action


@router.delete("/{action_id}", status_code=204)
def delete_action(action_id: int, db: Session = Depends(get_db)):
    """
    Delete an action.

    - **action_id**: The ID of the action to delete
    """
    db_action = db.query(ActionModel).filter(ActionModel.id == action_id).first()
    if not db_action:
        raise HTTPException(status_code=404, detail="Action not found")

    db.delete(db_action)
    db.commit()
    return None
