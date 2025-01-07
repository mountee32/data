from fastapi import APIRouter
from app.api.v1.endpoints import users, case, documents

api_router = APIRouter()

# Include core routers for PoC
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(case.router, prefix="/cases", tags=["cases"])
api_router.include_router(documents.router, tags=["documents"])
