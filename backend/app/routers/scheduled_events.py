"""
ScheduledEvent routes - CRUD operations for scheduled events.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.scheduled_event import ScheduledEvent as ScheduledEventModel
from app.models.scheduled_event import EventStatus
from app.schemas.scheduled_event import ScheduledEvent, ScheduledEventCreate, ScheduledEventUpdate
from app.utils.db import get_owned_entity_or_404

router = APIRouter(prefix="/scheduled-events", tags=["scheduled_events"])

@router.get("/", response_model=List[ScheduledEvent])
def get_scheduled_events(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    status: Optional[EventStatus] = Query(None, description="Filter by event status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of scheduled events owned by the current user with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **status**: Optional filter by event status (pending, confirmed, etc.)

    Returns only scheduled events belonging to the authenticated user.
    """
    query = db.query(ScheduledEventModel).filter(
        ScheduledEventModel.owner_id == current_user.id
    )

    if status is not None:
        query = query.filter(ScheduledEventModel.status == status)

    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=ScheduledEvent)
def get_scheduled_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific scheduled event by ID.

    - **event_id**: The ID of the event to retrieve

    Returns 404 if event doesn't exist or doesn't belong to the authenticated user.
    """
    event = get_owned_entity_or_404(
        db=db,
        entity_model=ScheduledEventModel,
        entity_id=event_id,
        owner_id=current_user.id,
        entity_name="ScheduledEvent"
    )
    return event

@router.post("/", response_model=ScheduledEvent, status_code=201)
def create_scheduled_event(
    event: ScheduledEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new scheduled event.

    - **title**: Event title (required)
    - **scheduled_date**: Date and time (required)
    - **status**: Status (default: pending)
    - ... and other optional details

    The scheduled event will be automatically assigned to the authenticated user.
    """
    event_data = event.model_dump()
    event_data['owner_id'] = current_user.id

    db_event = ScheduledEventModel(**event_data)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=ScheduledEvent)
def update_scheduled_event(
    event_id: int,
    event_update: ScheduledEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing scheduled event.

    - **event_id**: The ID of the event to update
    - All fields are optional

    Returns 404 if event doesn't exist or doesn't belong to the authenticated user.
    """
    db_event = get_owned_entity_or_404(
        db=db,
        entity_model=ScheduledEventModel,
        entity_id=event_id,
        owner_id=current_user.id,
        entity_name="ScheduledEvent"
    )

    update_data = event_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field != 'owner_id':
            setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scheduled_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a scheduled event.

    - **event_id**: The ID of the event to delete

    Returns 404 if event doesn't exist or doesn't belong to the authenticated user.
    """
    db_event = get_owned_entity_or_404(
        db=db,
        entity_model=ScheduledEventModel,
        entity_id=event_id,
        owner_id=current_user.id,
        entity_name="ScheduledEvent"
    )

    db.delete(db_event)
    db.commit()
    return
