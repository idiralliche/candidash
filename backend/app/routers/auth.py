"""
Authentication routes - registration, login, refresh, and logout.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.core.cookies import CookieHandler
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.token import Token

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    - **email**: User email (must be unique)
    - **first_name**: User first name (optional)
    - **last_name**: User last name (optional)
    - **password**: Password (minimum 8 characters)
    - **confirm_password**: Password confirmation (must match)
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user with hashed password
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=get_password_hash(user_data.password),
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password.

    Returns Access Token in body and sets Refresh Token in HttpOnly cookie.
    """
    # Find user by email (OAuth2 uses 'username' field)
    user = db.query(User).filter(User.email == form_data.username).first()

    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )

    # 1. Create Access Token (Short lived, returned in JSON)
    access_token = create_access_token(subject=user.email)

    # 2. Create Refresh Token (Long lived, stored in DB + Cookie)
    refresh_token_str = create_refresh_token(subject=user.email)

    # Calculate absolute expiration time for DB
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

    # Store in DB
    db_refresh_token = RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()

    # Set HttpOnly Cookie
    CookieHandler.set_refresh_cookie(response, refresh_token_str)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
def refresh_token(
    response: Response,
    refreshToken: Optional[str] = Cookie(None, alias=settings.REFRESH_TOKEN_COOKIE_NAME),
    db: Session = Depends(get_db)
):
    """
    Refresh access token using the refresh token from cookie.

    Performs token rotation: invalidates old refresh token and issues a new one.
    """
    if not refreshToken:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    # 1. Validate JWT structure and signature
    payload = decode_refresh_token(refreshToken)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # 2. Check DB: Token must exist and not be blacklisted
    # We use the token string itself to find the record (it's unique/indexed)
    stored_token = db.query(RefreshToken).filter(RefreshToken.token == refreshToken).first()

    if not stored_token:
        # Token valid cryptographically but not in DB (maybe deleted/expired cleanly)
        CookieHandler.delete_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or expired",
        )

    if stored_token.is_blacklisted:
        # Security Alert: Reuse detection could be implemented here
        CookieHandler.delete_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked",
        )

    # 3. Get User
    user = db.query(User).filter(User.id == stored_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")

    # 4. Token Rotation Logic
    if settings.ROTATE_REFRESH_TOKENS:
        # Invalidate old token
        stored_token.is_blacklisted = True
        stored_token.blacklisted_at = datetime.now(timezone.utc)

        # Create NEW refresh token
        new_refresh_token_str = create_refresh_token(subject=user.email)
        new_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

        # Save NEW token to DB
        new_db_token = RefreshToken(
            token=new_refresh_token_str,
            user_id=user.id,
            expires_at=new_expires_at
        )
        db.add(new_db_token)

        # Set NEW cookie
        CookieHandler.set_refresh_cookie(response, new_refresh_token_str)

    else:
        # If no rotation, we just return a new access token and keep the old refresh token
        # (Not recommended but supported by config)
        pass

    db.commit()

    # 5. Create NEW Access Token
    access_token = create_access_token(subject=user.email)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refreshToken: Optional[str] = Cookie(None, alias=settings.REFRESH_TOKEN_COOKIE_NAME),
    db: Session = Depends(get_db)
):
    """
    Logout user by blacklisting the refresh token and clearing the cookie.
    """
    if refreshToken:
        # Find and blacklist token in DB
        stored_token = db.query(RefreshToken).filter(RefreshToken.token == refreshToken).first()
        if stored_token:
            stored_token.is_blacklisted = True
            stored_token.blacklisted_at = datetime.now(timezone.utc)
            db.commit()

    # Always clear cookie even if token not found in DB
    CookieHandler.delete_refresh_cookie(response)
    return


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout from all devices.

    Requires valid Access Token. Revokes all refresh tokens for the current user.
    """
    # Delete all refresh tokens for this user
    # Or mark them blacklisted. Deleting is cleaner for "logout all" to free space.
    db.query(RefreshToken).filter(RefreshToken.user_id == current_user.id).delete()
    db.commit()

    # Clear cookie on this device
    CookieHandler.delete_refresh_cookie(response)
    return
