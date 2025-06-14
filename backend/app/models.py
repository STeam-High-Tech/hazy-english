from sqlalchemy import Column, Integer, String, Text, DateTime, func
from .database import Base

class Word(Base):
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True)
    data = Column(Text)  # Store the full API response as JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
