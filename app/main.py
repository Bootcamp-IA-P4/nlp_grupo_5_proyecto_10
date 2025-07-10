# main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.TextPreprocessor import TextPreprocessor
from pydantic import BaseModel
from datetime import datetime
import joblib
import os
from sqlalchemy.orm import Session

from db import models
from db.database import SessionLocal, engine

# Load model
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
pipeline = joblib.load(model_path)

# Load embedding model
from sentence_transformers import SentenceTransformer
import json

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text):
    embedding = embedder.encode(text).tolist()
    return json.dumps(embedding)

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
        prediction = pipeline.predict([input_text.text])
        sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
        return {"prediction": sentiment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all messages
@app.get("/messages")
def get_messages(db: Session = Depends(get_db)):
    return db.query(models.Message).all()

# Create a message
@app.post("/messages")
def create_message(message: TextInput, db: Session = Depends(get_db)):
    prediction = pipeline.predict([message.text])
    sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
    embedding = get_embedding(message.text)

    new_message = models.Message(
        text=message.text,
        sentiment=sentiment,
        embedding=embedding
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

# Update a message
@app.put("/messages/{id}")
def update_message(id: int, message: TextInput, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db_message.text = message.text
    prediction = pipeline.predict([message.text])
    db_message.sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
    db_message.embedding = get_embedding(message.text)
    db.commit()
    db.refresh(db_message)
    return db_message

# Delete a message
@app.delete("/messages/{id}")
def delete_message(id: int, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(db_message)
    db.commit()
    return {"detail": "Message deleted"}
