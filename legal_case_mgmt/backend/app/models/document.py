from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.case_id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # Size in bytes
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    description = Column(String, nullable=True)
    document_metadata = Column(JSON, nullable=True)

    # Relationship with Case
    case = relationship("Case", back_populates="documents")
