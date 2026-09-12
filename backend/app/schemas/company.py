import uuid
from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# User CRUD schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    role: str = Field(default="employee", pattern="^(owner|hr|employee)$")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    role: str

    model_config = {"from_attributes": True}


# Company CRUD schemas
class CompanyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    inn: Optional[str] = Field(default=None, max_length=12)
    description: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    inn: Optional[str] = Field(default=None, max_length=12)
    description: Optional[str] = None
    logo_url: Optional[str] = None


class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str
    inn: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    is_active: bool
    owner_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# Department CRUD schemas
class DepartmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    name: str
    description: Optional[str]
    created_at: datetime
    children: list["DepartmentResponse"] = []

    model_config = {"from_attributes": True}


# Employee CRUD schemas
class EmployeeCreate(BaseModel):
    department_id: uuid.UUID
    position: str = Field(min_length=2, max_length=255)
    hire_date: date
    user: UserCreate


class EmployeeResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    department_id: uuid.UUID
    user_id: uuid.UUID
    position: str
    hire_date: date
    is_active: bool
    user: UserResponse

    model_config = {"from_attributes": True}