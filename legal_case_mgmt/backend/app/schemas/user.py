from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing_extensions import Annotated

# Role type
UserRole = Annotated[str, Field(pattern='^(admin|attorney|paralegal|staff)$')]

# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    user_id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# Properties to return to client
class User(UserInDBBase):
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    password_hash: str


# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str


# Token payload
class TokenPayload(BaseModel):
    sub: Optional[int] = None


# Login request schema
class UserLogin(BaseModel):
    username: str
    password: str