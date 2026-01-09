"""Pydantic schemas for Action entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.application import Application
from app.schemas.scheduled_event import ScheduledEvent


class ActionBase(BaseModel):
    """Base schema with common fields for Action."""
    type: str = Field(..., min_length=1, max_length=50, description="Type of action (follow_up, note, etc.)")
    completed_date: Optional[datetime] = Field(None, description="Date when action was completed (NULL = ongoing)")
    notes: Optional[str] = Field(None, max_length=5000, description="Details or notes about the action")
    scheduled_event_id: Optional[int] = Field(None, gt=0, description="ID of associated scheduled event")


class ActionCreate(ActionBase):
    """Schema for creating a new action (POST)."""
    application_id: int = Field(..., gt=0, description="ID of the related application")


class ActionUpdate(BaseModel):
    """Schema for updating an action (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    completed_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=5000)
    scheduled_event_id: Optional[int] = Field(None, gt=0)
    application_id: Optional[int] = Field(None, gt=0)


class Action(ActionBase):
    """Schema for reading an action (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    owner_id: int = Field(..., description="Owner user ID")
    application_id: int = Field(..., description="ID of the related application")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    application: Application
    scheduled_event: Optional[ScheduledEvent] = None

    model_config = ConfigDict(from_attributes=True)


class ActionInDB(Action):
    """Complete schema representing an action as stored in database."""
    pass
