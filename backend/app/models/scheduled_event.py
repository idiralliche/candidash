"""
ScheduledEvent model - represents a scheduled event (interview, meeting, call).
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EventStatus(str, enum.Enum):
    """Status of scheduled event."""
    PENDING = "pending"  # Awaiting confirmation
    CONFIRMED = "confirmed"  # Confirmed
    RESCHEDULED = "rescheduled"  # Rescheduled to another date
    CANCELLED = "cancelled"  # Cancelled
    COMPLETED = "completed"  # Completed


class CommunicationMethod(str, enum.Enum):
    """Method of communication for the event."""
    VIDEO = "video"  # Zoom, Teams, Meet
    PHONE = "phone"
    IN_PERSON = "in_person"
    EMAIL = "email"
    OTHER = "other"


class ScheduledEvent(Base):
    """
    ScheduledEvent model.

    Represents a scheduled event like an interview, meeting, or call.
    Can be exported to calendar applications.
    Contains all practical information needed for the event.
    """
    __tablename__ = "scheduled_events"

    id = Column(Integer, primary_key=True, index=True)

    # Event details
    title = Column(String(255), nullable=False)  # "Technical interview", "HR call", etc.
    event_type = Column(String(100), nullable=True)  # Free text: interview, call, meeting, etc.
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=True)  # e.g., 30, 60

    # Access/Location details
    communication_method = Column(Enum(CommunicationMethod), nullable=True)
    event_link = Column(Text, nullable=True)  # Zoom, Teams, Calendly, etc.
    phone_number = Column(String(20), nullable=True)  # Phone number if phone call
    location = Column(Text, nullable=True)  # Physical address if in-person
    instructions = Column(Text, nullable=True)  # "Ask for John at reception", "Room 3B"

    # Status
    status = Column(Enum(EventStatus), default=EventStatus.PENDING, nullable=False)

    # Notes
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    actions = relationship("Action", back_populates="scheduled_event")

    def __repr__(self):
        return f"<ScheduledEvent(id={self.id}, title='{self.title}', date={self.scheduled_date}, status={self.status})>"

