import pytest
import requests

def test_opportunity_contact_flow(api_url, auth_headers):
    # 1. Create Company
    company_resp = requests.post(f"{api_url}/companies/", json={"name": "HR Corp"}, headers=auth_headers)
    company_id = company_resp.json()['id']

    # 2. Create Opportunity
    opp_resp = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Manager",
        "application_type": "job_posting",
        "company_id": company_id
    }, headers=auth_headers)
    opp_id = opp_resp.json()['id']

    # 3. Create Contact
    contact_resp = requests.post(f"{api_url}/contacts/", json={
        "first_name": "John",
        "last_name": "Doe",
        "company_id": company_id
    }, headers=auth_headers)
    contact_id = contact_resp.json()['id']

    # 4. Create Association (with metadata)
    assoc_resp = requests.post(f"{api_url}/opportunity-contacts/", json={
        "opportunity_id": opp_id,
        "contact_id": contact_id,
        "is_primary_contact": True,
        "contact_role": "Recruiter"
    }, headers=auth_headers)

    assert assoc_resp.status_code == 201
    data = assoc_resp.json()
    assert data['is_primary_contact'] is True
    assert data['contact_role'] == "Recruiter"

    # 5. Update Metadata (PUT)
    assoc_id = data['id']
    update_resp = requests.put(f"{api_url}/opportunity-contacts/{assoc_id}", json={
        "contact_role": "Senior Recruiter",
        "notes": "Very friendly"
    }, headers=auth_headers)

    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data['contact_role'] == "Senior Recruiter"
    assert updated_data['notes'] == "Very friendly"
    # FK check: ensure IDs haven't changed even if sent (should be ignored or validated)
    assert updated_data['opportunity_id'] == opp_id

    # 6. Delete
    requests.delete(f"{api_url}/opportunity-contacts/{assoc_id}", headers=auth_headers)
    assert requests.get(f"{api_url}/opportunity-contacts/{assoc_id}", headers=auth_headers).status_code == 404
