from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import requests
import json
from typing import List

from . import models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_word_from_api(word: str):
    try:
        response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
        response.raise_for_status()
        return response.json()[0]  # Return the first result
    except requests.RequestException:
        return None

@app.get("/api/lookup", response_model=schemas.Word)
def lookup_word(word: str, db: Session = Depends(get_db)):
    # Check if word exists in database
    db_word = db.query(models.Word).filter(models.Word.word == word.lower()).first()
    
    if db_word:
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
    
    # Save to database
    db_word = models.Word(
        word=word.lower(),
        data=json.dumps(word_data)
    )
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    
    return {
        "id": db_word.id,
        "word": db_word.word,
        "data": json.loads(db_word.data),
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
