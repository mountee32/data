from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.core.password import verify_password, get_password_hash
from app.core.config import settings
from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, Token, UserCreate

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    # Query user by username
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user.user_id, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=UserSchema)
async def register(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """Register a new user."""
    # Check if user with this username exists
    result = await db.execute(
        select(User).where(User.username == user_in.username)
    )
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered",
        )
    
    # Check if user with this email exists
    result = await db.execute(
        select(User).where(User.email == user_in.email)
    )
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    
    # Create new user
    user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/test-token", response_model=UserSchema)
async def test_token(current_user: User = Depends(deps.get_current_user)) -> Any:
    """Test access token."""
    return current_user