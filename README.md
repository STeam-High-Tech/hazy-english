# English Vocabulary App

A simple English vocabulary learning application with FastAPI backend and React frontend.

## Features

- Look up English words with definitions, pronunciation, and audio
- Save words to your personal dictionary
- View and manage your saved words
- Listen to word pronunciations

## Setup Instructions

### Development

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. Start the development servers:
   ```bash
   # In one terminal (backend)
   cd backend/app
   uvicorn main:app --reload
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

### Production Deployment (Single Container)

1. Build the Docker image:
   ```bash
   docker build -t english-vocab-app .
   ```

2. Run the container:
   ```bash
   docker run -d -p 80:80 --name vocab-app english-vocab-app
   ```
   
   Or using Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

The application will be available at `http://localhost`

## Usage

1. Enter a word in the search box and press Enter or click "Search"
2. View the word's definition, pronunciation, and listen to the audio
3. The word is automatically saved to your dictionary
4. View all your saved words in the "Saved Words" section
5. Click the X icon to remove a word from your saved words

## API Endpoints

- `GET /api/lookup?word={word}` - Look up a word
- `GET /api/words` - Get all saved words
- `DELETE /api/words/{id}` - Delete a word by ID
- `GET /api/health` - Health check endpoint

## Technologies Used

- **Backend**: FastAPI, SQLite, SQLAlchemy
- **Frontend**: React, TypeScript, Tailwind CSS, Heroicons
- **API**: [Free Dictionary API](https://dictionaryapi.dev/)
