import requests
import pytest

def test_create_product(api_url, auth_headers):
    # Need a company first
    company_id = requests.post(f"{api_url}/companies/", json={"name": "Prod Corp"}, headers=auth_headers).json()['id']

    response = requests.post(f"{api_url}/products/", json={
        "name": "FlowManager API",
        "company_id": company_id,
        "description": "High performance API",
        "technologies_used": "Python, Rust"
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json()["name"] == "FlowManager API"

def test_product_isolation(api_url, auth_headers, second_user_headers):
    # User 1 creates company + product
    company_id = requests.post(f"{api_url}/companies/", json={"name": "C1"}, headers=auth_headers).json()['id']
    prod_resp = requests.post(f"{api_url}/products/", json={"name": "P1", "company_id": company_id}, headers=auth_headers)
    prod_id = prod_resp.json()['id']

    # User 2 tries to access
    assert requests.get(f"{api_url}/products/{prod_id}", headers=second_user_headers).status_code == 404

def test_create_product_invalid_company(api_url, auth_headers):
    """Cannot create product for non-existent company."""
    response = requests.post(f"{api_url}/products/", json={
        "name": "Ghost Product",
        "company_id": 99999
    }, headers=auth_headers)
    assert response.status_code == 404

def test_create_product_other_user_company(api_url, auth_headers, second_user_headers):
    """User 2 cannot create product linked to User 1's company."""
    # User 1 creates company
    company_id = requests.post(f"{api_url}/companies/", json={"name": "User1 Corp"}, headers=auth_headers).json()['id']

    # User 2 tries to create product on that company
    response = requests.post(f"{api_url}/products/", json={
        "name": "Intruder Product",
        "company_id": company_id
    }, headers=second_user_headers)

    assert response.status_code == 404  # Validation should prevent this
