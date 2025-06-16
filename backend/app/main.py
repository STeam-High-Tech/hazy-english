from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload
from jose import JWTError, jwt
import requests
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Union

from . import models, schemas, auth
from .database import SessionLocal, engine
from .auth import (
    get_current_active_user, 
    authenticate_user, 
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

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
LIBRETRANSLATE_API = os.getenv("LIBRETRANSLATE_API", "http://localhost:5500")

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

# Create a superuser if it doesn't exist
def create_superuser():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == "admin").first()
        if not user:
            hashed_password = schemas.get_password_hash("admin123")
            db_user = models.User(
                email="admin@example.com",
                username="admin",
                hashed_password=hashed_password,
                is_superuser=True
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print("Superuser created successfully!")
    finally:
        db.close()

# Call this function when the application starts
create_superuser()

# Authentication endpoints
@app.post("/api/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserInDB)
async def read_users_me(current_user: schemas.UserInDB = Depends(get_current_active_user)):
    return current_user

@app.post("/api/users/change-password", response_model=schemas.UserInDB)
async def change_password(
    request: schemas.ChangePasswordRequest,
    current_user: schemas.UserInDB = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change the current user's password.
    
    - **current_password**: The user's current password
    - **new_password**: The new password (min 8 characters)
    - **confirm_password**: Must match new_password
    """
    # Verify current password
    if not schemas.pwd_context.verify(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Update password
    try:
        # Get a fresh copy of the user from the database
        db_user = db.query(models.User).filter(models.User.id == current_user.id).one()
        
        # Update the password
        db_user.hashed_password = schemas.pwd_context.hash(request.new_password)
        
        # No need to add() since the object is already in the session
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

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

def save_word_to_db(db: Session, word_data: dict, word_lower: str):
    """Helper function to save word data to database using the new schema"""
    # Create word entry
    db_word = models.Word(
        word=word_lower,
        source_urls=word_data.get('sourceUrls', []),
        vietnamese_word=word_data.get('vietnamese', {}).get('word') if isinstance(word_data.get('vietnamese'), dict) else None,
        license_name=word_data.get('license', {}).get('name') if isinstance(word_data.get('license'), dict) else None,
        license_url=word_data.get('license', {}).get('url') if isinstance(word_data.get('license'), dict) else None
    )
    
    db.add(db_word)
    db.flush()  # Flush to get the word ID for relationships

    # Save phonetics
    for phonetic_data in word_data.get('phonetics', []):
        if not phonetic_data:  # Skip empty phonetics
            continue
            
        phonetic = models.Phonetic(
            text=phonetic_data.get('text'),
            audio=phonetic_data.get('audio'),
            source_url=phonetic_data.get('sourceUrl'),
            license_name=phonetic_data.get('license', {}).get('name') if isinstance(phonetic_data.get('license'), dict) else None,
            license_url=phonetic_data.get('license', {}).get('url') if isinstance(phonetic_data.get('license'), dict) else None,
            word_id=db_word.id
        )
        db.add(phonetic)
    
    # Save meanings and definitions
    for meaning_data in word_data.get('meanings', []):
        if not meaning_data:  # Skip empty meanings
            continue
            
        # Create meaning with definitions
        definitions = []
        for def_data in meaning_data.get('definitions', []):
            if not def_data:  # Skip empty definitions
                continue
                
            definition = models.Definition(
                definition=def_data.get('definition', ''),
                example=def_data.get('example'),
                vietnamese=def_data.get('vietnamese'),
                example_vietnamese=def_data.get('example_vietnamese')
            )
            definitions.append(definition)
        
        # Create meaning with its definitions
        meaning = models.Meaning(
            part_of_speech=meaning_data.get('partOfSpeech', ''),
            synonyms=meaning_data.get('synonyms', []),
            antonyms=meaning_data.get('antonyms', []),
            definitions=definitions
        )
        
        # Add meaning to word's meanings
        db_word.meanings.append(meaning)
    
    db.commit()
    db.refresh(db_word)
    return db_word

@app.post("/api/lookup", response_model=schemas.WordResponse)
async def lookup_word(
    word: str, 
    db: Session = Depends(get_db),
    current_user: schemas.UserInDB = Depends(get_current_active_user)
):
    # Convert to lowercase for case-insensitive search
    word_lower = word.lower()
    
    # Check if word exists in database
    db_word = db.query(models.Word).filter(models.Word.word == word_lower).first()
    
    if db_word:
        # Return the word data directly since it already contains translations
        return db_word
    
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
        # Delete the oldest word (this will cascade to related records)
        oldest_word = db.query(models.Word).order_by(models.Word.created_at).first()
        if oldest_word:
            db.delete(oldest_word)
    
    # Ensure the word data includes translations before saving
    if 'vietnamese' not in word_data:
        word_data = add_vietnamese_translations(word_data)
    
    try:
        # Save the word and all related data
        db_word = save_word_to_db(db, word_data, word_lower)
        return db_word
    except Exception as e:
        db.rollback()
        # Try to fetch the word again in case of race condition
        db_word = db.query(models.Word).filter(models.Word.word == word_lower).first()
        if db_word:
            return db_word
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save word to database"
        )

@app.get("/api/words", response_model=list[schemas.WordResponse])
async def get_words(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.UserInDB = Depends(get_current_active_user)
):
    """
    Retrieve a list of saved words with pagination.
    
    - **skip**: Number of items to skip (for pagination)
    - **limit**: Maximum number of items to return (for pagination)
    """
    try:
        # Query words with pagination and order by most recent first
        # Use joined loading to optimize the query and avoid N+1 problem
        words = db.query(models.Word)\
                   .options(
                    joinedload(models.Word.phonetics),
                    joinedload(models.Word.meanings).joinedload(models.Meaning.definitions)
                )\
                .order_by(models.Word.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        
        return words
    except Exception as e:
        logger.error(f"Error fetching words: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving words from the database"
        )

@app.get("/api/words/{word_id}", response_model=schemas.WordResponse)
async def get_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.UserInDB = Depends(get_current_active_user)
):
    """
    Retrieve a single word by its ID.
    
    - **word_id**: The ID of the word to retrieve
    """
    try:
        db_word = db.query(models.Word)\
                   .options(
                       joinedload(models.Word.phonetics),
                       joinedload(models.Word.meanings).joinedload(models.Meaning.definitions)
                   )\
                   .filter(models.Word.id == word_id)\
                   .first()
        
        if not db_word:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Word not found"
            )
            
        return db_word
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching word: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving word from the database"
        )

@app.post("/api/words/", response_model=schemas.WordResponse, status_code=status.HTTP_201_CREATED)
async def create_word(
    word: str = Form(...), 
    db: Session = Depends(get_db),
    current_user: schemas.UserInDB = Depends(get_current_active_user)
):
    """
    Create a new word entry by looking it up from the dictionary API.
    
    - **word**: The word to look up and save
    """
    try:
        # Check if word already exists
        db_word = db.query(models.Word).filter(models.Word.word == word.lower()).first()
        if db_word:
            return db_word
            
        # Fetch word data from the API
        word_data = get_word_from_api(word)
        if not word_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Word not found in dictionary"
            )
            
        # Ensure we have Vietnamese translations
        if 'vietnamese' not in word_data:
            word_data = add_vietnamese_translations(word_data)
            
        # Save the word to the database
        db_word = save_word_to_db(db, word_data, word.lower())
        return db_word
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating word: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create word"
        )

@app.delete("/api/words/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_word(
    word_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.UserInDB = Depends(get_current_active_user)
):
    """
    Delete a word and all its related data (phonetics, meanings, definitions).
    
    - **word_id**: The ID of the word to delete
    """
    try:
        # Get the word with all its relationships
        db_word = db.query(models.Word)\
                   .options(
                       joinedload(models.Word.phonetics),
                       joinedload(models.Word.meanings).joinedload(models.Meaning.definitions)
                   )\
                   .filter(models.Word.id == word_id)\
                   .first()
                   
        if not db_word:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Word not found"
            )
        
        # Delete the word (this will cascade to related records)
        db.delete(db_word)
        db.commit()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting word: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete word"
        )

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
