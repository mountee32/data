from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

# For PoC, we only need the database session dependency
# Authentication and role-based access have been removed for simplification
