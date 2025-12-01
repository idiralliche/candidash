"""
ScheduledEvent routes - CRUD operations for scheduled events.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scheduled_event import ScheduledEvent as ScheduledEventModel
from app.models.scheduled_event import EventStatus
from app.schemas.scheduled_event import ScheduledEvent, ScheduledEventCreate, ScheduledEventUpdate

router = APIRouter(prefix="/scheduled-events", tags=["scheduled_events"])


@router.get("/", response_model=List[ScheduledEvent])
def get_scheduled_events(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records to return"),
    status: Optional[EventStatus] = Query(None, description="Filter by event status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of scheduled events with pagination and optional filtering.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (max 100)
    - **status**: Optional filter by event status (pending, confirmed, etc.)
    """
    query = db.query(ScheduledEventModel)

    if status is not None:
        query = query.filter(ScheduledEventModel.status == status)

    events = query.offset(skip).limit(limit).all()
    return events


@router.get("/{event_id}", response_model=ScheduledEvent)
def get_scheduled_event(event_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific scheduled event by ID.

    - **event_id**: The ID of the event to retrieve
    """
    event = db.query(ScheduledEventModel).filter(ScheduledEventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Scheduled event not found")
    return event


@router.post("/", response_model=ScheduledEvent, status_code=201)
def create_scheduled_event(event: ScheduledEventCreate, db: Session = Depends(get_db)):
    """
    Create a new scheduled event.

    - **title**: Event title (required)
    - **scheduled_date**: Date and time (required)
    - **status**: Status (default: pending)
    - ... and other optional details
    """
    db_event = ScheduledEventModel(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.put("/{event_id}", response_model=ScheduledEvent)
def update_scheduled_event(
    event_id: int,
    event_update: ScheduledEventUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing scheduled event.

    - **event_id**: The ID of the event to update
    - All fields are optional
    """
    db_event = db.query(ScheduledEventModel).filter(ScheduledEventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Scheduled event not found")

    update_data = event_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_event, field, value)

    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}", status_code=204)
def delete_scheduled_event(event_id: int, db: Session = Depends(get_db)):
    """
    Delete a scheduled event.

    - **event_id**: The ID of the event to delete
    """
    db_event = db.query(ScheduledEventModel).filter(ScheduledEventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Scheduled event not found")

    db.delete(db_event)
    db.commit()
    return None
