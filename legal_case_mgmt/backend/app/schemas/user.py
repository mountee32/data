from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Properties to receive via API on creation
class UserCreate(UserBase):
    pass

# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class User(UserInDBBase):
    pass
