import requests
import pytest

def test_documents_requires_auth(api_url):
    assert requests.get(f"{api_url}/documents/").status_code == 401

def test_create_document(api_url, auth_headers):
    response = requests.post(f"{api_url}/documents/", json={
        "name": "CV.pdf",
        "type": "resume",
        "format": "pdf",
        "path": "/app/documents/cv.pdf"
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json()["name"] == "CV.pdf"

def test_document_isolation(api_url, auth_headers, second_user_headers):
    resp = requests.post(f"{api_url}/documents/", json={
        "name": "Secret.pdf",
        "type": "other",
        "format": "pdf",
        "path": "/docs/secret.pdf"
    }, headers=auth_headers)
    doc_id = resp.json()['id']

    assert requests.get(f"{api_url}/documents/{doc_id}", headers=second_user_headers).status_code == 404
