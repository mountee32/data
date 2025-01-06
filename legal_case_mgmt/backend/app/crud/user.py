from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.core.password import get_password_hash, verify_password

async def get_by_username(db: Session, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_by_email(db: Session, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get(db: Session, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.user_id == user_id))
    return result.scalar_one_or_none()

async def authenticate(db: Session, username: str, password: str) -> Optional[User]:
    user = await get_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def create(db: Session, *, username: str, email: str, password: str, role: str) -> User:
    hashed_password = get_password_hash(password)
    db_user = User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user