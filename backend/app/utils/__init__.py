"""
Utility functions and helpers for the application.

This package provides reusable components for:
- Database operations (db helpers)
- Input validation (format and ownership validators)
- Document operations (file upload, storage management)
"""
from .db import get_owned_entity_or_404, JoinSpec
from .validators import (
    # Format Validators
    validate_name,
    validate_and_normalize_phone,
    validate_linkedin_url,

    # Ownership Validators
    validate_owned_entity,
    validate_company_exists_and_owned,
    validate_document_exists_and_owned,
    validate_opportunity_exists_and_owned,
    validate_application_exists_and_owned,
    validate_scheduled_event_exists_and_owned,
    validate_entity_exists_and_owned,

    # Document Validators
    validate_file_size,
    validate_mime_type,
    validate_file_extension,
    check_user_quota,
    validate_external_url,
    validate_path_format,
    validate_format_consistency,
    validate_document_storage_update,
)
from .documents import (
    get_file_extension_or_400,
    get_mime_type_or_400,
    get_document_format_or_400,
    sanitize_filename,
    save_uploaded_file,
    process_uploaded_file,
    delete_local_file_safe,
)


__all__ = [
    # from db
    "get_owned_entity_or_404",
    "JoinSpec",

    # from validators.format_validators
    "validate_name",
    "validate_and_normalize_phone",
    "validate_linkedin_url",

    # from validators.ownership_validators
    "validate_owned_entity",
    "validate_company_exists_and_owned",
    "validate_document_exists_and_owned",
    "validate_opportunity_exists_and_owned",
    "validate_application_exists_and_owned",
    "validate_scheduled_event_exists_and_owned",
    "validate_entity_exists_and_owned",

    # from validators.document_validators
    "validate_file_size",
    "validate_mime_type",
    "validate_file_extension",
    "check_user_quota",
    "validate_external_url",
    "validate_path_format",
    "validate_format_consistency",
    "validate_document_storage_update",

    # from documents
    "get_file_extension_or_400",
    "get_mime_type_or_400",
    "get_document_format_or_400",
    "sanitize_filename",
    "save_uploaded_file",
    "process_uploaded_file",
    "delete_local_file_safe",
]
