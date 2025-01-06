from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case
from app.schemas.case import CaseCreate, CaseUpdate

class CRUDCase:
    async def get(self, db: AsyncSession, case_id: int) -> Optional[Case]:
        result = await db.execute(select(Case).filter(Case.case_id == case_id))
        return result.scalars().first()

    async def get_multi(
        self, 
        db: AsyncSession, 
        *, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Case]:
        result = await db.execute(select(Case).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CaseCreate) -> Case:
        db_obj = Case(
            case_number=obj_in.case_number,
            title=obj_in.title,
            case_type=obj_in.case_type,
            court=obj_in.court,
            jurisdiction=obj_in.jurisdiction,
            filing_date=obj_in.filing_date,
            status=obj_in.status,
            description=obj_in.description,
            practice_area=obj_in.practice_area,
            statute_of_limitations=obj_in.statute_of_limitations,
            opposing_counsel=obj_in.opposing_counsel,
            judge=obj_in.judge,
            assigned_attorney_id=obj_in.assigned_attorney_id,
            client_id=obj_in.client_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: Case, 
        obj_in: CaseUpdate
    ) -> Case:
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, case_id: int) -> Case:
        obj = await self.get(db, case_id)
        if not obj:
            return None
        await db.delete(obj)
        await db.commit()
        return obj

case = CRUDCase()