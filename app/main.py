# main.py

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

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load original model as fallback
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
pipeline = joblib.load(model_path)

# Load embedding model
from sentence_transformers import SentenceTransformer
import json

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text):
    embedding = embedder.encode(text).tolist()
    return json.dumps(embedding)

# Try to load the optimized model first, then fallback
USE_OPTIMIZED_MODEL = False
optimized_model = None

try:
    logger.info("🚀 Attempting to load optimized model (135MB compressed)...")
    from app.optimized_model import get_optimized_model
    optimized_model = get_optimized_model()
    if optimized_model:
        USE_OPTIMIZED_MODEL = True
        logger.info("✅ Using optimized transformer model (INT8 + compressed)")
        logger.info(f"📊 Model info: {optimized_model.get_model_info()}")
    else:
        raise Exception("Optimized model not available")
        
except Exception as e:
    logger.warning(f"Optimized model not available: {e}")
    
    # Try the regular improved model
    try:
        logger.info("📦 Attempting to load regular improved model...")
        import torch
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        
        model_dir = "./tokenizador"
        if os.path.exists(model_dir):
            tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
            model = AutoModelForSequenceClassification.from_pretrained(model_dir, local_files_only=True)
            
            class SimpleImprovedModel:
                def __init__(self, tokenizer, model):
                    self.tokenizer = tokenizer
                    self.model = model
                    self.id2label = model.config.id2label
                
                def predict_single(self, text):
                    inputs = self.tokenizer([text], padding=True, truncation=True, return_tensors="pt", max_length=512)
                    with torch.no_grad():
                        outputs = self.model(**inputs)
                        probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                        pred = torch.argmax(probs, dim=1).item()
                        confidence = probs.max().item()
                    
                    star_label = self.id2label.get(pred, "1 star")
                    if isinstance(star_label, str) and star_label.split()[0].isdigit():
                        star_number = int(star_label.split()[0])
                    else:
                        star_number = int(str(star_label)[0]) if str(star_label)[0].isdigit() else 1
                    
                    sentiment = "toxic" if star_number <= 3 else "not toxic"
                    return sentiment, confidence
            
            optimized_model = SimpleImprovedModel(tokenizer, model)
            USE_OPTIMIZED_MODEL = True
            logger.info("✅ Using regular improved transformer model")
        else:
            raise Exception("Tokenizador directory not found")
            
    except Exception as e2:
        logger.warning(f"Improved model also not available: {e2}")
        USE_OPTIMIZED_MODEL = False

logger.info(f"🎯 Final model selection: {'Optimized/Improved Transformer' if USE_OPTIMIZED_MODEL else 'Original Pipeline'}")

# Define prediction function
def predict_sentiment(text):
    if USE_OPTIMIZED_MODEL and optimized_model:
        try:
            return optimized_model.predict_single(text)
        except Exception as e:
            logger.error(f"Error with optimized model: {e}. Falling back to original.")
    
    # Fallback to original pipeline
    try:
        prediction = pipeline.predict([text])
        sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
        
        try:
            prediction_proba = pipeline.predict_proba([text])
            confidence = float(max(prediction_proba[0]))
        except:
            confidence = 0.75
            
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
