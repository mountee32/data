from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class DocumentBase(BaseModel):
    case_id: int
    filename: str
    file_type: str
    file_size: int
    description: Optional[str] = None
    document_metadata: Optional[Dict[str, Any]] = None

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    description: Optional[str] = None
    document_metadata: Optional[Dict[str, Any]] = None

class DocumentInDBBase(DocumentBase):
    id: int
    file_path: str
    upload_date: datetime

    class Config:
        from_attributes = True

class Document(DocumentInDBBase):
    pass

class DocumentInDB(DocumentInDBBase):
    pass

# Schema for document upload response
class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    upload_date: datetime
    description: Optional[str] = None
    document_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
