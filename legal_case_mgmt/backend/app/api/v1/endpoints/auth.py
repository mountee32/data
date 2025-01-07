from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate

router = APIRouter()

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
    
    # Create new user (simplified for PoC)
    user = User(
        username=user_in.username,
        email=user_in.email
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user
