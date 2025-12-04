"""
E2E Integration tests for CandiDash API.

Tests full CRUD operations across all entities with authentication and multi-tenancy.
"""
import pytest
import requests
import time
import os
from datetime import datetime, timedelta, timezone

DEFAULT_API_URL = "http://localhost:8000/api/v1"
API_URL = os.getenv("CANDIDASH_API_URL", DEFAULT_API_URL)
HEADERS = {"Content-Type": "application/json"}


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(scope="module")
def api_url():
    """API base URL fixture."""
    return API_URL


@pytest.fixture(scope="module", autouse=True)
def wait_for_server():
    """Wait for API to be reachable before running tests."""
    print(f"\n⏳ Checking server availability at {API_URL}...")
    for i in range(10):
        try:
            response = requests.get(f"{API_URL}/../docs", timeout=5)
            if response.status_code in [200, 404]:
                print("✅ Server is UP!")
                return
        except requests.exceptions.ConnectionError:
            pass
        except Exception as e:
            print(f"   ⚠️ Unexpected error: {e}")

        print(f"   💤 Server unavailable, retrying in 2s ({i+1}/10)...")
        time.sleep(2)

    pytest.fail("❌ Cannot reach backend")


@pytest.fixture(scope="module", autouse=True)
def cleanup_database():
    """Clean database before running tests."""
    print("\n🧹 Cleaning database...")
    result = os.system("""
docker compose exec -T db psql -U test_user -d candidash_test_db -c "
TRUNCATE TABLE
    document_associations,
    actions,
    opportunity_products,
    opportunity_contacts,
    applications,
    opportunities,
    scheduled_events,
    products,
    contacts,
    documents,
    companies,
    users
RESTART IDENTITY CASCADE;
" 2>/dev/null
""")
    if result == 0:
        print("   ✨ Database cleaned successfully!")
    else:
        print("   ⚠️ Database cleanup failed (might be running outside docker)")
    yield


@pytest.fixture(scope="module")
def test_user_token(api_url):
    """Register and login a test user, return access token."""
    email = "test@candidash.com"
    password = "SecurePass123!"

    # Register
    response = requests.post(f"{api_url}/auth/register", json={
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "password": password,
        "confirm_password": password
    }, headers=HEADERS)

    # Might already exist (201 or 400)
    assert response.status_code in [201, 400], f"Registration failed: {response.json()}"

    # Login
    response = requests.post(f"{api_url}/auth/login", data={
        "username": email,
        "password": password
    })

    assert response.status_code == 200, f"Login failed: {response.json()}"
    token = response.json()["access_token"]
    print(f"   🔐 Test user authenticated: {email}")
    return token


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_auth_headers(token):
    """Get headers with authentication token."""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }


# ============================================================================
# TEST CLASSES
# ============================================================================

class TestAuthentication:
    """Test user authentication endpoints."""

    def test_register_new_user(self, api_url):
        """Test user registration with new email."""
        response = requests.post(f"{api_url}/auth/register", json={
            "email": "newuser@candidash.com",
            "first_name": "New",
            "last_name": "User",
            "password": "NewPass123!",
            "confirm_password": "NewPass123!"
        }, headers=HEADERS)

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@candidash.com"
        assert data["first_name"] == "New"
        assert data["last_name"] == "User"
        assert "id" in data
        assert data["is_active"] is True
        assert "hashed_password" not in data  # Should never be exposed

    def test_register_duplicate_email_fails(self, api_url):
        """Test that registering with duplicate email fails."""
        email = "duplicate@candidash.com"
        user_data = {
            "email": email,
            "first_name": "Duplicate",
            "last_name": "Test",
            "password": "Pass123!",
            "confirm_password": "Pass123!"
        }

        # First registration
        response1 = requests.post(f"{api_url}/auth/register", json=user_data, headers=HEADERS)
        assert response1.status_code == 201

        # Second registration with same email
        response2 = requests.post(f"{api_url}/auth/register", json=user_data, headers=HEADERS)
        assert response2.status_code == 400
        assert "detail" in response2.json()

    def test_login_with_valid_credentials(self, api_url):
        """Test user login with correct credentials."""
        email = "logintest@candidash.com"
        password = "LoginPass123!"

        # Register first
        requests.post(f"{api_url}/auth/register", json={
            "email": email,
            "first_name": "Login",
            "last_name": "Test",
            "password": password,
            "confirm_password": password
        }, headers=HEADERS)

        # Login
        response = requests.post(f"{api_url}/auth/login", data={
            "username": email,
            "password": password
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20  # JWT should be reasonably long

    def test_login_with_invalid_credentials(self, api_url):
        """Test that login fails with wrong password."""
        response = requests.post(f"{api_url}/auth/login", data={
            "username": "test@candidash.com",
            "password": "WrongPassword999!"
        })

        assert response.status_code == 401
        assert response.json()["detail"] == "Incorrect email or password"


class TestUnauthenticatedAccess:
    """Test that endpoints require authentication."""

    def test_companies_requires_auth(self, api_url):
        """Test that /companies requires authentication."""
        response = requests.get(f"{api_url}/companies/", headers=HEADERS)
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]

    def test_opportunities_requires_auth(self, api_url):
        """Test that /opportunities requires authentication."""
        response = requests.get(f"{api_url}/opportunities/", headers=HEADERS)
        assert response.status_code == 401

    def test_documents_requires_auth(self, api_url):
        """Test that /documents requires authentication."""
        response = requests.get(f"{api_url}/documents/", headers=HEADERS)
        assert response.status_code == 401


class TestCompanyCRUD:
    """Test Company CRUD operations."""

    def test_create_company(self, api_url, test_user_token):
        """Test creating a new company."""
        auth_headers = get_auth_headers(test_user_token)

        response = requests.post(f"{api_url}/companies/", json={
            "name": "TechCorp",
            "company_type": "Startup",
            "industry": "Technology",
            "is_intermediary": False
        }, headers=auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "TechCorp"
        assert data["company_type"] == "Startup"
        assert "id" in data

    def test_list_companies(self, api_url, test_user_token):
        """Test listing companies with pagination."""
        auth_headers = get_auth_headers(test_user_token)

        # Create a company first
        requests.post(f"{api_url}/companies/", json={
            "name": "ListTest Company"
        }, headers=auth_headers)

        # List companies
        response = requests.get(f"{api_url}/companies/?skip=0&limit=10", headers=auth_headers)

        assert response.status_code == 200
        companies = response.json()
        assert isinstance(companies, list)
        assert len(companies) > 0

    def test_get_company_by_id(self, api_url, test_user_token):
        """Test retrieving a specific company."""
        auth_headers = get_auth_headers(test_user_token)

        # Create company
        create_response = requests.post(f"{api_url}/companies/", json={
            "name": "GetTest Company"
        }, headers=auth_headers)
        company_id = create_response.json()["id"]

        # Get company
        response = requests.get(f"{api_url}/companies/{company_id}", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == company_id
        assert data["name"] == "GetTest Company"

    def test_update_company(self, api_url, test_user_token):
        """Test updating a company."""
        auth_headers = get_auth_headers(test_user_token)

        # Create company
        create_response = requests.post(f"{api_url}/companies/", json={
            "name": "Original Name"
        }, headers=auth_headers)
        company_id = create_response.json()["id"]

        # Update company
        response = requests.put(f"{api_url}/companies/{company_id}", json={
            "name": "Updated Name",
            "industry": "Finance"
        }, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["industry"] == "Finance"

    def test_delete_company(self, api_url, test_user_token):
        """Test deleting a company."""
        auth_headers = get_auth_headers(test_user_token)

        # Create company
        create_response = requests.post(f"{api_url}/companies/", json={
            "name": "ToDelete Company"
        }, headers=auth_headers)
        company_id = create_response.json()["id"]

        # Delete company
        response = requests.delete(f"{api_url}/companies/{company_id}", headers=auth_headers)

        assert response.status_code == 204

        # Verify it's gone
        get_response = requests.get(f"{api_url}/companies/{company_id}", headers=auth_headers)
        assert get_response.status_code == 404


class TestFullCRUDScenario:
    """Test full CRUD scenario with all entities linked together."""

    def test_complete_application_flow(self, api_url, test_user_token):
        """Test creating a complete application with all related entities."""
        auth_headers = get_auth_headers(test_user_token)

        # 1. Create Company
        company_response = requests.post(f"{api_url}/companies/", json={
            "name": "TechFlow Systems",
            "company_type": "Startup",
            "industry": "Software",
            "is_intermediary": False
        }, headers=auth_headers)
        assert company_response.status_code == 201
        company_id = company_response.json()['id']

        # 2. Create Product
        product_response = requests.post(f"{api_url}/products/", json={
            "name": "FlowManager API",
            "company_id": company_id,
            "description": "High performance API",
            "technologies_used": "Python, Rust"
        }, headers=auth_headers)
        assert product_response.status_code == 201
        product_id = product_response.json()['id']

        # 3. Create Contact
        contact_response = requests.post(f"{api_url}/contacts/", json={
            "first_name": "Sarah",
            "last_name": "Connor",
            "company_id": company_id,
            "email": "sarah@techflow.io",
            "position": "CTO"
        }, headers=auth_headers)
        assert contact_response.status_code == 201
        contact_id = contact_response.json()['id']

        # 4. Create Opportunity
        opportunity_response = requests.post(f"{api_url}/opportunities/", json={
            "job_title": "Senior Backend Developer",
            "application_type": "job_posting",
            "company_id": company_id,
            "position_type": "Backend",
            "contract_type": "permanent",
            "salary_min": 60000,
            "salary_max": 80000
        }, headers=auth_headers)
        assert opportunity_response.status_code == 201
        opportunity_id = opportunity_response.json()['id']

        # 5. Link Contact to Opportunity
        opp_contact_response = requests.post(f"{api_url}/opportunity-contacts/", json={
            "opportunity_id": opportunity_id,
            "contact_id": contact_id,
            "is_primary_contact": True
        }, headers=auth_headers)
        assert opp_contact_response.status_code == 201

        # 6. Link Product to Opportunity
        opp_product_response = requests.post(f"{api_url}/opportunity-products/", json={
            "opportunity_id": opportunity_id,
            "product_id": product_id
        }, headers=auth_headers)
        assert opp_product_response.status_code == 201

        # 7. Create Document (CV)
        document_response = requests.post(f"{api_url}/documents/", json={
            "name": "CV_2024.pdf",
            "type": "resume",
            "format": "pdf",
            "path": "/app/documents/cv_2024.pdf"
        }, headers=auth_headers)
        assert document_response.status_code == 201
        document_id = document_response.json()['id']

        # 8. Create Application
        application_response = requests.post(f"{api_url}/applications/", json={
            "opportunity_id": opportunity_id,
            "application_date": datetime.now().date().isoformat(),
            "resume_used_id": document_id,
            "status": "pending"
        }, headers=auth_headers)
        assert application_response.status_code == 201
        application_id = application_response.json()['id']

        # 9. Create Scheduled Event (Interview)
        scheduled_dt = datetime.now(timezone.utc) + timedelta(days=3)
        event_response = requests.post(f"{api_url}/scheduled-events/", json={
            "title": "Technical Interview",
            "scheduled_date": scheduled_dt.isoformat(),
            "status": "confirmed",
            "event_type": "interview",
            "communication_method": "video"
        }, headers=auth_headers)
        assert event_response.status_code == 201
        event_id = event_response.json()['id']

        # 10. Create Action (Log Interview)
        action_response = requests.post(f"{api_url}/actions/", json={
            "application_id": application_id,
            "type": "interview_scheduled",
            "scheduled_event_id": event_id,
            "notes": "Prepare architecture questions"
        }, headers=auth_headers)
        assert action_response.status_code == 201

        # 11. Create Document Association
        doc_assoc_response = requests.post(f"{api_url}/document-associations/", json={
            "document_id": document_id,
            "entity_type": "application",
            "entity_id": application_id
        }, headers=auth_headers)
        assert doc_assoc_response.status_code == 201

        # Verify all entities were created
        assert all([
            company_id, product_id, contact_id, opportunity_id,
            document_id, application_id, event_id
        ])


class TestCompositeEndpoint:
    """Test composite endpoint for creating application with opportunity."""

    def test_create_application_with_opportunity(self, api_url, test_user_token):
        """Test the /applications/with-opportunity composite endpoint."""
        auth_headers = get_auth_headers(test_user_token)

        # Create company first
        company_response = requests.post(f"{api_url}/companies/", json={
            "name": "InnovateTech",
            "company_type": "Startup",
            "industry": "Technology"
        }, headers=auth_headers)
        company_id = company_response.json()['id']

        # Create document
        document_response = requests.post(f"{api_url}/documents/", json={
            "name": "Resume_2024.pdf",
            "type": "resume",
            "format": "pdf",
            "path": "/docs/resume.pdf"
        }, headers=auth_headers)
        document_id = document_response.json()['id']

        # Create application WITH opportunity in one call
        response = requests.post(f"{api_url}/applications/with-opportunity", json={
            "opportunity": {
                "job_title": "Full Stack Developer",
                "application_type": "spontaneous",
                "company_id": company_id
            },
            "application": {
                "application_date": datetime.now().date().isoformat(),
                "status": "pending",
                "resume_used_id": document_id
            }
        }, headers=auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert "opportunity_id" in data
        assert "id" in data
        assert data["status"] == "pending"


class TestMultiTenancy:
    """Test data isolation between users (multi-tenancy)."""

    def test_users_cannot_access_each_others_data(self, api_url, test_user_token):
        """Test that User 2 cannot access User 1's companies."""
        # Create second user
        email2 = "user2@candidash.com"
        password2 = "AnotherPass456!"

        register_response = requests.post(f"{api_url}/auth/register", json={
            "email": email2,
            "first_name": "User",
            "last_name": "Two",
            "password": password2,
            "confirm_password": password2
        }, headers=HEADERS)

        # Might already exist
        assert register_response.status_code in [201, 400]

        # Login User 2
        login_response = requests.post(f"{api_url}/auth/login", data={
            "username": email2,
            "password": password2
        })
        assert login_response.status_code == 200
        token2 = login_response.json()["access_token"]

        # User 1 creates a company
        auth_headers_1 = get_auth_headers(test_user_token)
        company_response = requests.post(f"{api_url}/companies/", json={
            "name": "User1 Exclusive Company"
        }, headers=auth_headers_1)
        company1_id = company_response.json()['id']

        # User 2 tries to access User 1's company
        auth_headers_2 = get_auth_headers(token2)
        get_response = requests.get(f"{api_url}/companies/{company1_id}", headers=auth_headers_2)

        assert get_response.status_code == 404, "User 2 should not see User 1's company"
        assert "not found" in get_response.json()["detail"].lower()

    def test_users_see_only_their_own_companies(self, api_url, test_user_token):
        """Test that users only see their own companies in list."""
        # Create third user
        email3 = "user3@candidash.com"
        password3 = "ThirdPass789!"

        requests.post(f"{api_url}/auth/register", json={
            "email": email3,
            "first_name": "User",
            "last_name": "Three",
            "password": password3,
            "confirm_password": password3
        }, headers=HEADERS)

        login_response = requests.post(f"{api_url}/auth/login", data={
            "username": email3,
            "password": password3
        })
        token3 = login_response.json()["access_token"]
        auth_headers_3 = get_auth_headers(token3)

        # User 1 creates 2 companies
        auth_headers_1 = get_auth_headers(test_user_token)
        requests.post(f"{api_url}/companies/", json={"name": "User1 Company A"}, headers=auth_headers_1)
        requests.post(f"{api_url}/companies/", json={"name": "User1 Company B"}, headers=auth_headers_1)

        # User 3 lists companies (should see 0)
        response = requests.get(f"{api_url}/companies/", headers=auth_headers_3)
        companies = response.json()

        assert len(companies) == 0, "User 3 should see no companies (isolation)"
