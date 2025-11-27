"""
Action model - represents a follow-up action or note.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Action(Base):
    """
    Action model.

    Represents an action related to an application (follow-up, note, decision, etc.).
    Actions can be chained using parent_action_id to track a sequence of events.
    Can be linked to a scheduled event for interviews/meetings.
    """
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # follow_up, note, rejection, offer, other
    completed_date = Column(DateTime(timezone=True), nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    parent_action_id = Column(Integer, ForeignKey("actions.id", ondelete="SET NULL"), nullable=True)
    scheduled_event_id = Column(Integer, ForeignKey("scheduled_events.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="actions")
    parent_action = relationship("Action", remote_side=[id], backref="child_actions")
    scheduled_event = relationship("ScheduledEvent", back_populates="actions")

    def __repr__(self):
        return f"<Action(id={self.id}, type='{self.type}', is_completed={self.is_completed})>"
