"""
Utility functions for database cleanup tasks.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken


def delete_expired_tokens(db: Session, retention_days: int = 7) -> int:
    """
    Delete refresh tokens that have been expired for more than 'retention_days'.

    Tokens are kept for a grace period (default 7 days) after expiration
    for audit or debugging purposes before being permanently deleted.

    Args:
        db: Database session
        retention_days: Number of days to keep expired tokens (default: 7)

    Returns:
        int: Number of deleted tokens
    """
    # Calculate cut-off date: Now minus retention period
    # Tokens expiring BEFORE this date are deleted
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=retention_days)

    # Query to delete tokens where expires_at < cutoff_date
    # Using delete() directly is more efficient than fetching objects first
    deleted_count = db.query(RefreshToken).filter(
        RefreshToken.expires_at < cutoff_date
    ).delete()

    db.commit()

    return deleted_count
