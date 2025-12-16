"""
RefreshToken model - manages JWT refresh tokens for user sessions.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class RefreshToken(Base):
    """
    RefreshToken model.

    Stores long-lived refresh tokens with their expiration and revocation status.
    Linked to a specific user.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Revocation status (for rotation and manual logout)
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    blacklisted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, is_blacklisted={self.is_blacklisted})>"
