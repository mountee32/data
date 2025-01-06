import pytest
from httpx import AsyncClient
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_login_success(client: AsyncClient, test_user: User):
    """Test successful login"""
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

async def test_login_wrong_password(client: AsyncClient, test_user: User):
    """Test login with wrong password"""
    login_data = {
        "username": "testuser",
        "password": "wrongpass"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

async def test_login_wrong_username(client: AsyncClient):
    """Test login with non-existent username"""
    login_data = {
        "username": "nonexistent",
        "password": "testpass123"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

async def test_register_success(client: AsyncClient):
    """Test successful user registration"""
    user_data = {
        "username": "newuser",
        "email": "new@example.com",
        "password": "newpass123",
        "role": "attorney"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == user_data["username"]
    assert data["email"] == user_data["email"]
    assert data["role"] == user_data["role"]
    assert "password" not in data

async def test_register_duplicate_username(client: AsyncClient, test_user: User):
    """Test registration with existing username"""
    user_data = {
        "username": "testuser",  # Same as test_user
        "email": "another@example.com",
        "password": "newpass123",
        "role": "attorney"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Username already registered" in response.json()["detail"]

async def test_register_duplicate_email(client: AsyncClient, test_user: User):
    """Test registration with existing email"""
    user_data = {
        "username": "newuser",
        "email": "test@example.com",  # Same as test_user
        "password": "newpass123",
        "role": "attorney"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

async def test_register_invalid_role(client: AsyncClient):
    """Test registration with invalid role"""
    user_data = {
        "username": "newuser",
        "email": "new@example.com",
        "password": "newpass123",
        "role": "invalid_role"
    }
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 422  # Validation error

async def test_test_token(client: AsyncClient, test_auth_headers: dict):
    """Test token validation endpoint"""
    response = await client.post(
        "/api/v1/auth/test-token",
        headers=test_auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
    assert data["role"] == "admin"