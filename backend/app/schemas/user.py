# backend/app/schemas/user.py
"""
Pydantic schemas for User entity.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """
    Base schema with common fields for User.
    """
    email: EmailStr = Field(..., description="User email address (unique)")
    first_name: Optional[str] = Field(None, max_length=100, description="User first name")
    last_name: Optional[str] = Field(None, max_length=100, description="User last name")


class UserCreate(UserBase):
    """
    Schema for creating a new user (POST /auth/register).
    Includes password confirmation validation.
    """
    password: str = Field(..., min_length=8, description="User password (minimum 8 characters)")
    confirm_password: str = Field(..., min_length=8, description="Password confirmation")

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v, info):
        """
        Validate that password and confirm_password match.
        """
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v


class UserUpdate(BaseModel):
    """
    Schema for updating a user (PUT/PATCH).
    All fields are optional to support partial updates.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class User(UserBase):
    """
    Schema for reading a user (GET).
    Includes all fields except password (never exposed).
    """
    id: int = Field(..., description="Unique identifier")
    is_active: bool = Field(..., description="Whether the user account is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


class UserInDB(User):
    """
    Complete schema representing a user as stored in database.
    Includes the hashed password (for internal use only, never exposed via API).
    """
    hashed_password: str = Field(..., description="Argon2 hashed password")
