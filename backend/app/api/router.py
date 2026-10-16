from fastapi import APIRouter
from app.api.v1.endpoints.registration import router as registration_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.departments import router as department_router
api_router = APIRouter()

api_router.include_router(registration_router)
api_router.include_router(auth_router)
api_router.include_router(department_router)