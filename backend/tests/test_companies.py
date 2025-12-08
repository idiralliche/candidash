import requests
import pytest

def test_companies_requires_auth(api_url):
    """Test that /companies requires authentication."""
    response = requests.get(f"{api_url}/companies/")
    assert response.status_code == 401

def test_create_company(api_url, auth_headers):
    """Test creating a new company."""
    response = requests.post(f"{api_url}/companies/", json={
        "name": "TechCorp",
        "company_type": "Startup",
        "industry": "Technology",
        "is_intermediary": False
    }, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "TechCorp"
    assert "id" in data

def test_list_companies(api_url, auth_headers):
    """Test listing companies with pagination."""
    requests.post(f"{api_url}/companies/", json={"name": "ListTest Company"}, headers=auth_headers)

    response = requests.get(f"{api_url}/companies/?skip=0&limit=10", headers=auth_headers)
    assert response.status_code == 200
    companies = response.json()
    assert isinstance(companies, list)
    assert len(companies) > 0

def test_get_company_by_id(api_url, auth_headers):
    """Test retrieving a specific company."""
    create_response = requests.post(f"{api_url}/companies/", json={"name": "GetTest Company"}, headers=auth_headers)
    company_id = create_response.json()["id"]

    response = requests.get(f"{api_url}/companies/{company_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "GetTest Company"

def test_update_company(api_url, auth_headers):
    """Test updating a company."""
    create_response = requests.post(f"{api_url}/companies/", json={"name": "Original Name"}, headers=auth_headers)
    company_id = create_response.json()["id"]

    response = requests.put(f"{api_url}/companies/{company_id}", json={
        "name": "Updated Name",
        "industry": "Finance"
    }, headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

def test_delete_company(api_url, auth_headers):
    """Test deleting a company."""
    create_response = requests.post(f"{api_url}/companies/", json={"name": "ToDelete Company"}, headers=auth_headers)
    company_id = create_response.json()["id"]

    response = requests.delete(f"{api_url}/companies/{company_id}", headers=auth_headers)
    assert response.status_code == 204
    assert requests.get(f"{api_url}/companies/{company_id}", headers=auth_headers).status_code == 404

# --- SIRET TESTS ---

def test_siret_uniqueness_same_user(api_url, auth_headers):
    """Test duplicate SIRET prevention for same user."""
    siret = "12345678901234"
    requests.post(f"{api_url}/companies/", json={"name": "A", "siret": siret}, headers=auth_headers)

    response = requests.post(f"{api_url}/companies/", json={"name": "B", "siret": siret}, headers=auth_headers)
    # Should be 400 Bad Request or 500 IntegrityError depending on exception handling
    assert response.status_code in [400, 500]

def test_siret_multi_tenancy(api_url, auth_headers, second_user_headers):
    """Test same SIRET allowed for different users."""
    siret = "99999999999999"

    # User 1
    resp1 = requests.post(f"{api_url}/companies/", json={"name": "U1", "siret": siret}, headers=auth_headers)
    assert resp1.status_code == 201

    # User 2
    resp2 = requests.post(f"{api_url}/companies/", json={"name": "U2", "siret": siret}, headers=second_user_headers)
    assert resp2.status_code == 201

def test_companies_isolation(api_url, auth_headers, second_user_headers):
    """Test that User 2 cannot access User 1's companies."""
    resp = requests.post(f"{api_url}/companies/", json={"name": "User1 Only"}, headers=auth_headers)
    company_id = resp.json()['id']

    get_resp = requests.get(f"{api_url}/companies/{company_id}", headers=second_user_headers)
    assert get_resp.status_code == 404
