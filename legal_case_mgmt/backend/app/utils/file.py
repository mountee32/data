import os
import mimetypes
from pathlib import Path
from datetime import datetime
from typing import Tuple
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = Path("uploads")
ALLOWED_MIME_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'image/jpeg': '.jpg',
    'image/png': '.png'
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def validate_file(file: UploadFile) -> Tuple[str, int]:
    """Validate file type and size."""
    content_type = file.content_type
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES.values())}"
        )
    
    # Get file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset file position
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size allowed: {MAX_FILE_SIZE/1024/1024}MB"
        )
    
    return content_type, size

async def save_upload_file(file: UploadFile, case_id: int) -> Tuple[str, str, int]:
    """Save uploaded file and return file path, mime type, and size."""
    content_type, size = validate_file(file)
    
    # Create case directory if it doesn't exist
    case_dir = UPLOAD_DIR / str(case_id)
    case_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    extension = ALLOWED_MIME_TYPES[content_type]
    safe_filename = f"{timestamp}_{case_id}_{file.filename}"
    file_path = case_dir / safe_filename
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return str(file_path), content_type, size

def get_file_path(case_id: int, filename: str) -> Path:
    """Get full path for a file."""
    return UPLOAD_DIR / str(case_id) / filename

def delete_file(file_path: str) -> None:
    """Delete a file from the filesystem."""
    try:
        os.remove(file_path)
    except OSError as e:
        # Log error but don't raise - file might have been manually deleted
        print(f"Error deleting file {file_path}: {e}")
