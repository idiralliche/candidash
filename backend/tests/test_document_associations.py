import pytest
import requests

def test_document_association_polymorphic(api_url, auth_headers):
    # 1. Create Company & Opportunity
    company_id = requests.post(f"{api_url}/companies/", json={"name": "Doc Corp"}, headers=auth_headers).json()['id']
    opp_id = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Doc Job",
        "application_type": "spontaneous",
        "company_id": company_id
    }, headers=auth_headers).json()['id']

    # 2. Create Document
    doc_resp = requests.post(f"{api_url}/documents/", json={
        "name": "CV.pdf",
        "type": "resume",
        "format": "pdf",
        "path": "/path/to/cv.pdf"
    }, headers=auth_headers)
    doc_id = doc_resp.json()['id']

    # 3. Create Association (Document -> Opportunity)
    assoc_resp = requests.post(f"{api_url}/document-associations/", json={
        "document_id": doc_id,
        "entity_type": "opportunity",
        "entity_id": opp_id
    }, headers=auth_headers)

    assert assoc_resp.status_code == 201
    data = assoc_resp.json()
    assert data['entity_type'] == "opportunity"
    assert data['entity_id'] == opp_id

    # 4. Filter by entity (Strict check: need type + id)
    filter_resp = requests.get(
        f"{api_url}/document-associations/?entity_type=opportunity&entity_id={opp_id}",
        headers=auth_headers
    )
    assert filter_resp.status_code == 200
    assert len(filter_resp.json()) == 1

    # 5. Filter error (id without type)
    error_resp = requests.get(
        f"{api_url}/document-associations/?entity_id={opp_id}",
        headers=auth_headers
    )
    assert error_resp.status_code == 400  # Expecting Bad Request
