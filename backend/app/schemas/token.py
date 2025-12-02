"""
Pydantic schemas for authentication tokens.
"""
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Token response schema.

    Returned after successful login.
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Token payload data schema.

    Used internally to represent decoded token data.
    """
    email: Optional[str] = None
