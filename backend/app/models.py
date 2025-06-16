from sqlalchemy import Column, Integer, String, Text, DateTime, func, Boolean, ForeignKey, Table, JSON
from sqlalchemy.orm import relationship
from .database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Association table for many-to-many relationship between Word and Meaning
word_meaning = Table(
    'word_meaning', Base.metadata,
    Column('word_id', Integer, ForeignKey('words.id')),
    Column('meaning_id', Integer, ForeignKey('meanings.id'))
)

class Phonetic(Base):
    __tablename__ = "phonetics"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=True)
    audio = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    license_name = Column(String, nullable=True)
    license_url = Column(String, nullable=True)
    word_id = Column(Integer, ForeignKey('words.id'))

class Definition(Base):
    __tablename__ = "definitions"
    
    id = Column(Integer, primary_key=True, index=True)
    definition = Column(Text, nullable=False)
    example = Column(Text, nullable=True)
    vietnamese = Column(Text, nullable=True)
    example_vietnamese = Column(Text, nullable=True)
    meaning_id = Column(Integer, ForeignKey('meanings.id'))

class Meaning(Base):
    __tablename__ = "meanings"
    
    id = Column(Integer, primary_key=True, index=True)
    part_of_speech = Column(String, nullable=False)
    definitions = relationship("Definition", backref="meaning")
    synonyms = Column(JSON, default=list)
    antonyms = Column(JSON, default=list)
    words = relationship("Word", secondary=word_meaning, back_populates="meanings")

class Word(Base):
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True, nullable=False)
    source_urls = Column(JSON, default=list)
    vietnamese_word = Column(String, nullable=True)
    license_name = Column(String, nullable=True)
    license_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    phonetics = relationship("Phonetic", backref="word")
    meanings = relationship("Meaning", secondary=word_meaning, back_populates="words")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)
