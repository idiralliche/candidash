"""
Tests for document file upload, download, and storage migration.
"""
import requests
import pytest
import io

# Dummy PDF file content (minimal valid PDF)
DUMMY_PDF = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF"

# Dummy TXT file
DUMMY_TXT = b"This is a plain text document for testing."


def test_upload_pdf_document(api_url, auth_headers):
    """Test uploading a PDF file."""
    files = {'file': ('test_cv.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    data = {
        'name': 'My CV',
        'type': 'resume',
        'description': 'My professional CV'
    }

    response = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Status: {response.status_code}")
    if response.status_code != 201:
        print(f"Error: {response.text}")

    assert response.status_code == 201
    doc = response.json()
    assert doc["name"] == "My CV"
    assert doc["format"] == "pdf"
    assert doc["is_external"] is False
    assert doc["path"].endswith(".pdf")
    assert "id" in doc


def test_upload_txt_document(api_url, auth_headers):
    """Test uploading a TXT file."""
    files = {'file': ('notes.txt', io.BytesIO(DUMMY_TXT), 'text/plain')}
    data = {
        'name': 'Meeting Notes',
        'type': 'other'
    }

    response = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Status: {response.status_code}")
    if response.status_code != 201:
        print(f"Error: {response.text}")

    assert response.status_code == 201
    doc = response.json()
    assert doc["format"] == "txt"
    assert doc["is_external"] is False


def test_upload_file_too_large(api_url, auth_headers):
    """Test that files exceeding 10 MB are rejected."""
    # Create 11 MB file
    large_file = b"X" * (11 * 1024 * 1024)
    files = {'file': ('large.pdf', io.BytesIO(large_file), 'application/pdf')}
    data = {'name': 'Large File', 'type': 'other'}

    response = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    assert response.status_code == 413  # Payload Too Large


def test_upload_invalid_extension(api_url, auth_headers):
    """Test that .exe files are rejected."""
    files = {'file': ('virus.exe', io.BytesIO(b"FAKE"), 'application/x-msdownload')}
    data = {'name': 'Virus', 'type': 'other'}

    response = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    assert response.status_code == 400  # Bad Request


def test_download_local_document(api_url, auth_headers):
    """Test downloading an uploaded file."""
    # Upload file
    files = {'file': ('download_test.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    data = {'name': 'Download Test', 'type': 'resume'}

    upload_resp = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Upload status: {upload_resp.status_code}")
    if upload_resp.status_code != 201:
        print(f"Upload error: {upload_resp.text}")

    assert upload_resp.status_code == 201
    doc_id = upload_resp.json()["id"]

    # Download file
    download_resp = requests.get(
        f"{api_url}/documents/{doc_id}/download",
        headers=auth_headers
    )

    assert download_resp.status_code == 200
    assert download_resp.headers['Content-Type'] == 'application/pdf'
    assert 'Content-Disposition' in download_resp.headers
    assert len(download_resp.content) > 0


def test_download_external_document_redirect(api_url, auth_headers):
    """Test that downloading external document redirects."""
    # Create external document
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "External CV",
        "type": "resume",
        "format": "external",
        "path": "https://drive.google.com/file/d/redirect123",
        "is_external": True
    }, headers=auth_headers)

    print(f"Create status: {create_resp.status_code}")
    if create_resp.status_code != 201:
        print(f"Create error: {create_resp.text}")

    assert create_resp.status_code == 201
    doc_id = create_resp.json()["id"]

    # Download should redirect
    download_resp = requests.get(
        f"{api_url}/documents/{doc_id}/download",
        headers=auth_headers,
        allow_redirects=False
    )

    assert download_resp.status_code == 307  # Temporary Redirect
    assert download_resp.headers['Location'] == "https://drive.google.com/file/d/redirect123"


def test_migrate_local_to_external(api_url, auth_headers):
    """Test converting local document to external link."""
    # 1. Upload file
    files = {'file': ('migrate.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    data = {'name': 'To Migrate', 'type': 'resume'}

    upload_resp = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Upload status: {upload_resp.status_code}")
    if upload_resp.status_code != 201:
        print(f"Upload error: {upload_resp.text}")

    assert upload_resp.status_code == 201
    doc_id = upload_resp.json()["id"]
    old_path = upload_resp.json()["path"]

    # 2. Convert to external
    update_resp = requests.put(f"{api_url}/documents/{doc_id}", json={
        "is_external": True,
        "path": "https://drive.google.com/file/d/migrated456"
    }, headers=auth_headers)

    assert update_resp.status_code == 200
    doc = update_resp.json()
    assert doc["is_external"] is True
    assert doc["format"] == "external"
    assert doc["path"] == "https://drive.google.com/file/d/migrated456"

    # 3. Verify old file is deleted (download should redirect now)
    download_resp = requests.get(
        f"{api_url}/documents/{doc_id}/download",
        headers=auth_headers,
        allow_redirects=False
    )
    assert download_resp.status_code == 307  # Now redirects


def test_replace_external_with_file(api_url, auth_headers):
    """Test replacing external document with uploaded file."""
    # 1. Create external document
    create_resp = requests.post(f"{api_url}/documents/", json={
        "name": "External Doc",
        "type": "resume",
        "format": "external",
        "path": "https://example.com/old_cv.pdf",
        "is_external": True
    }, headers=auth_headers)

    print(f"Create status: {create_resp.status_code}")
    if create_resp.status_code != 201:
        print(f"Create error: {create_resp.text}")

    assert create_resp.status_code == 201
    doc_id = create_resp.json()["id"]

    # 2. Replace with file
    files = {'file': ('new_cv.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}

    replace_resp = requests.post(
        f"{api_url}/documents/{doc_id}/replace-file",
        files=files,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Replace status: {replace_resp.status_code}")
    if replace_resp.status_code != 200:
        print(f"Replace error: {replace_resp.text}")

    assert replace_resp.status_code == 200
    doc = replace_resp.json()
    assert doc["is_external"] is False
    assert doc["format"] == "pdf"
    assert doc["path"].endswith(".pdf")
    assert doc["name"] == "External Doc"  # Name preserved


def test_replace_file_already_local_fails(api_url, auth_headers):
    """Test that replacing local document with file fails."""
    # Upload file
    files = {'file': ('local.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    data = {'name': 'Local Doc', 'type': 'resume'}

    upload_resp = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Upload status: {upload_resp.status_code}")
    if upload_resp.status_code != 201:
        print(f"Upload error: {upload_resp.text}")

    assert upload_resp.status_code == 201
    doc_id = upload_resp.json()["id"]

    # Try to replace (should fail)
    files2 = {'file': ('new.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    replace_resp = requests.post(
        f"{api_url}/documents/{doc_id}/replace-file",
        files=files2,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    assert replace_resp.status_code == 400
    assert "already stored locally" in replace_resp.text


def test_delete_local_document_removes_file(api_url, auth_headers):
    """Test that deleting local document removes physical file."""
    # Upload file
    files = {'file': ('delete_me.pdf', io.BytesIO(DUMMY_PDF), 'application/pdf')}
    data = {'name': 'Delete Me', 'type': 'other'}

    upload_resp = requests.post(
        f"{api_url}/documents/upload",
        files=files,
        data=data,
        headers={"Authorization": auth_headers["Authorization"]}
    )

    print(f"Upload status: {upload_resp.status_code}")
    if upload_resp.status_code != 201:
        print(f"Upload error: {upload_resp.text}")

    assert upload_resp.status_code == 201
    doc_id = upload_resp.json()["id"]

    # Delete
    delete_resp = requests.delete(f"{api_url}/documents/{doc_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    # Verify file and record are gone
    get_resp = requests.get(f"{api_url}/documents/{doc_id}", headers=auth_headers)
    assert get_resp.status_code == 404
