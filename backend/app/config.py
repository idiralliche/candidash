from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


def _read_secret(secret_name: str) -> str | None:
    """
    Read secret from Docker secrets mounted at /run/secrets/.

    Args:
        secret_name: Name of the secret file to read

    Returns:
        Content of the secret file (stripped), or None if file doesn't exist
    """
    secret_path = Path(f"/run/secrets/{secret_name}")
    if secret_path.exists():
        return secret_path.read_text().strip()
    return None


class Settings(BaseSettings):
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "CandiDash API"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    DATABASE_URL: str

    # Documents
    DOCUMENTS_PATH: str = "/app/documents"
    MAX_FILE_SIZE_MB: int = 10
    MAX_DOCUMENTS_PER_USER: int = 500
    MAX_STORAGE_PER_USER_MB: int = 500

    # Allowed file types for upload
    ALLOWED_MIME_TYPES: set = {
        # Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/rtf",
        "text/plain",
        "text/markdown",
        # Presentations
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.oasis.opendocument.presentation",
        # Spreadsheets
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.spreadsheet",
        "text/csv",
        "text/tab-separated-values",
        # LibreOffice
        "application/vnd.oasis.opendocument.text",
        # Images
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        # Data
        "application/json",
    }

    # Allowed file extensions
    ALLOWED_EXTENSIONS: set = {
        ".pdf", ".doc", ".docx", ".rtf", ".txt", ".md",
        ".ppt", ".pptx", ".odp",
        ".xls", ".xlsx", ".ods", ".csv", ".tsv",
        ".odt",
        ".jpg", ".jpeg", ".png", ".gif", ".webp",
        ".json"
    }

    # Extension to MIME type mapping for download Content-Type header
    EXTENSION_TO_MIME: dict = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "rtf": "application/rtf",
        "txt": "text/plain",
        "md": "text/markdown",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "odp": "application/vnd.oasis.opendocument.presentation",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "csv": "text/csv",
        "tsv": "text/tab-separated-values",
        "odt": "application/vnd.oasis.opendocument.text",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "json": "application/json",
    }

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Read SECRET_KEY from Docker secret if available, fallback to env var
        secret_key_from_file = _read_secret("secret_key")
        if secret_key_from_file:
            self.SECRET_KEY = secret_key_from_file
        elif not self.SECRET_KEY:
            raise ValueError("SECRET_KEY must be provided either via secret file or environment variable")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
