import requests
import time
import sys
import os
from datetime import datetime, timedelta


# Configuration
DEFAULT_API_URL = "http://localhost:8000/api/v1"
API_URL = os.getenv("CANDIDASH_API_URL", DEFAULT_API_URL)

HEADERS = {"Content-Type": "application/json"}


def print_step(step, message):
    print(f"\n--- STEP {step}: {message} ---")


def check_response(response, expected_code=201):
    if response.status_code != expected_code:
        print(f"❌ ERROR: Expected {expected_code}, Got {response.status_code}")
        try:
            print(f"Details: {response.json()}")
        except:
            print(f"Details: {response.text}")
        sys.exit(1)
    else:
        # DELETE operations return 204
        if response.status_code == 204:
            print("✅ SUCCESS")
            return None

        data = response.json()
        if 'id' in data:
            print(f"✅ SUCCESS (ID: {data.get('id')})")
        else:
            print("✅ SUCCESS")
        return data


def wait_for_server(retries=10, delay=2):
    """Wait for API to be reachable."""
    print(f"⏳ Checking server availability at {API_URL}...")
    for i in range(retries):
        try:
            # Try unauthenticated endpoint (auth endpoints don't require token)
            response = requests.get(f"{API_URL}/../docs", timeout=5)
            if response.status_code in [200, 404]:  # 404 is OK, means server is up
                print("✅ Server is UP!")
                return True
        except requests.exceptions.ConnectionError:
            pass
        except Exception as e:
            print(f"   ⚠️ Unexpected error: {e}")

        print(f"   💤 Server unavailable, retrying in {delay}s ({i+1}/{retries})...")
        time.sleep(delay)

    print("❌ CRITICAL ERROR: Cannot reach backend.")
    sys.exit(1)


def register_user(email, password, first_name, last_name):
    """Register a new user."""
    response = requests.post(f"{API_URL}/auth/register", json={
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "password": password,
        "confirm_password": password
    }, headers=HEADERS)
    return response


def login_user(email, password):
    """Login and get access token."""
    response = requests.post(f"{API_URL}/auth/login", data={
        "username": email,  # OAuth2 uses 'username' field
        "password": password
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


def get_auth_headers(token):
    """Get headers with authentication token."""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }


def cleanup_database_via_psql():
    """Delete all data using PostgreSQL TRUNCATE (requires docker-compose)."""
    print_step(0, "DATABASE CLEANUP (via psql)")
    try:
        os.system("""
docker compose exec -T db psql -U candidash_user -d candidash_db -c "
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
        print("   ✨ Database cleaned via psql!")
        return True
    except Exception as e:
        print(f"   ⚠️ psql cleanup failed: {e}")
        return False


def test_authentication():
    """Test user registration and login."""
    print_step(1, "TEST AUTHENTICATION")

    # Register user
    print("  → Register user: test@candidash.com")
    register_resp = register_user("test@candidash.com", "SecurePass123!", "Test", "User")
    check_response(register_resp, expected_code=201)

    # Login
    print("  → Login user: test@candidash.com")
    token = login_user("test@candidash.com", "SecurePass123!")
    if not token:
        print("❌ ERROR: Failed to get access token")
        sys.exit(1)

    print(f"✅ Token obtained: {token[:20]}...")
    return token


def test_unauthenticated_access(token):
    """Test that endpoints require authentication."""
    print_step(2, "TEST UNAUTHENTICATED ACCESS")

    print("  → Try to access /companies without token")
    response = requests.get(f"{API_URL}/companies/", headers=HEADERS)
    if response.status_code == 401:
        print("✅ Correctly rejected (401 Unauthorized)")
    else:
        print(f"❌ ERROR: Expected 401, got {response.status_code}")
        sys.exit(1)


def test_full_scenario(token):
    """Execute full CRUD scenario with authentication."""
    print_step(3, "FULL CRUD SCENARIO (authenticated)")

    auth_headers = get_auth_headers(token)

    # 1. Company
    print("  → Create Company")
    company = check_response(requests.post(f"{API_URL}/companies/", json={
        "name": "TechFlow Systems", "company_type": "Startup", "industry": "Software", "is_intermediary": False
    }, headers=auth_headers))
    company_id = company['id']

    # 2. Product
    print("  → Create Product")
    product = check_response(requests.post(f"{API_URL}/products/", json={
        "name": "FlowManager API", "company_id": company_id,
        "description": "High performance API", "technologies_used": "Python, Rust"
    }, headers=auth_headers))
    product_id = product['id']

    # 3. Contact
    print("  → Create Contact")
    contact = check_response(requests.post(f"{API_URL}/contacts/", json={
        "first_name": "Sarah", "last_name": "Connor", "company_id": company_id, "email": "sarah@techflow.io"
    }, headers=auth_headers))
    contact_id = contact['id']

    # 4. Opportunity
    print("  → Create Opportunity")
    opportunity = check_response(requests.post(f"{API_URL}/opportunities/", json={
        "job_title": "Senior Backend Developer",
        "application_type": "job_posting",
        "company_id": company_id,
        "position_type": "Backend",
        "contract_type": "permanent",
        "salary_min": 60000
    }, headers=auth_headers))
    opportunity_id = opportunity['id']

    # 5. Opportunity Contact
    print("  → Link Contact → Opportunity")
    check_response(requests.post(f"{API_URL}/opportunity-contacts/", json={
        "opportunity_id": opportunity_id, "contact_id": contact_id, "is_primary_contact": True
    }, headers=auth_headers))

    # 6. Opportunity Product
    print("  → Link Product → Opportunity")
    check_response(requests.post(f"{API_URL}/opportunity-products/", json={
        "opportunity_id": opportunity_id, "product_id": product_id
    }, headers=auth_headers))

    # 7. Document
    print("  → Create Document (CV)")
    document = check_response(requests.post(f"{API_URL}/documents/", json={
        "name": "CV.pdf", "type": "resume", "format": "pdf", "path": "/app/documents/cv.pdf"
    }, headers=auth_headers))
    document_id = document['id']

    # 8. Application
    print("  → Create Application")
    application = check_response(requests.post(f"{API_URL}/applications/", json={
        "opportunity_id": opportunity_id,
        "application_date": datetime.now().date().isoformat(),
        "resume_used_id": document_id,
        "status": "pending"
    }, headers=auth_headers))
    application_id = application['id']

    # 9. Scheduled Event
    print("  → Create Scheduled Event (Interview)")
    event = check_response(requests.post(f"{API_URL}/scheduled-events/", json={
        "title": "Tech Interview",
        "scheduled_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "status": "confirmed",
        "event_type": "interview"
    }, headers=auth_headers))
    event_id = event['id']

    # 10. Action
    print("  → Create Action (Log Interview)")
    check_response(requests.post(f"{API_URL}/actions/", json={
        "application_id": application_id,
        "type": "interview_scheduled",
        "scheduled_event_id": event_id,
        "notes": "Prepare architecture questions"
    }, headers=auth_headers))

    # 11. Document Association
    print("  → Create Document Association")
    check_response(requests.post(f"{API_URL}/document-associations/", json={
        "document_id": document_id,
        "entity_type": "application",
        "entity_id": application_id
    }, headers=auth_headers))

    return {
        "company_id": company_id,
        "opportunity_id": opportunity_id,
        "document_id": document_id,
        "contact_id": contact_id
    }


def test_composite_endpoint(token):
    """Test the composite endpoint /applications/with-opportunity."""
    print_step(4, "TEST COMPOSITE ENDPOINT")

    auth_headers = get_auth_headers(token)

    # First create a company
    print("  → Create Company for composite test")
    company = check_response(requests.post(f"{API_URL}/companies/", json={
        "name": "InnovateTech", "company_type": "Startup", "industry": "Technology"
    }, headers=auth_headers))
    company_id = company['id']

    # Create document
    print("  → Create Document (Resume)")
    document = check_response(requests.post(f"{API_URL}/documents/", json={
        "name": "Resume_2024.pdf", "type": "resume", "format": "pdf", "path": "/docs/resume.pdf"
    }, headers=auth_headers))
    document_id = document['id']

    # Test composite endpoint
    print("  → Create Application WITH Opportunity (composite)")
    application = check_response(requests.post(f"{API_URL}/applications/with-opportunity", json={
        "opportunity": {
            "job_title": "Full Stack Developer",
            "application_type": "spontaneous",
            "company_id": company_id,
            "position_type": None,  # Optional
            "contract_type": None    # Optional (nullable now)
        },
        "application": {
            "application_date": datetime.now().date().isoformat(),
            "status": "pending",
            "resume_used_id": document_id
        }
    }, headers=auth_headers))

    print(f"✅ Application created with opportunity_id: {application['opportunity_id']}")


def test_multi_tenancy(token1):
    """Test that users cannot access each other's data."""
    print_step(5, "TEST MULTI-TENANCY (data isolation)")

    # Create second user
    print("  → Register second user: user2@candidash.com")
    register_resp = register_user("user2@candidash.com", "AnotherPass456!", "User", "Two")
    check_response(register_resp, expected_code=201)

    print("  → Login second user")
    token2 = login_user("user2@candidash.com", "AnotherPass456!")
    if not token2:
        print("❌ ERROR: Failed to get token for user 2")
        sys.exit(1)

    # User 1 creates a company
    print("  → User 1 creates Company")
    auth_headers_1 = get_auth_headers(token1)
    company1 = check_response(requests.post(f"{API_URL}/companies/", json={
        "name": "User1 Company"
    }, headers=auth_headers_1))
    company1_id = company1['id']

    # User 2 tries to access User 1's company
    print("  → User 2 tries to access User 1's Company")
    auth_headers_2 = get_auth_headers(token2)
    response = requests.get(f"{API_URL}/companies/{company1_id}", headers=auth_headers_2)
    if response.status_code == 404:
        print("✅ Correctly isolated (404 Not Found)")
    else:
        print(f"❌ ERROR: User 2 accessed User 1's data (status {response.status_code})")
        sys.exit(1)

    # User 2 lists companies (should see 0)
    print("  → User 2 lists companies (should be empty)")
    response = requests.get(f"{API_URL}/companies/", headers=auth_headers_2)
    companies = response.json()
    if len(companies) == 0:
        print("✅ User 2 sees 0 companies (correct isolation)")
    else:
        print(f"❌ ERROR: User 2 sees {len(companies)} companies (should be 0)")
        sys.exit(1)


def main():
    print("=" * 60)
    print("🚀 CandiDash E2E Integration Tests")
    print(f"📍 API URL: {API_URL}")
    print("=" * 60)

    # Wait for server
    wait_for_server()

    # Clean database
    cleanup_database_via_psql()

    # Run tests
    token = test_authentication()
    test_unauthenticated_access(token)
    test_full_scenario(token)
    test_composite_endpoint(token)
    test_multi_tenancy(token)

    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
