"""Pydantic schemas for Action entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ActionBase(BaseModel):
    """Base schema with common fields for Action."""
    type: str = Field(..., min_length=1, max_length=50, description="Type of action (follow_up, note, etc.)")
    completed_date: Optional[datetime] = Field(None, description="Date when action was completed")
    is_completed: bool = Field(default=False, description="Completion status")
    notes: Optional[str] = Field(None, max_length=50000, description="Details or notes about the action")
    parent_action_id: Optional[int] = Field(None, gt=0, description="ID of parent action for threading")
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
    is_completed: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=50000)
    parent_action_id: Optional[int] = Field(None, gt=0)
    scheduled_event_id: Optional[int] = Field(None, gt=0)
    application_id: Optional[int] = Field(None, gt=0)


class Action(ActionBase):
    """Schema for reading an action (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    application_id: int = Field(..., description="ID of the related application")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class ActionInDB(Action):
    """Complete schema representing an action as stored in database."""
    pass
