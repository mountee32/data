from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CaseBase(BaseModel):
    case_number: str
    title: str
    case_type: str
    court: Optional[str] = None
    jurisdiction: Optional[str] = None
    filing_date: Optional[datetime] = None
    status: str
    description: Optional[str] = None
    practice_area: Optional[str] = None
    statute_of_limitations: Optional[datetime] = None
    opposing_counsel: Optional[str] = None
    judge: Optional[str] = None
    assigned_attorney_id: Optional[int] = None
    client_id: Optional[int] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    case_number: Optional[str] = None
    title: Optional[str] = None
    case_type: Optional[str] = None
    court: Optional[str] = None
    jurisdiction: Optional[str] = None
    filing_date: Optional[datetime] = None
    status: Optional[str] = None
    description: Optional[str] = None
    practice_area: Optional[str] = None
    statute_of_limitations: Optional[datetime] = None
    opposing_counsel: Optional[str] = None
    judge: Optional[str] = None
    assigned_attorney_id: Optional[int] = None
    client_id: Optional[int] = None

class Case(CaseBase):
    case_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True