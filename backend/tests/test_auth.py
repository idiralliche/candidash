import requests
import pytest

def test_register_new_user(api_url):
    """Test user registration with new email."""
    response = requests.post(f"{api_url}/auth/register", json={
        "email": "newuser@candidash.com",
        "first_name": "New",
        "last_name": "User",
        "password": "NewPass123!",
        "confirm_password": "NewPass123!"
    })

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@candidash.com"
    assert "id" in data
    assert "hashed_password" not in data

def test_register_duplicate_email_fails(api_url):
    """Test that registering with duplicate email fails."""
    user_data = {
        "email": "duplicate@candidash.com",
        "first_name": "Duplicate",
        "last_name": "Test",
        "password": "Pass123!",
        "confirm_password": "Pass123!"
    }
    # First registration
    requests.post(f"{api_url}/auth/register", json=user_data)

    # Second registration
    response = requests.post(f"{api_url}/auth/register", json=user_data)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_login_with_valid_credentials(api_url):
    """Test user login with correct credentials."""
    email = "logintest@candidash.com"
    password = "LoginPass123!"

    # Register first
    requests.post(f"{api_url}/auth/register", json={
        "email": email,
        "first_name": "Login",
        "last_name": "Test",
        "password": password,
        "confirm_password": password
    })

    # Login
    response = requests.post(f"{api_url}/auth/login", data={
        "username": email,
        "password": password
    })

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_with_invalid_credentials(api_url):
    """Test that login fails with wrong password."""
    response = requests.post(f"{api_url}/auth/login", data={
        "username": "test@candidash.com",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401
