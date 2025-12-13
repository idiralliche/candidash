"""
Users routes - CRUD operations for users.
"""
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=User)
def get_user(current_user: User = Depends(get_current_user)):
    """
    Get current user.

    Returns the authenticated user's informations.
    """
    return current_user
