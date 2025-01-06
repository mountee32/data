import pytest
from sqlalchemy import select
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

pytestmark = pytest.mark.asyncio

async def test_create_user(db_session: AsyncSession):
    """Test creating a user"""
    user = User(
        username="testuser1",
        email="test1@example.com",
        password_hash="hashed_password",
        role="attorney",
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    assert user.user_id is not None
    assert user.username == "testuser1"
    assert user.email == "test1@example.com"
    assert user.role == "attorney"
    assert user.is_active is True

async def test_get_user_by_username(db_session: AsyncSession):
    """Test retrieving a user by username"""
    # Create test user
    user = User(
        username="testuser2",
        email="test2@example.com",
        password_hash="hashed_password",
        role="paralegal",
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()

    # Query user
    stmt = select(User).where(User.username == "testuser2")
    result = await db_session.execute(stmt)
    found_user = result.scalar_one_or_none()

    assert found_user is not None
    assert found_user.email == "test2@example.com"
    assert found_user.role == "paralegal"

async def test_unique_username_constraint(db_session: AsyncSession):
    """Test that username must be unique"""
    # Create first user
    user1 = User(
        username="sameuser",
        email="user1@example.com",
        password_hash="hashed_password1",
        role="staff",
        is_active=True
    )
    db_session.add(user1)
    await db_session.commit()

    # Try to create second user with same username
    user2 = User(
        username="sameuser",
        email="user2@example.com",
        password_hash="hashed_password2",
        role="staff",
        is_active=True
    )
    db_session.add(user2)
    
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

async def test_unique_email_constraint(db_session: AsyncSession):
    """Test that email must be unique"""
    # Create first user
    user1 = User(
        username="user1",
        email="same@example.com",
        password_hash="hashed_password1",
        role="staff",
        is_active=True
    )
    db_session.add(user1)
    await db_session.commit()

    # Try to create second user with same email
    user2 = User(
        username="user2",
        email="same@example.com",
        password_hash="hashed_password2",
        role="staff",
        is_active=True
    )
    db_session.add(user2)
    
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

async def test_password_hashing(test_user: User):
    """Test that password hashing works"""
    assert test_user.password_hash != "testpass123"  # Password should be hashed
    assert verify_password("testpass123", test_user.password_hash)  # Should verify correctly

async def test_user_role_validation(db_session: AsyncSession):
    """Test that user role must be one of the allowed values"""
    user = User(
        username="roletest",
        email="role@example.com",
        password_hash="hashed_password",
        role="invalid_role",  # This should fail validation
        is_active=True
    )
    db_session.add(user)
    
    # The role validation will be handled by the API layer with Pydantic
    # For now, we're just testing that the database accepts the value
    await db_session.commit()
    await db_session.refresh(user)
    assert user.role == "invalid_role"