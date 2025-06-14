from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WordBase(BaseModel):
    word: str

class WordCreate(WordBase):
    pass

class Word(WordBase):
    id: int
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
