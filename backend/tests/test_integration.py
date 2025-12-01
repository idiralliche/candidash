import requests
import json
import time
import sys
import os
from datetime import datetime, timedelta

# Configuration
# Read URL from environment (for Docker), default to localhost (for manual dev testing)
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
        print(f"✅ SUCCESS (ID: {data.get('id')})")
        return data

def wait_for_server(retries=10, delay=2):
    """Wait for API to be reachable."""
    print(f"⏳ Checking server availability at {API_URL}...")
    for i in range(retries):
        try:
            response = requests.get(f"{API_URL}/companies/", headers=HEADERS, timeout=5)
            if response.status_code in [200, 401, 403]:
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

def delete_all(resource):
    """Fetch all items of a resource and delete them."""
    print(f"   🧹 Cleaning {resource}...")
    try:
        response = requests.get(f"{API_URL}/{resource}/", headers=HEADERS)
        if response.status_code == 200:
            items = response.json()
            for item in items:
                del_resp = requests.delete(f"{API_URL}/{resource}/{item['id']}", headers=HEADERS)
                if del_resp.status_code not in [200, 204]:
                    print(f"   ⚠️ Failed to delete {resource} {item['id']}")
    except Exception:
        pass

def cleanup_database():
    """Delete all data in reverse dependency order."""
    print_step(0, f"FULL CLEANUP ON {API_URL}")
    resources_to_clean = [
        "document-associations", "actions", "opportunity-products", "opportunity-contacts",
        "applications", "opportunities", "scheduled-events", "products", "contacts", "documents", "companies"
    ]
    for resource in resources_to_clean:
        delete_all(resource)
    print("   ✨ Database clean!")

def main():
    print(f"🚀 Starting CandiDash E2E Test Scenario on {API_URL}...")
    wait_for_server()
    cleanup_database()

    # --- FULL SCENARIO ---
    # 1. Company
    print_step(1, "Create Company")
    company = check_response(requests.post(f"{API_URL}/companies/", json={
        "name": "TechFlow Systems", "company_type": "Startup", "industry": "Software", "is_intermediary": False
    }, headers=HEADERS))
    company_id = company['id']

    # 2. Product
    print_step(2, "Create Product")
    product = check_response(requests.post(f"{API_URL}/products/", json={
        "name": "FlowManager API", "company_id": company_id,
        "description": "High performance API", "technologies_used": "Python, Rust"
    }, headers=HEADERS))
    product_id = product['id']

    # 3. Contact
    print_step(3, "Create Contact")
    contact = check_response(requests.post(f"{API_URL}/contacts/", json={
        "first_name": "Sarah", "last_name": "Connor", "company_id": company_id, "email": "sarah@techflow.io"
    }, headers=HEADERS))
    contact_id = contact['id']

    # 4. Opportunity
    print_step(4, "Create Opportunity")
    opportunity = check_response(requests.post(f"{API_URL}/opportunities/", json={
        "job_title": "Senior Backend", "application_type": "job_posting", "company_id": company_id,
        "position_type": "Backend", "contract_type": "permanent", "salary_min": 60000
    }, headers=HEADERS))
    opportunity_id = opportunity['id']

    # 5. Opportunity Contact
    print_step(5, "Link Contact -> Opportunity")
    check_response(requests.post(f"{API_URL}/opportunity-contacts/", json={
        "opportunity_id": opportunity_id, "contact_id": contact_id, "is_primary_contact": True
    }, headers=HEADERS))

    # 6. Opportunity Product
    print_step(6, "Link Product -> Opportunity")
    check_response(requests.post(f"{API_URL}/opportunity-products/", json={
        "opportunity_id": opportunity_id, "product_id": product_id
    }, headers=HEADERS))

    # 7. Document
    print_step(7, "Upload CV (Simulation)")
    document = check_response(requests.post(f"{API_URL}/documents/", json={
        "name": "CV.pdf", "type": "resume", "format": "pdf", "path": "/app/documents/cv.pdf"
    }, headers=HEADERS))
    document_id = document['id']

    # 8. Application
    print_step(8, "Create Application")
    application = check_response(requests.post(f"{API_URL}/applications/", json={
        "opportunity_id": opportunity_id, "application_date": datetime.now().date().isoformat(),
        "resume_used_id": document_id, "status": "pending"
    }, headers=HEADERS))
    application_id = application['id']

    # 9. Scheduled Event
    print_step(9, "Schedule Interview")
    event = check_response(requests.post(f"{API_URL}/scheduled-events/", json={
        "title": "Tech Interview", "scheduled_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "status": "confirmed", "event_type": "interview"
    }, headers=HEADERS))
    event_id = event['id']

    # 10. Action
    print_step(10, "Create Action (Log Interview)")
    check_response(requests.post(f"{API_URL}/actions/", json={
        "application_id": application_id, "type": "interview_scheduled",
        "scheduled_event_id": event_id, "notes": "Prepare architecture questions"
    }, headers=HEADERS))

    # 11. Association Polymorphique
    print_step(11, "Create Polymorphic Association")
    check_response(requests.post(f"{API_URL}/document-associations/", json={
        "document_id": document_id, "entity_type": "application", "entity_id": application_id
    }, headers=HEADERS))

    print("\n🎉 SCENARIO COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
