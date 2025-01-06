from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, case, documents

api_router = APIRouter()

# Include routers for different endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(case.router, prefix="/cases", tags=["cases"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])

# Additional routers will be added here as we implement them:
# api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
# api_router.include_router(events.router, prefix="/events", tags=["events"])
# api_router.include_router(evidence.router, prefix="/evidence", tags=["evidence"])
# api_router.include_router(filings.router, prefix="/filings", tags=["filings"])
# api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
# api_router.include_router(time_entries.router, prefix="/time-entries", tags=["time-entries"])
# api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])