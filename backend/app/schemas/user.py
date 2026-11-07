import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool

    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    telegram: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    about: Optional[str] = None
    notify_by_email: Optional[bool] = None