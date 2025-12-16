"""
Cookie management utilities for secure token storage.
"""
from fastapi import Response
from app.config import settings

class CookieHandler:
    """
    Handles setting and deleting secure cookies for refresh tokens.
    """

    @staticmethod
    def set_refresh_cookie(response: Response, token: str) -> None:
        """
        Set the refresh token in a secure HttpOnly cookie.

        Args:
            response: The FastAPI response object
            token: The JWT refresh token string
        """
        response.set_cookie(
            key=settings.REFRESH_TOKEN_COOKIE_NAME,
            value=token,
            max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,  # Convert minutes to seconds
            path=settings.REFRESH_TOKEN_COOKIE_PATH,
            domain=None,  # Standard: current domain
            secure=settings.REFRESH_TOKEN_COOKIE_SECURE,
            httponly=settings.REFRESH_TOKEN_COOKIE_HTTPONLY,
            samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
        )

    @staticmethod
    def delete_refresh_cookie(response: Response) -> None:
        """
        Remove the refresh token cookie.

        Args:
            response: The FastAPI response object
        """
        response.delete_cookie(
            key=settings.REFRESH_TOKEN_COOKIE_NAME,
            path=settings.REFRESH_TOKEN_COOKIE_PATH,
            domain=None,
            secure=settings.REFRESH_TOKEN_COOKIE_SECURE,
            httponly=settings.REFRESH_TOKEN_COOKIE_HTTPONLY,
            samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
        )
