from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.schemas.user import UserCreate, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Retrieve users. Only superuser can access this endpoint."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def read_user_by_id(
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """Get a specific user by id. Only superuser can access this endpoint."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    return user


@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update own user."""
    if user_in.username is not None:
        result = await db.execute(
            select(User).where(
                User.username == user_in.username,
                User.user_id != current_user.user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
        current_user.username = user_in.username
    
    if user_in.email is not None:
        result = await db.execute(
            select(User).where(
                User.email == user_in.email,
                User.user_id != current_user.user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        current_user.email = user_in.email
    
    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)
    
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update a user. Only superuser can access this endpoint."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    
    if user_in.username is not None:
        result = await db.execute(
            select(User).where(
                User.username == user_in.username,
                User.user_id != user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
        user.username = user_in.username
    
    if user_in.email is not None:
        result = await db.execute(
            select(User).where(
                User.email == user_in.email,
                User.user_id != user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        user.email = user_in.email
    
    if user_in.password is not None:
        user.password_hash = get_password_hash(user_in.password)
    
    if user_in.role is not None:
        user.role = user_in.role
    
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=UserSchema)
async def delete_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Delete a user. Only superuser can access this endpoint."""
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    await db.delete(user)
    await db.commit()
    return user