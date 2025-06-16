from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from typing_extensions import Annotated
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Request schemas
class WordBase(BaseModel):
    word: str

class WordCreate(WordBase):
    pass

# Response schemas
class PhoneticBase(BaseModel):
    text: Optional[str] = None
    audio: Optional[str] = None
    source_url: Optional[str] = None
    license_name: Optional[str] = None
    license_url: Optional[str] = None

    class Config:
        from_attributes = True

class DefinitionBase(BaseModel):
    definition: str
    example: Optional[str] = None
    vietnamese: Optional[str] = None
    example_vietnamese: Optional[str] = None

    class Config:
        from_attributes = True

class MeaningBase(BaseModel):
    part_of_speech: str
    definitions: List[DefinitionBase] = []
    synonyms: List[str] = []
    antonyms: List[str] = []

    class Config:
        from_attributes = True

class WordResponse(WordBase):
    id: int
    source_urls: List[str] = []
    vietnamese_word: Optional[str] = None
    license_name: Optional[str] = None
    license_url: Optional[str] = None
    created_at: datetime
    phonetics: List[PhoneticBase] = []
    meanings: List[MeaningBase] = []

    class Config:
        from_attributes = True

# For backward compatibility with the old API
class Phonetic(PhoneticBase):
    sourceUrl: Optional[str] = None
    license: Optional[Dict[str, str]] = None

    @classmethod
    def from_orm(cls, obj):
        data = {
            'text': obj.text,
            'audio': obj.audio,
            'sourceUrl': obj.source_url,
            'source_url': obj.source_url,
            'license_name': obj.license_name,
            'license_url': obj.license_url,
            'license': {
                'name': obj.license_name,
                'url': obj.license_url
            } if obj.license_name or obj.license_url else None
        }
        return cls(**{k: v for k, v in data.items() if v is not None})

class Definition(DefinitionBase):
    pass

class Meaning(MeaningBase):
    partOfSpeech: str
    definitions: List[Definition] = []

    @classmethod
    def from_orm(cls, obj):
        data = {
            'part_of_speech': obj.part_of_speech,
            'partOfSpeech': obj.part_of_speech,
            'definitions': [Definition.from_orm(d) for d in obj.definitions],
            'synonyms': obj.synonyms,
            'antonyms': obj.antonyms
        }
        return cls(**data)

class WordData(WordBase):
    phonetics: List[Phonetic] = []
    meanings: List[Meaning] = []
    license: Optional[Dict[str, str]] = None
    sourceUrls: List[str] = []
    vietnamese: Optional[Dict[str, str]] = None

    @classmethod
    def from_orm(cls, word):
        return cls(
            id=word.id,
            word=word.word,
            sourceUrls=word.source_urls,
            vietnamese={"word": word.vietnamese_word} if word.vietnamese_word else None,
            license={
                'name': word.license_name,
                'url': word.license_url
            } if word.license_name or word.license_url else None,
            phonetics=[Phonetic.from_orm(p) for p in word.phonetics],
            meanings=[Meaning.from_orm(m) for m in word.meanings],
            created_at=word.created_at
        )

class Word(WordBase):
    id: int
    data: WordData
    created_at: datetime

    class Config:
        from_attributes = True


# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
