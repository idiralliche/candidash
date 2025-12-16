"""
Script to clean up expired refresh tokens from the database.
Run this via cron job daily (e.g., at 02:00 AM).

Usage:
    python scripts/cleanup_expired_tokens.py
"""
import sys
from datetime import datetime
from pathlib import Path

# Add backend directory to python path to allow imports from app
# Assuming script is in backend/scripts/
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal
from app.utils.token_cleanup import delete_expired_tokens


def main():
    print(f"[{datetime.now()}] Starting token cleanup process...")

    db = None
    try:
        # Create a new database session
        db = SessionLocal()

        # Run cleanup (retention default: 7 days)
        count = delete_expired_tokens(db, retention_days=7)

        print(f"[{datetime.now()}] ✅ Cleanup successful. Deleted {count} old tokens.")

    except Exception as e:
        print(f"[{datetime.now()}] ❌ Error during cleanup: {e}")
        sys.exit(1)

    finally:
        if db:
            db.close()


if __name__ == "__main__":
    main()
