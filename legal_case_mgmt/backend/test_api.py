import asyncio
from sqlalchemy import select
from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.user import User

async def create_test_user():
    async with AsyncSessionLocal() as db:
        # Check if admin user already exists
        result = await db.execute(
            select(User).where(User.username == "admin")
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"Admin user already exists: {existing_user.username}")
            return existing_user
        
        # Create a test admin user with properly hashed password
        password_hash = get_password_hash("admin123")
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password_hash=password_hash,
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        print(f"Created new admin user: {admin_user.username}")
        return admin_user

if __name__ == "__main__":
    # Delete the database file to start fresh
    import os
    if os.path.exists("database/legal_cases.db"):
        os.remove("database/legal_cases.db")
        print("Removed old database")
    
    # Run migrations
    os.system("alembic upgrade head")
    print("Applied database migrations")
    
    # Create test user
    asyncio.run(create_test_user())
    print("Starting FastAPI application...")