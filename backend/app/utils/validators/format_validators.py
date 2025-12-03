"""
Validation helper functions for common fields.
"""
import regex as re # Using 'regex' library for full Unicode property support
import phonenumbers
from phonenumbers import NumberParseException, PhoneNumberFormat

# --- Name Validation Constants ---
# Using the full Unicode property \p{L} which includes ALL letters from ANY language
# (Latin, Cyrillic, Greek, etc.) and ALL diacritics (ç, ñ, ö, Ł, Ț, etc.).
# This pattern allows letters, spaces, hyphens, and apostrophes as separators.
NAME_REGEX = re.compile(r"^\p{L}+(?:[ -']\p{L}+)*$", re.UNICODE)

# --- LinkedIn Validation Constants ---
# LinkedIn username pattern: 3-100 chars, alphanumeric and hyphens (not at start/end)
LINKEDIN_USERNAME_PATTERN = r'^[a-zA-Z0-9][a-zA-Z0-9-]{1,98}[a-zA-Z0-9]$'
# Full URL pattern (with or without protocol, with or without www)
LINKEDIN_FULL_URL_PATTERN = r'^(?:https?://)?(?:www\.)?linkedin\.com/(in|company)/([a-zA-Z0-9-]+)/?$'
# Short format: in/username or company/companyname
LINKEDIN_SHORT_FORMAT_PATTERN = r'^(in|company)/([a-zA-Z0-9-]+)$'


def validate_name(name: str, field_name: str = "Name") -> str:
    """
    Validates a name string to ensure it contains only standard alphabetical
    characters, spaces, hyphens, and apostrophes, following common naming conventions.

    This function supports multi-part names and is fully compliant with all
    Latin-based characters used in European and international names.
    NOTE: Requires the 'regex' library to be installed.

    Args:
        name: The name string to validate.
        field_name: The descriptive field name for error messages (e.g., "First name").

    Returns:
        The stripped and validated name string.

    Raises:
        ValueError: If the name is empty or does not conform to the regex pattern.
    """
    if not name or not name.strip():
        raise ValueError(f'{field_name} cannot be empty.')

    # Strip whitespace before validation to ensure a clean start/end.
    name_stripped = name.strip()

    if not NAME_REGEX.match(name_stripped):
        raise ValueError(
            f'{field_name} contains invalid characters. Must contain only letters '
            '(including all accented and Unicode letters), spaces, hyphens, and '
            'apostrophes (when used as separators).'
        )

    return name_stripped


def validate_and_normalize_phone(phone: str, default_region: str = "FR") -> str:
  """
  Validates a phone number and normalizes it to the international E.164 format.

  Uses the 'phonenumbers' library for validation. The E.164 format is '+[Country Code][Number without zeros]'
  (e.g., +33612345678). This function operates locally and does not make network calls.

  Args:
    phone: The phone number string to validate (may include spaces, dashes, etc.).
    default_region: The default region to use if the number is provided in a local format
      (e.g., "FR" for a '06...' number). Defaults to "FR".

  Returns:
    The normalized phone number in E.164 format (str).

  Raises:
    ValueError: If the number is empty, malformed, or judged invalid for the given region.
  """
  if not phone:
    raise ValueError('Phone number cannot be empty.')

  # Trim whitespace from the input string.
  phone_clean = phone.strip()

  try:
    # Parse the number. If it starts with '+' or international access code, default_region is ignored.
    # Otherwise, default_region is used to resolve local formats.
    parsed = phonenumbers.parse(phone_clean, default_region)

    # Strict validation: Check if the number is valid (correct length and pattern) for its region.
    if not phonenumbers.is_valid_number(parsed):
      # If strict validation fails, check if the library could even identify the number type.
      number_type = phonenumbers.number_type(parsed)
      if number_type == phonenumbers.PhoneNumberType.UNKNOWN:
        raise ValueError(
          f'Invalid phone number for the region {default_region}. '
          f'Expected format: E.164 (+33 6...) or local format (06...).'
        )

    # Normalize the number to the universally recognized E.164 format.
    normalized_number = phonenumbers.format_number(
      parsed,
      PhoneNumberFormat.E164
    )

    return normalized_number

  except NumberParseException as e:
    # Handle formatting errors that prevent successful parsing.
    raise ValueError(
      f'Invalid phone number format: {str(e)}. '
      'Please provide a valid phone number.'
    )


def validate_linkedin_url(url: str) -> str:
    """
    Validate LinkedIn profile or company URL and normalize it to the short format.

    Accepts:
    - https://linkedin.com/in/username
    - https://www.linkedin.com/in/username
    - http://linkedin.com/in/username
    - linkedin.com/in/username
    - www.linkedin.com/in/username
    - https://linkedin.com/company/companyname
    - in/username (short format)
    - company/companyname (short format)

    LinkedIn usernames: 3-100 characters, letters, numbers, hyphens only.
    Must not start or end with a hyphen.

    Args:
        url: The LinkedIn URL or short format to validate

    Returns:
        Normalized short format URL (e.g., "in/username" or "company/companyname")

    Raises:
        ValueError: If URL format is invalid

    Examples:
        Valid: https://linkedin.com/in/john-doe, www.linkedin.com/in/john-doe, in/marie-dupont, company/acme-corp
        Invalid: linkedin.com/profile/john, just-a-username
    """
    if not url:
        raise ValueError('LinkedIn URL cannot be empty')

    url_clean = url.strip()

    # Check full URL
    match = re.match(LINKEDIN_FULL_URL_PATTERN, url_clean, re.IGNORECASE)
    if match:
        # Extract the type (in/company) and the username/company segment
        type_segment = match.group(1).lower() # Normalize case for consistency
        username = match.group(2)
        
        # Validate the username/company segment against LinkedIn rules
        if not re.match(LINKEDIN_USERNAME_PATTERN, username):
            raise ValueError(
                'LinkedIn username must be 3-100 characters long and contain only '
                'letters, numbers, and hyphens (not at start or end).'
            )
        
        # Return normalized short format
        return f"{type_segment}/{username}"

    # Check short format
    match = re.match(LINKEDIN_SHORT_FORMAT_PATTERN, url_clean, re.IGNORECASE)
    if match:
        # Extract the type (in/company) and the username/company segment
        type_segment = match.group(1).lower() # Normalize case for consistency
        username = match.group(2)
        
        # Validate the username/company segment against LinkedIn rules
        if not re.match(LINKEDIN_USERNAME_PATTERN, username):
            raise ValueError(
                'LinkedIn username must be 3-100 characters long and contain only '
                'letters, numbers, and hyphens (not at start or end).'
            )
        
        # Return normalized short format (reconstructed to ensure consistent casing of the type segment)
        return f"{type_segment}/{username}"

    raise ValueError(
        'Invalid LinkedIn URL format. Accepted formats: '
        'https://linkedin.com/in/username, linkedin.com/company/name, '
        'in/username, or company/name'
    )
