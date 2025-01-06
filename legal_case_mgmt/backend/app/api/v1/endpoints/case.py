from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.case import Case
from app.models.user import User
from app.schemas.case import Case as CaseSchema
from app.schemas.case import CaseCreate, CaseUpdate
from app.crud.case import case as crud_case

router = APIRouter()

@router.get("/", response_model=List[CaseSchema])
async def read_cases(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve cases.
    """
    if current_user.role not in ["admin", "attorney"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    
    cases = await crud_case.get_multi(db, skip=skip, limit=limit)
    return cases

@router.get("/{case_id}", response_model=CaseSchema)
async def read_case(
    case_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get a specific case by id.
    """
    if current_user.role not in ["admin", "attorney"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    
    case = await crud_case.get(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    return case

@router.post("/", response_model=CaseSchema)
async def create_case(
    *,
    db: AsyncSession = Depends(deps.get_db),
    case_in: CaseCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create new case.
    """
    if current_user.role not in ["admin", "attorney"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    
    case = await crud_case.create(db, obj_in=case_in)
    return case

@router.put("/{case_id}", response_model=CaseSchema)
async def update_case(
    *,
    db: AsyncSession = Depends(deps.get_db),
    case_id: int,
    case_in: CaseUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Update a case.
    """
    if current_user.role not in ["admin", "attorney"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    
    case = await crud_case.get(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    case = await crud_case.update(db, db_obj=case, obj_in=case_in)
    return case

@router.delete("/{case_id}", response_model=CaseSchema)
async def delete_case(
    *,
    db: AsyncSession = Depends(deps.get_db),
    case_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Delete a case.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough privileges"
        )
    
    case = await crud_case.get(db, case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    await crud_case.remove(db, case_id=case_id)
    return case