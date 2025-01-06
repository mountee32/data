from sqlalchemy import Column, Integer, String, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Attorney(Base):
    __tablename__ = "attorneys"

    attorney_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)
    bar_number = Column(String, unique=True)
    practice_areas = Column(String)
    hourly_rate = Column(Numeric(10, 2))
    status = Column(String, nullable=False)
    created_at = Column(Date, default=datetime.utcnow)
    updated_at = Column(Date, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="attorney")
    cases = relationship("Case", back_populates="assigned_attorney")