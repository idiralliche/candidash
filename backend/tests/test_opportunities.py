import requests
import pytest

def test_opportunities_requires_auth(api_url):
    assert requests.get(f"{api_url}/opportunities/").status_code == 401

def test_create_opportunity(api_url, auth_headers):
    company_id = requests.post(f"{api_url}/companies/", json={"name": "Opp Corp"}, headers=auth_headers).json()['id']

    response = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "Backend Dev",
        "application_type": "job_posting",
        "company_id": company_id,
        "contract_type": "permanent"
    }, headers=auth_headers)

    assert response.status_code == 201
    assert response.json()["job_title"] == "Backend Dev"

def test_opportunity_isolation(api_url, auth_headers, second_user_headers):
    company_id = requests.post(f"{api_url}/companies/", json={"name": "C1"}, headers=auth_headers).json()['id']
    opp_resp = requests.post(f"{api_url}/opportunities/", json={
        "job_title": "User1 Job",
        "application_type": "spontaneous",
        "company_id": company_id
    }, headers=auth_headers)
    opp_id = opp_resp.json()['id']

    assert requests.get(f"{api_url}/opportunities/{opp_id}", headers=second_user_headers).status_code == 404
