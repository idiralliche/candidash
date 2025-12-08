import pytest
import requests

def test_opportunity_product_flow(api_url, auth_headers):
    """Test full flow: Create Opp, Create Product, Link them."""

    # 1. Create Company
    company_resp = requests.post(f"{api_url}/companies/", json={"name": "Tech Corp"}, headers=auth_headers)
    company_id = company_resp.json()['id']

    # 2. Create Opportunity
    opp_resp = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Dev",
        "application_type": "spontaneous",
        "company_id": company_id
    }, headers=auth_headers)
    opp_id = opp_resp.json()['id']

    # 3. Create Product
    prod_resp = requests.post(f"{api_url}/products/", json={
        "name": "Cloud Platform",
        "company_id": company_id
    }, headers=auth_headers)
    prod_id = prod_resp.json()['id']

    # 4. Create Association
    assoc_resp = requests.post(f"{api_url}/opportunity-products/", json={
        "opportunity_id": opp_id,
        "product_id": prod_id
    }, headers=auth_headers)

    assert assoc_resp.status_code == 201
    data = assoc_resp.json()
    assert data['opportunity_id'] == opp_id
    assert data['product_id'] == prod_id
    assert "created_at" in data

    # 5. List Associations
    list_resp = requests.get(f"{api_url}/opportunity-products/", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    # 6. Delete Association
    assoc_id = data['id']
    del_resp = requests.delete(f"{api_url}/opportunity-products/{assoc_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 7. Verify Deletion
    get_resp = requests.get(f"{api_url}/opportunity-products/{assoc_id}", headers=auth_headers)
    assert get_resp.status_code == 404

def test_opportunity_product_multitenancy(api_url, auth_headers, second_user_headers):
    """Ensure User 2 cannot link User 1's opportunity or product."""

    # User 1 creates data
    company_resp = requests.post(f"{api_url}/companies/", json={"name": "User1 Corp"}, headers=auth_headers)
    company_id = company_resp.json()['id']

    opp_resp = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Dev",
        "application_type": "spontaneous",
        "company_id": company_id
    }, headers=auth_headers)
    opp_id_u1 = opp_resp.json()['id']

    prod_resp = requests.post(f"{api_url}/products/", json={
        "name": "User1 Product",
        "company_id": company_id
    }, headers=auth_headers)
    prod_id_u1 = prod_resp.json()['id']

    # User 2 tries to link User 1's opportunity and product
    # Should fail because Opp and Product do not belong to User 2
    fail_resp = requests.post(f"{api_url}/opportunity-products/", json={
        "opportunity_id": opp_id_u1,
        "product_id": prod_id_u1
    }, headers=second_user_headers)

    assert fail_resp.status_code == 404  # Ownership validation fails (not found for user 2)
