"""
Global fixtures for pytest.
Handles database cleanup, API URL configuration, and user authentication.
"""
import pytest
import requests
import time
import os
import uuid
import psycopg2
from urllib.parse import urlparse

# Configuration
DEFAULT_API_URL = "http://backend:8000/api/v1"
API_URL = os.getenv("CANDIDASH_API_URL", DEFAULT_API_URL)
HEADERS = {"Content-Type": "application/json"}

# Database connection string
DB_DSN = "postgresql://test_user:test_password@db:5432/candidash_test_db"

@pytest.fixture(scope="session")
def api_url():
    """Returns the API base URL."""
    return API_URL

@pytest.fixture(scope="session", autouse=True)
def wait_for_server():
    """Wait for API to be reachable before running any tests."""
    print(f"\n⏳ Checking server availability at {API_URL}...")
    for i in range(20):
        try:
            response = requests.get(f"{API_URL}/../docs", timeout=5)
            if response.status_code in [200, 404]:
                print("✅ Server is UP!")
                return
        except requests.exceptions.ConnectionError:
            pass
        except Exception as e:
            print(f"   ⚠️ Unexpected error: {e}")

        print(f"   💤 Server unavailable, retrying in 2s ({i+1}/20)...")
        time.sleep(2)

    pytest.fail("❌ Cannot reach backend")

@pytest.fixture(scope="function", autouse=True)
def cleanup_database():
    """
    Clean database tables before EACH test function.
    Connects directly to the DB container from the tester container.
    """
    tables = [
        "document_associations",
        "actions",
        "opportunity_products",
        "opportunity_contacts",
        "applications",
        "opportunities",
        "scheduled_events",
        "products",
        "contacts",
        "documents",
        "companies",
        "users"
    ]

    conn = None
    try:
        conn = psycopg2.connect(DB_DSN)
        conn.autocommit = True
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE;")
    except Exception as e:
        print(f"\n⚠️ Database cleanup failed: {e}")
        # On ne fail pas forcément le test ici, mais c'est risqué
    finally:
        if conn:
            conn.close()

@pytest.fixture(scope="function")
def auth_headers(api_url):
    """
    Register a unique new user and return their authentication headers.
    """
    unique_id = str(uuid.uuid4())[:8]
    email = f"test_{unique_id}@candidash.com"
    password = "SecurePass123!"

    # Register
    requests.post(f"{api_url}/auth/register", json={
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "password": password,
        "confirm_password": password
    }, headers=HEADERS)

    # Login
    response = requests.post(f"{api_url}/auth/login", data={
        "username": email,
        "password": password
    })

    assert response.status_code == 200, f"Login failed for {email}"
    token = response.json()["access_token"]

    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

@pytest.fixture(scope="function")
def second_user_headers(api_url):
    """Create a second distinct user for multi-tenancy testing."""
    unique_id = str(uuid.uuid4())[:8]
    email = f"user2_{unique_id}@candidash.com"
    password = "AnotherPass456!"

    requests.post(f"{api_url}/auth/register", json={
        "email": email,
        "first_name": "User",
        "last_name": "Two",
        "password": password,
        "confirm_password": password
    }, headers=HEADERS)

    response = requests.post(f"{api_url}/auth/login", data={
        "username": email,
        "password": password
    })
    token = response.json()["access_token"]

    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
