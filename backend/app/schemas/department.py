import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)