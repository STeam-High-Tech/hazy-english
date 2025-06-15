from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import requests
import json
from typing import Optional, Dict, Any, List

from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LibreTranslate API endpoint (using a public instance, but you might want to set up your own)
LIBRETRANSLATE_API = "http://localhost:5500"

def translate_text(text: str, source_lang: str = "en", target_lang: str = "vi") -> str:
    """Translate text using LibreTranslate API"""
    try:
        response = requests.post(
            f"{LIBRETRANSLATE_API}/translate",
            json={
                "q": text,
                "source": source_lang,
                "target": target_lang,
                "format": "text"
            },
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["translatedText"]
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return ""  # Return empty string if translation fails

def add_vietnamese_translations(word_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add Vietnamese translations to the word data"""
    if not word_data:
        return word_data
        
    try:
        # Translate the word itself
        word = word_data.get('word', '')
        if word:
            word_data['vietnamese'] = {
                'word': translate_text(word)
            }
        
        # Translate meanings and examples
        if 'meanings' in word_data:
            for meaning in word_data['meanings']:
                # Translate definition
                if 'definitions' in meaning:
                    for definition in meaning['definitions']:
                        if 'definition' in definition:
                            definition['vietnamese'] = translate_text(definition['definition'])
                        
                        # Translate example if exists
                        if 'example' in definition:
                            definition['example_vietnamese'] = translate_text(definition['example'])
        
        return word_data
    except Exception as e:
        print(f"Error adding Vietnamese translations: {str(e)}")
        return word_data

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_word_from_api(word: str):
    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
        response.raise_for_status()
        word_data = response.json()[0]  # Get the first result
        # Add Vietnamese translations
        word_data = add_vietnamese_translations(word_data)
        return word_data
    except requests.RequestException as e:
        print(f"Error fetching word data: {str(e)}")
        return None

@app.post("/api/lookup", response_model=schemas.Word)
def lookup_word(word: str, db: Session = Depends(get_db)):
    # Convert to lowercase for case-insensitive search
    word_lower = word.lower()
    
    # Check if word exists in database
    db_word = db.query(models.Word).filter(models.Word.word == word_lower).first()
    
    if db_word:
        # Return the word data directly since it already contains translations
        return {
            "id": db_word.id,
            "word": db_word.word,
            "data": json.loads(db_word.data),
            "created_at": db_word.created_at
        }
    
    # If not in database, fetch from dictionary API
    word_data = get_word_from_api(word)
    if not word_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found in dictionary"
        )
    
    # Check if we've reached the word limit
    word_count = db.query(models.Word).count()
    if word_count >= 1000:
        # Delete the oldest word
        oldest_word = db.query(models.Word).order_by(models.Word.created_at).first()
        db.delete(oldest_word)
    
    # Save to database for future lookups
    # Ensure the word data includes translations before saving
    if 'vietnamese' not in word_data:
        word_data = add_vietnamese_translations(word_data)
    
    db_word = models.Word(
        word=word_lower,
        data=json.dumps(word_data)
    )
    db.add(db_word)
    try:
        db.commit()
        db.refresh(db_word)
    except Exception as e:
        db.rollback()
        # If there's an error (e.g., duplicate word), try to fetch the existing word
        db_word = db.query(models.Word).filter(models.Word.word == word_lower).first()
        if not db_word:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save word to database"
            )
    
    return {
        "id": db_word.id,
        "word": db_word.word,
        "data": json.loads(db_word.data) if isinstance(db_word.data, str) else db_word.data,
        "created_at": db_word.created_at
    }

@app.get("/api/words", response_model=List[schemas.Word])
def read_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    words = db.query(models.Word).order_by(models.Word.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": word.id,
            "word": word.word,
            "data": json.loads(word.data),
            "created_at": word.created_at
        }
        for word in words
    ]

@app.delete("/api/words/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_word(word_id: int, db: Session = Depends(get_db)):
    db_word = db.query(models.Word).filter(models.Word.id == word_id).first()
    if db_word is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found"
        )
    db.delete(db_word)
    db.commit()
    return {"ok": True}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    import os
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        workers=1
    )
