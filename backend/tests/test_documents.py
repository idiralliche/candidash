import requests
import pytest

def test_documents_requires_auth(api_url):
    """Test that /documents requires authentication."""
    assert requests.get(f"{api_url}/documents/").status_code == 401


def test_create_external_document(api_url, auth_headers):
    """Test creating an external document reference."""
    response = requests.post(f"{api_url}/documents/", json={
        "name": "CV on Google Drive",
        "type": "resume",
        "format": "external",
        "path": "https://drive.google.com/file/d/abc123",
        "is_external": True,
        "description": "My CV stored on Google Drive"
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "CV on Google Drive"
    assert data["format"] == "external"
    assert data["is_external"] is True
    assert data["path"].startswith("https://")


def test_create_external_document_invalid_url(api_url, auth_headers):
    """Test that external document with localhost URL fails."""
    response = requests.post(f"{api_url}/documents/", json={
        "name": "Malicious Doc",
        "type": "other",
        "format": "external",
        "path": "http://localhost:8000/malicious",
        "is_external": True
    }, headers=auth_headers)

    assert response.status_code == 422  # Validation error


def test_create_external_document_without_https(api_url, auth_headers):
    """Test external document validation (must be HTTP/HTTPS)."""
    response = requests.post(f"{api_url}/documents/", json={
        "name": "Test",
        "type": "other",
        "format": "external",
        "path": "file:///etc/passwd",
        "is_external": True
    }, headers=auth_headers)

    assert response.status_code == 422  # Validation blocks file:// protocol


def test_format_consistency_validation(api_url, auth_headers):
    """Test that format must be 'external' when is_external=true."""
    response = requests.post(f"{api_url}/documents/", json={
        "name": "Test",
        "type": "resume",
        "format": "pdf",  # Wrong format for external
        "path": "https://example.com/cv.pdf",
        "is_external": True
    }, headers=auth_headers)

    assert response.status_code == 422
    assert "external" in response.text.lower()


def test_list_documents(api_url, auth_headers):
    """Test listing documents."""
    # Create external document
    requests.post(f"{api_url}/documents/", json={
        "name": "External CV",
        "type": "resume",
        "format": "external",
        "path": "https://drive.google.com/file/d/xyz",
        "is_external": True
    }, headers=auth_headers)

    response = requests.get(f"{api_url}/documents/", headers=auth_headers)
    assert response.status_code == 200
    documents = response.json()
    assert isinstance(documents, list)
    assert len(documents) >= 1


def test_get_document_by_id(api_url, auth_headers):
    """Test retrieving a specific document."""
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "Portfolio",
        "type": "portfolio",
        "format": "external",
        "path": "https://notion.so/myportfolio",
        "is_external": True
    }, headers=auth_headers)
    doc_id = create_resp.json()["id"]

    response = requests.get(f"{api_url}/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Portfolio"


def test_update_external_document_url(api_url, auth_headers):
    """Test updating external document URL (Drive → OneDrive)."""
    # Create external document
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "My Resume",
        "type": "resume",
        "format": "external",
        "path": "https://drive.google.com/file/d/old123",
        "is_external": True
    }, headers=auth_headers)
    doc_id = create_resp.json()["id"]

    # Update URL
    update_resp = requests.put(f"{api_url}/documents/{doc_id}", json={
        "path": "https://onedrive.live.com/file/new456"
    }, headers=auth_headers)

    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["path"] == "https://onedrive.live.com/file/new456"
    assert data["is_external"] is True


def test_update_document_metadata(api_url, auth_headers):
    """Test updating document name and description."""
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "Old Name",
        "type": "resume",
        "format": "external",
        "path": "https://example.com/doc",
        "is_external": True
    }, headers=auth_headers)
    doc_id = create_resp.json()["id"]

    update_resp = requests.put(f"{api_url}/documents/{doc_id}", json={
        "name": "New Name",
        "description": "Updated description"
    }, headers=auth_headers)

    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["name"] == "New Name"
    assert data["description"] == "Updated description"


def test_delete_external_document(api_url, auth_headers):
    """Test deleting an external document."""
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "ToDelete",
        "type": "other",
        "format": "external",
        "path": "https://example.com/deleteme",
        "is_external": True
    }, headers=auth_headers)
    doc_id = create_resp.json()["id"]

    delete_resp = requests.delete(f"{api_url}/documents/{doc_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    # Verify deletion
    get_resp = requests.get(f"{api_url}/documents/{doc_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_document_isolation(api_url, auth_headers, second_user_headers):
    """Test that User 2 cannot access User 1's documents."""
    resp = requests.post(f"{api_url}/documents/", json={
        "name": "Secret.pdf",
        "type": "other",
        "format": "external",
        "path": "https://example.com/secret",
        "is_external": True
    }, headers=auth_headers)
    doc_id = resp.json()['id']

    assert requests.get(f"{api_url}/documents/{doc_id}", headers=second_user_headers).status_code == 404
