"""
Utility functions and helpers for the application.

This package provides reusable components for:
- Database operations (db helpers)
- Input validation (format and ownership validators)
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
    sanitize_filename,
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
    "sanitize_filename",
]
