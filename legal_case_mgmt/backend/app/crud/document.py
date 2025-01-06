from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def get_document(db: Session, document_id: int) -> Optional[Document]:
    result = await db.execute(select(Document).where(Document.document_id == document_id))
    return result.scalar_one_or_none()

async def get_documents_by_case(db: Session, case_id: int, skip: int = 0, limit: int = 100) -> List[Document]:
    result = await db.execute(
        select(Document)
        .where(Document.case_id == case_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_document(db: Session, document: DocumentCreate) -> Document:
    try:
        logger.debug(f"Creating document with data: {document}")
        db_document = Document(
            case_id=document.case_id,
            title=document.title,
            file_path=document.file_path,
            document_type=document.document_type,
            created_by=document.created_by,
            created_at=datetime.utcnow()
        )
        logger.debug(f"Created document object: {db_document}")
        db.add(db_document)
        await db.commit()
        await db.refresh(db_document)
        logger.debug("Document successfully created and committed")
        return db_document
    except Exception as e:
        logger.error(f"Error creating document: {str(e)}")
        await db.rollback()
        raise

async def update_document(db: Session, document_id: int, document: DocumentUpdate) -> Optional[Document]:
    db_document = await get_document(db, document_id)
    if db_document:
        if document.title:
            db_document.title = document.title
        if document.file_path:
            db_document.file_path = document.file_path
        if document.document_type:
            db_document.document_type = document.document_type
        await db.commit()
        await db.refresh(db_document)
    return db_document

async def delete_document(db: Session, document_id: int) -> Optional[Document]:
    db_document = await get_document(db, document_id)
    if db_document:
        await db.delete(db_document)
        await db.commit()
    return db_document