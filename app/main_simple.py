# Simple version without improved model

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.TextPreprocessor import TextPreprocessor
from pydantic import BaseModel
from datetime import datetime
import joblib
import os
from sqlalchemy.orm import Session
import logging

from db import models
from db.database import SessionLocal, engine

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load original model
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
pipeline = joblib.load(model_path)

# Load embedding model
from sentence_transformers import SentenceTransformer
import json

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text):
    embedding = embedder.encode(text).tolist()
    return json.dumps(embedding)

# Simple prediction function using original pipeline
def predict_sentiment(text):
    try:
        prediction = pipeline.predict([text])
        sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
        
        # Try to get confidence from pipeline
        try:
            prediction_proba = pipeline.predict_proba([text])
            confidence = float(max(prediction_proba[0]))
        except:
            confidence = 0.75  # Default confidence
            
        return sentiment, confidence
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return "not toxic", 0.5

# App
app = FastAPI(
    title="NLP Sentiment Classifier API",
    description="Una API que clasifica texto usando un modelo de NLP",
    version="1.0"
)

# CORS
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class TextInput(BaseModel):
    text: str

# Predict endpoint
@app.post("/predict")
def predict(input_text: TextInput):
    try:
        sentiment, confidence = predict_sentiment(input_text.text)
        return {
            "prediction": sentiment,
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all messages
@app.get("/messages")
def get_messages(db: Session = Depends(get_db)):
    return db.query(models.Message).all()

# Create a message
@app.post("/messages")
def create_message(message: TextInput, db: Session = Depends(get_db)):
    try:
        sentiment, confidence = predict_sentiment(message.text)
        embedding = get_embedding(message.text)

        new_message = models.Message(
            text=message.text,
            sentiment=sentiment,
            confidence=confidence,
            embedding=embedding
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception as e:
        logger.error(f"Error creating message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Update a message
@app.put("/messages/{id}")
def update_message(id: int, message: TextInput, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    try:
        sentiment, confidence = predict_sentiment(message.text)
        
        db_message.text = message.text
        db_message.sentiment = sentiment
        db_message.confidence = confidence
        db_message.embedding = get_embedding(message.text)
        db.commit()
        db.refresh(db_message)
        return db_message
    except Exception as e:
        logger.error(f"Error updating message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Delete a message
@app.delete("/messages/{id}")
def delete_message(id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"detail": "Message deleted"}
