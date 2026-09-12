import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Boolean, DateTime, Date,
    ForeignKey, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    inn: Mapped[str | None] = mapped_column(String(12), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now()
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    owner = relationship("User", foreign_keys=[owner_id])
    departments = relationship("Department", back_populates="company", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("departments.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    company = relationship("Company", back_populates="departments")
    parent = relationship("Department", remote_side=[id], backref="children")
    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"))
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    position: Mapped[str] = mapped_column(String(255))
    hire_date: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    company = relationship("Company", back_populates="employees")
    department = relationship("Department", back_populates="employees")
    user = relationship("User", back_populates="employee")