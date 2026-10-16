import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.company import Department, Employee


class DepartmentService:
    @staticmethod
    async def create_department(db: AsyncSession, company_id: uuid.UUID, name: str,
                                description: str | None, parent_id: uuid.UUID | None):
        if parent_id is not None:
            parent_stmt = select(Department).where(
                Department.id == parent_id,
                Department.company_id == company_id)
            parent_res = await db.execute(parent_stmt)
            if not parent_res.scalar_one_or_none():
                raise ValueError("Родительский отдел не найден или не принадлежит этой компании")

        new_dept = Department(
            company_id=company_id,
            name=name,
            description=description,
            parent_id=parent_id)
        db.add(new_dept)
        await db.commit()
        await db.refresh(new_dept)
        return new_dept

    @staticmethod
    async def update_department(db: AsyncSession, department_id: uuid.UUID, company_id: uuid.UUID, update_data: dict):
        stmt = select(Department).where(
            Department.id == department_id,
            Department.company_id == company_id)
        result = await db.execute(stmt)
        dept = result.scalar_one_or_none()
        if not dept:
            raise ValueError("Отдел не найден")

        for field, value in update_data.items():
            if value is not None:
                setattr(dept, field, value)

        await db.commit()
        await db.refresh(dept)
        return dept

    @staticmethod
    async def delete_department(db: AsyncSession, department_id: uuid.UUID, company_id: uuid.UUID):
        stmt = select(Department).where(
            Department.id == department_id,
            Department.company_id == company_id)
        result = await db.execute(stmt)
        dept = result.scalar_one_or_none()
        if not dept:
            raise ValueError("Отдел не найден")

        emp_stmt = select(Employee).where(
            Employee.department_id == department_id,
            Employee.is_active == True
        )
        emp_res = await db.execute(emp_stmt)
        if emp_res.scalars().first():
            raise ValueError("Невозможно удалить отдел, в котором есть активные сотрудники.")

        await db.delete(dept)
        await db.commit()
        return True