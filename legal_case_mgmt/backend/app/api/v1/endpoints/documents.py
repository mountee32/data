from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pathlib import Path
import json

from app.api.deps import get_db
from app.crud.document import (
    get_document,
    get_documents_by_case,
    create_document,
    update_document,
    delete_document
)
from app.schemas.document import Document, DocumentCreate, DocumentUpdate, DocumentUploadResponse
from app.utils.file import save_upload_file, get_file_path, delete_file
from app.crud.case import case

router = APIRouter()

import logging
logger = logging.getLogger(__name__)

@router.post("/cases/{case_id}/documents", response_model=DocumentUploadResponse)
async def upload_document(
    case_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    document_metadata: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a document for a specific case."""
    # Verify case exists
    case_obj = await case.get(db, case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        # Parse document_metadata if provided
        metadata_dict = json.loads(document_metadata) if document_metadata else None

        # Save file and get info
        file_path, file_type, file_size = await save_upload_file(file, case_id)

        # Create document record
        doc_create = DocumentCreate(
            case_id=case_id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            description=description,
            document_metadata=metadata_dict
        )
        
        return await create_document(db, doc_create)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid metadata JSON format")
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cases/{case_id}/documents", response_model=List[Document])
async def list_case_documents(
    case_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all documents for a specific case."""
    # Verify case exists
    case_obj = await case.get(db, case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return await get_documents_by_case(db, case_id=case_id, skip=skip, limit=limit)

@router.get("/documents/{document_id}", response_model=Document)
async def get_document_details(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Get document details by ID."""
    document = await get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Download a document by ID."""
    document = await get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Extract filename from the stored path
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=document.filename,
        media_type=document.file_type
    )

@router.put("/documents/{document_id}", response_model=Document)
async def update_document_details(
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update document metadata."""
    db_document = await update_document(db, document_id=document_id, document=document)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.delete("/documents/{document_id}", response_model=Document)
async def delete_document_record(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Delete a document and its file."""
    document = await get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete the physical file first
    delete_file(document.file_path)
    
    # Then delete the database record
    return await delete_document(db, document_id=document_id)
