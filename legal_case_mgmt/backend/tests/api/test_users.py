import pytest
from httpx import AsyncClient
from app.models.user import User

pytestmark = pytest.mark.asyncio

async def test_read_users_superuser(
    client: AsyncClient, test_superuser: User, test_user: User, test_auth_headers: dict
):
    """Test superuser can read all users"""
    response = await client.get("/api/v1/users/", headers=test_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # Should have at least test_user and test_superuser
    usernames = [user["username"] for user in data]
    assert "admin" in usernames
    assert "testuser" in usernames

async def test_read_users_normal_user(client: AsyncClient, test_user: User):
    """Test normal user cannot read all users"""
    # Login as normal user
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    login_response = await client.post("/api/v1/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Try to access users list
    response = await client.get("/api/v1/users/", headers=headers)
    assert response.status_code == 403  # Changed from 400 to 403 (Forbidden)
    assert "Not enough privileges" in response.json()["detail"]

async def test_read_user_me(client: AsyncClient, test_user: User):
    """Test user can read their own data"""
    # Login as test user
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    login_response = await client.post("/api/v1/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get own user data
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "password_hash" not in data

async def test_read_user_unauthorized(client: AsyncClient):
    """Test unauthorized access is prevented"""
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

async def test_read_user_by_id(
    client: AsyncClient, test_superuser: User, test_user: User, test_auth_headers: dict
):
    """Test superuser can read user by ID"""
    response = await client.get(
        f"/api/v1/users/{test_user.user_id}",
        headers=test_auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

async def test_update_user_me(client: AsyncClient, test_user: User):
    """Test user can update their own data"""
    # Login as test user
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    login_response = await client.post("/api/v1/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update user data
    update_data = {
        "email": "newemail@example.com"
    }
    response = await client.put(
        "/api/v1/users/me",
        headers=headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newemail@example.com"
    assert data["username"] == "testuser"  # Unchanged

async def test_update_user_superuser(
    client: AsyncClient, test_superuser: User, test_user: User, test_auth_headers: dict
):
    """Test superuser can update other users"""
    update_data = {
        "email": "updated@example.com",
        "role": "staff"
    }
    response = await client.put(
        f"/api/v1/users/{test_user.user_id}",
        headers=test_auth_headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "updated@example.com"
    assert data["role"] == "staff"

async def test_delete_user(
    client: AsyncClient, test_superuser: User, test_user: User, test_auth_headers: dict
):
    """Test superuser can delete users"""
    response = await client.delete(
        f"/api/v1/users/{test_user.user_id}",
        headers=test_auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

    # Verify user is deleted
    response = await client.get(
        f"/api/v1/users/{test_user.user_id}",
        headers=test_auth_headers
    )
    assert response.status_code == 404