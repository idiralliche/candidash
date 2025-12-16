"""
Pydantic schemas for authentication tokens.
"""
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Token response schema.

    Returned after successful login or token refresh.
    Contains the access token (short lived).
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Token payload data schema.

    Used internally to represent decoded token data.
    """
    email: Optional[str] = None


class TokenPayload(BaseModel):
    """
    Full token payload schema (Access or Refresh).
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None
    jti: Optional[str] = None  # Unique ID for refresh tokens
