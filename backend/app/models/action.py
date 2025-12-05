"""
Action model - represents a follow-up action or note.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Action(Base):
    """
    Action model.

    Represents an action related to an application (follow-up, note, decision, etc.).
    Can be linked to a scheduled event for interviews/meetings.
    Each action belongs to a specific user (multi-tenancy).
    """
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # follow_up, note, rejection, offer, other
    completed_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    scheduled_event_id = Column(Integer, ForeignKey("scheduled_events.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="actions")
    application = relationship("Application", back_populates="actions")
    scheduled_event = relationship("ScheduledEvent", back_populates="actions")

    def __repr__(self):
        return f"<Action(id={self.id}, type='{self.type}', is_completed={self.is_completed})>"
