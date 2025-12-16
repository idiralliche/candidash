"""
Security utilities for password hashing and JWT token management.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import uuid
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from jose import jwt, JWTError
from app.config import settings


# Argon2 password hasher with secure defaults
# Parameters are tuned for web applications (balance security/performance)
ph = PasswordHasher(
    time_cost=2,        # Number of iterations (default: 2)
    memory_cost=65536,  # Memory usage in KB (64MB, default: 65536)
    parallelism=4,      # Number of parallel threads (default: 4)
    hash_len=32,        # Length of the hash in bytes (default: 32)
    salt_len=16         # Length of the salt in bytes (default: 16)
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if the plain password matches the hashed password.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except (VerifyMismatchError, InvalidHashError):
        return False


def get_password_hash(password: str) -> str:
    """
    Generate a secure hash from a plain password using Argon2id.

    Args:
        password: The plain text password to hash

    Returns:
        The hashed password string
    """
    return ph.hash(password)


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with an expiration time.

    Args:
        subject: The subject of the token (typically user email or ID)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token as string
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token with unique JTI and long expiration.

    Args:
        subject: The subject of the token (user ID)
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token as string
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

    # Generate unique identifier for the token (JTI)
    # This helps in tracking and blacklisting specific tokens
    token_id = str(uuid.uuid4())

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
        "jti": token_id
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and verify a JWT token, extracting the subject.

    Args:
        token: The JWT token to decode

    Returns:
        The subject (email/user_id) if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Verify token type if present to avoid using refresh tokens as access tokens
        if payload.get("type") and payload.get("type") != "access":
            return None

        subject: str = payload.get("sub")
        return subject
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """
    Decode and verify a refresh token, returning the full payload.

    Args:
        token: The JWT refresh token string

    Returns:
        The token payload dict if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Verify explicit token type
        if payload.get("type") != "refresh":
            return None

        return payload
    except JWTError:
        return None
