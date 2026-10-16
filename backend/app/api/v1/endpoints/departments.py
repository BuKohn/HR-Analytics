import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import check_company_ownership
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.department import DepartmentService
from app.models.company import Company

router = APIRouter(prefix="/companies/{company_id}/departments", tags=["Отделы"])

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(company_id: uuid.UUID, dept_in: DepartmentCreate, db: AsyncSession = Depends(get_db),
                            current_company: Company = Depends(check_company_ownership)):
    try:
        new_dept = await DepartmentService.create_department(
            db, company_id, dept_in.name, dept_in.description, dept_in.parent_id)
        return new_dept
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(company_id: uuid.UUID, department_id: uuid.UUID, dept_in: DepartmentUpdate, db: AsyncSession = Depends(get_db),
                            current_company: Company = Depends(check_company_ownership)):
    try:
        update_data = dept_in.model_dump(exclude_unset=True)
        updated_dept = await DepartmentService.update_department(db, department_id, company_id, update_data)
        return updated_dept
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(company_id: uuid.UUID, department_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                            current_company: Company = Depends(check_company_ownership)):
    try:
        await DepartmentService.delete_department(db, department_id, company_id)
        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))