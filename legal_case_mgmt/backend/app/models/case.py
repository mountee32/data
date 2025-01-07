from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Case(Base):
    __tablename__ = "cases"

    case_id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    case_type = Column(String, nullable=False)
    court = Column(String)
    jurisdiction = Column(String)
    filing_date = Column(Date)
    status = Column(String, nullable=False)
    description = Column(Text)
    practice_area = Column(String)
    statute_of_limitations = Column(Date)
    opposing_counsel = Column(String)
    judge = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Optional IDs for PoC
    assigned_attorney_id = Column(Integer, nullable=True)
    client_id = Column(Integer, nullable=True)

    # Relationship with documents
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
