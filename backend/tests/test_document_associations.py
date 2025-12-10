"""
Tests for DocumentAssociation polymorphic relationships.
"""
import requests


def test_document_association_polymorphic(api_url, auth_headers):
    """Test document association with external document."""
    # 1. Create Company & Opportunity
    company_id = requests.post(
        f"{api_url}/companies/",
        json={"name": "Doc Corp"},
        headers=auth_headers
    ).json()['id']

    opp_id = requests.post(
        f"{api_url}/opportunities/",
        json={
            "job_title": "Doc Job",
            "application_type": "spontaneous",
            "company_id": company_id
        },
        headers=auth_headers
    ).json()['id']

    # 2. Create External Document
    doc_resp = requests.post(f"{api_url}/documents/", json={
        "name": "CV on Drive",
        "type": "resume",
        "format": "external",
        "path": "https://drive.google.com/file/d/cv123",
        "is_external": True
    }, headers=auth_headers)

    print(f"Document creation status: {doc_resp.status_code}")
    if doc_resp.status_code != 201:
        print(f"Document creation error: {doc_resp.text}")

    assert doc_resp.status_code == 201
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


def test_document_association_validation(api_url, auth_headers):
    """Test that invalid entity types and IDs are rejected."""

    # Create a document
    doc_resp = requests.post(f"{api_url}/documents/", json={
        "name": "Test Doc",
        "type": "other",
        "format": "external",
        "path": "https://example.com/test.pdf",
        "is_external": True
    }, headers=auth_headers)

    print(f"Document creation status: {doc_resp.status_code}")
    if doc_resp.status_code != 201:
        print(f"Document creation error: {doc_resp.text}")

    assert doc_resp.status_code == 201
    document_id = doc_resp.json()['id']

    # Invalid entity_type
    resp = requests.post(f"{api_url}/document-associations/", json={
        "document_id": document_id,
        "entity_type": "invalid_type",
        "entity_id": 999
    }, headers=auth_headers)
    assert resp.status_code == 422  # Validation error

    # Non-existent entity_id (should fail FK constraint)
    resp = requests.post(f"{api_url}/document-associations/", json={
        "document_id": document_id,
        "entity_type": "company",
        "entity_id": 999999
    }, headers=auth_headers)
    assert resp.status_code == 404  # Not Found


def test_document_association_cascade_delete(api_url, auth_headers):
    """Test that deleting an entity cascades to associations."""

    # Create Company
    company_resp = requests.post(f"{api_url}/companies/", json={
        "name": "Delete Corp"
    }, headers=auth_headers)
    assert company_resp.status_code == 201
    company_id = company_resp.json()['id']

    # Create Document
    doc_resp = requests.post(f"{api_url}/documents/", json={
        "name": "Cascade Doc",
        "type": "other",
        "format": "external",
        "path": "https://example.com/cascade.pdf",
        "is_external": True
    }, headers=auth_headers)
    assert doc_resp.status_code == 201
    document_id = doc_resp.json()['id']

    # Create Association
    assoc_resp = requests.post(f"{api_url}/document-associations/", json={
        "document_id": document_id,
        "entity_type": "company",
        "entity_id": company_id
    }, headers=auth_headers)
    assert assoc_resp.status_code == 201
    assoc_id = assoc_resp.json()['id']

    # Delete Company
    delete_resp = requests.delete(f"{api_url}/companies/{company_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    # Verify association is deleted
    get_assoc_resp = requests.get(f"{api_url}/document-associations/{assoc_id}", headers=auth_headers)
    assert get_assoc_resp.status_code == 404


def test_list_documents_by_entity(api_url, auth_headers):
    """Test listing all documents associated with an entity."""

    # Create Company
    company_resp = requests.post(f"{api_url}/companies/", json={
        "name": "Multi-Doc Corp"
    }, headers=auth_headers)
    assert company_resp.status_code == 201
    company_id = company_resp.json()['id']

    # Create 3 documents
    doc_ids = []
    for i in range(3):
        doc_resp = requests.post(f"{api_url}/documents/", json={
            "name": f"Doc {i+1}",
            "type": "other",
            "format": "external",
            "path": f"https://example.com/doc{i+1}.pdf",
            "is_external": True
        }, headers=auth_headers)
        assert doc_resp.status_code == 201
        doc_ids.append(doc_resp.json()['id'])

    # Associate all 3 documents with Company
    for doc_id in doc_ids:
        assoc_resp = requests.post(f"{api_url}/document-associations/", json={
            "document_id": doc_id,
            "entity_type": "company",
            "entity_id": company_id
        }, headers=auth_headers)
        assert assoc_resp.status_code == 201

    # List documents for Company
    list_resp = requests.get(
        f"{api_url}/document-associations/",
        params={"entity_type": "company", "entity_id": company_id},
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    associations = list_resp.json()

    assert len(associations) == 3
    retrieved_doc_ids = {a["document_id"] for a in associations}
    assert retrieved_doc_ids == set(doc_ids)
