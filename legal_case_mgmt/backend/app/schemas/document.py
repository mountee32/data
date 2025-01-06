from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class DocumentBase(BaseModel):
    case_id: int
    title: str
    document_type: str
    file_path: Optional[str] = None

class DocumentCreate(DocumentBase):
    created_by: int

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    file_path: Optional[str] = None
    document_type: Optional[str] = None

class DocumentInDBBase(DocumentBase):
    document_id: int
    created_at: datetime
    created_by: int

    class Config:
        orm_mode = True

class Document(DocumentInDBBase):
    pass

class DocumentInDB(DocumentInDBBase):
    pass