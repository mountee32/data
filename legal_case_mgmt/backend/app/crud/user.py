from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User

async def get_by_username(db: Session, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_by_email(db: Session, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get(db: Session, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.user_id == user_id))
    return result.scalar_one_or_none()

async def create(db: Session, *, username: str, email: str) -> User:
    db_user = User(
        username=username,
        email=email
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
