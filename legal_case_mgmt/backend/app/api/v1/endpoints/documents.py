from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.crud.document import (
    get_document,
    get_documents_by_case,
    create_document,
    update_document,
    delete_document
)
from app.schemas.document import Document, DocumentCreate, DocumentUpdate
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()

import logging

logger = logging.getLogger(__name__)

@router.get("/{document_id}", response_model=Document)
async def read_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = await get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/case/{case_id}", response_model=List[Document])
async def read_documents_by_case(
    case_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await get_documents_by_case(db, case_id=case_id, skip=skip, limit=limit)

@router.post("/", response_model=Document)
async def create_new_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        return await create_document(db, document=document)
    except Exception as e:
        logger.error(f"Error creating document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{document_id}", response_model=Document)
async def update_existing_document(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_document = await update_document(db, document_id=document_id, document=document)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.delete("/{document_id}", response_model=Document)
async def delete_existing_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_document = await delete_document(db, document_id=document_id)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document