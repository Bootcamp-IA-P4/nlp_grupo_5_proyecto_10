# main.py
import os
import json
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db import models
from db.database import SessionLocal
from sentence_transformers import SentenceTransformer

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar modelo y tokenizador locales con ruta absoluta
USE_OPTIMIZED_MODEL = False
tokenizer = None
model = None
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    model_dir = r"C:/Users/admin/Desktop/Proyecto 10/nlp_grupo_5_proyecto_10/tokenizador"
    model_file = os.path.join(model_dir, 'model.safetensors')
    if os.path.exists(model_dir) and os.path.exists(model_file):
        tokenizer = AutoTokenizer.from_pretrained(model_dir)
        model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        USE_OPTIMIZED_MODEL = True
        logger.info("✅ Modelo y tokenizador cargados desde ruta absoluta 'tokenizador/model.safetensors'")
    else:
        raise Exception("No se encontró el modelo o la carpeta tokenizador")
except Exception as e:
    logger.error(f"No se pudo cargar el modelo/tokenizador: {e}")

# Load embedding model


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
    if USE_OPTIMIZED_MODEL and model and tokenizer:
        try:
            inputs = tokenizer([input_text.text], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = torch.argmax(probs, dim=1)
            id2label = model.config.id2label
            try:
                label = [id2label[str(i)] for i in preds.tolist()][0]
            except Exception:
                label = [id2label[i] for i in preds.tolist()][0]
            print(f"Texto: {input_text.text} -> Etiqueta real: {label}")
            try:
                stars = int(label[0])
                sentiment = 'toxic' if stars <= 3 else 'not toxic'
            except Exception:
                sentiment = 'not toxic'
            confidence = probs.max().item()
            return {"prediction": sentiment, "confidence": confidence}
        except Exception as e:
            logger.error(f"Error con el modelo HuggingFace: {e}")
            return {"prediction": "not toxic", "confidence": 0.5}
    else:
        logger.error("No se pudo cargar el modelo/tokenizador HuggingFace")
        return {"prediction": "not toxic", "confidence": 0.5}

# Get all messages
@app.get("/messages")
def get_messages(db: Session = Depends(get_db)):
    return db.query(models.Message).all()

@app.post("/messages")
def create_message(message: TextInput, db: Session = Depends(get_db)):
    if USE_OPTIMIZED_MODEL and model and tokenizer:
        try:
            inputs = tokenizer([message.text], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = torch.argmax(probs, dim=1)
            id2label = model.config.id2label
            try:
                label = [id2label[str(i)] for i in preds.tolist()][0]
            except Exception:
                label = [id2label[i] for i in preds.tolist()][0]
            print(f"Texto: {message.text} -> Etiqueta real: {label}")
            try:
                stars = int(label[0])
                sentiment = 'toxic' if stars <= 3 else 'not toxic'
            except Exception:
                sentiment = 'not toxic'
            confidence = probs.max().item()
        except Exception as e:
            logger.error(f"Error con el modelo HuggingFace: {e}")
            sentiment = "not toxic"
            confidence = 0.5
    else:
        logger.error("No se pudo cargar el modelo/tokenizador HuggingFace")
        sentiment = "not toxic"
        confidence = 0.5
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

@app.put("/messages/{id}")
def update_message(id: int, message: TextInput, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    db_message.text = message.text
    if USE_OPTIMIZED_MODEL and model and tokenizer:
        try:
            inputs = tokenizer([message.text], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = torch.argmax(probs, dim=1)
            id2label = model.config.id2label
            try:
                label = [id2label[str(i)] for i in preds.tolist()][0]
            except Exception:
                label = [id2label[i] for i in preds.tolist()][0]
            print(f"Texto: {message.text} -> Etiqueta real: {label}")
            try:
                stars = int(label[0])
                db_message.sentiment = 'toxic' if stars <= 3 else 'not toxic'
            except Exception:
                db_message.sentiment = 'not toxic'
            db_message.confidence = probs.max().item()
        except Exception as e:
            logger.error(f"Error con el modelo HuggingFace: {e}")
            db_message.sentiment = "not toxic"
            db_message.confidence = 0.5
    else:
        logger.error("No se pudo cargar el modelo/tokenizador HuggingFace")
        db_message.sentiment = "not toxic"
        db_message.confidence = 0.5
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
