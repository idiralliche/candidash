"""Pydantic schemas for ScheduledEvent entity."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.scheduled_event import EventStatus, CommunicationMethod
from app.utils.validators import validate_and_normalize_phone

class ScheduledEventBase(BaseModel):
    """Base schema with common fields for ScheduledEvent."""
    title: str = Field(..., min_length=1, max_length=255, description="Event title (e.g., 'HR Interview')")
    event_type: Optional[str] = Field(None, max_length=100, description="Type of event (interview, call, meeting)")
    scheduled_date: datetime = Field(..., description="Date and time of the event")
    duration_minutes: Optional[int] = Field(None, ge=1, description="Duration in minutes")

    # Access/Location details
    communication_method: Optional[CommunicationMethod] = Field(None, description="Method (video, phone, etc.)")
    event_link: Optional[str] = Field(None, description="URL for video call or meeting details")
    phone_number: Optional[str] = Field(None, max_length=20, description="Phone number if applicable")
    location: Optional[str] = Field(None, description="Physical address or location info")
    instructions: Optional[str] = Field(None, description="Specific instructions for the candidate")

    status: EventStatus = Field(default=EventStatus.PENDING, description="Current status of the event")
    notes: Optional[str] = Field(None, description="Private notes about the event")

    @field_validator('phone_number', mode='before')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_and_normalize_phone(v)


class ScheduledEventCreate(ScheduledEventBase):
    """Schema for creating a new scheduled event (POST)."""
    pass


class ScheduledEventUpdate(BaseModel):
    """Schema for updating a scheduled event (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    event_type: Optional[str] = Field(None, max_length=100)
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)

    communication_method: Optional[CommunicationMethod] = None
    event_link: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = None
    instructions: Optional[str] = None

    status: Optional[EventStatus] = None
    notes: Optional[str] = None

    @field_validator('phone_number', mode='before')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return validate_and_normalize_phone(v)


class ScheduledEvent(ScheduledEventBase):
    """Schema for reading a scheduled event (GET).
    Includes all fields including generated ones (id, timestamps).
    """
    id: int = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class ScheduledEventInDB(ScheduledEvent):
    """Complete schema representing a scheduled event as stored in database."""
    pass
