import requests
import pytest
from datetime import datetime, timedelta, timezone

def test_complete_application_flow(api_url, auth_headers):
    """Test creating a complete application with all related entities."""

    # 1. Create Company
    company_id = requests.post(f"{api_url}/companies/", json={
        "name": "FullFlow Corp"
    }, headers=auth_headers).json()['id']

    # 2. Create Product
    product_id = requests.post(f"{api_url}/products/", json={
        "name": "Flow API",
        "company_id": company_id
    }, headers=auth_headers).json()['id']

    # 3. Create Contact
    contact_id = requests.post(f"{api_url}/contacts/", json={
        "first_name": "Sarah",
        "last_name": "Connor",
        "company_id": company_id,
        "email": "sarah@fullflow.io"
    }, headers=auth_headers).json()['id']

    # 4. Create Opportunity
    opportunity_id = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Senior Dev",
        "application_type": "job_posting",
        "company_id": company_id
    }, headers=auth_headers).json()['id']

    # 5. Links
    requests.post(f"{api_url}/opportunity-contacts/", json={
        "opportunity_id": opportunity_id, "contact_id": contact_id
    }, headers=auth_headers)

    requests.post(f"{api_url}/opportunity-products/", json={
        "opportunity_id": opportunity_id, "product_id": product_id
    }, headers=auth_headers)

    # 6. Create Document
    document_id = requests.post(f"{api_url}/documents/", json={
        "name": "CV.pdf", "type": "resume", "format": "pdf", "path": "/docs/cv.pdf"
    }, headers=auth_headers).json()['id']

    # 7. Create Application
    application_id = requests.post(f"{api_url}/applications/", json={
        "opportunity_id": opportunity_id,
        "application_date": datetime.now().date().isoformat(),
        "resume_used_id": document_id,
        "status": "pending"
    }, headers=auth_headers).json()['id']

    # 8. Create Scheduled Event
    scheduled_dt = datetime.now(timezone.utc) + timedelta(days=3)
    event_id = requests.post(f"{api_url}/scheduled-events/", json={
        "title": "Interview",
        "scheduled_date": scheduled_dt.isoformat(),
        "status": "confirmed",
        "event_type": "interview"
    }, headers=auth_headers).json()['id']

    # 9. Create Action
    requests.post(f"{api_url}/actions/", json={
        "application_id": application_id,
        "type": "interview_scheduled",
        "scheduled_event_id": event_id
    }, headers=auth_headers)

    # 10. Document Association
    requests.post(f"{api_url}/document-associations/", json={
        "document_id": document_id,
        "entity_type": "application",
        "entity_id": application_id
    }, headers=auth_headers)

    # Verification finale simple
    assert application_id > 0

def test_composite_endpoint(api_url, auth_headers):
    """Test the /applications/with-opportunity composite endpoint."""
    company_id = requests.post(f"{api_url}/companies/", json={"name": "Comp Corp"}, headers=auth_headers).json()['id']
    document_id = requests.post(f"{api_url}/documents/", json={"name": "CV.pdf", "type": "resume", "format": "pdf", "path": "/docs/cv.pdf"}, headers=auth_headers).json()['id']

    response = requests.post(f"{api_url}/applications/with-opportunity", json={
        "opportunity": {
            "job_title": "Full Stack",
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
