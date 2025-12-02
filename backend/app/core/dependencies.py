"""
FastAPI dependencies for authentication and authorization.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


# OAuth2 scheme - automatically extracts token from Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        token: JWT token extracted from Authorization header
        db: Database session

    Returns:
        The authenticated User object

    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode and verify token
    email = decode_access_token(token)
    if email is None:
        raise credentials_exception

    # Retrieve user from database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get the current active user.

    This is an alias for get_current_user (already checks is_active).
    Can be extended later for additional checks (email verified, etc.).

    Args:
        current_user: The authenticated user

    Returns:
        The authenticated active User object
    """
    return current_user
