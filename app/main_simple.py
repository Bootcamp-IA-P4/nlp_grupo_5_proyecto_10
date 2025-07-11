# main_simple.py - Version without heavy dependencies

import os
import json
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session

from db import models
from db.database import SessionLocal, engine

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple embedding function
def get_embedding(text):
    import hashlib
    hash_obj = hashlib.md5(text.encode())
    embedding = [ord(c) for c in hash_obj.hexdigest()[:10]]
    return json.dumps(embedding)

def predict_sentiment(text):
    """Simple word-based prediction"""
    toxic_words = ["hate", "stupid", "idiot", "kill", "die", "worst", "fuck", "shit", "damn", "toxic", "bad"]
    positive_words = ["good", "nice", "great", "awesome", "love", "wonderful", "excellent"]
    
    text_lower = text.lower()
    toxic_count = sum(1 for word in toxic_words if word in text_lower)
    positive_count = sum(1 for word in positive_words if word in text_lower)
    
    if toxic_count > positive_count:
        sentiment = "toxic"
        confidence = min(0.6 + (toxic_count * 0.1), 0.9)
    else:
        sentiment = "not toxic"
        confidence = min(0.6 + (positive_count * 0.05), 0.8)
    
    logger.info(f"Simple prediction: {sentiment} ({confidence:.3f})")
    return sentiment, confidence

# App
app = FastAPI(
    title="NLP Sentiment Classifier API",
    description="Una API que clasifica texto usando un modelo de NLP",
    version="1.0"
)

# CORS - Updated to allow both possible frontend ports
origins = [
    "http://localhost:5173",
    "http://localhost:5174", 
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
]
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

class YouTubeRequest(BaseModel):
    url: str
    max_comments: int = 50

class YouTubeAnalysisRequest(BaseModel):
    url: str
    max_comments: int = 50
    save_to_database: bool = True

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

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running - Simple Version"}

# YouTube Comments endpoint (simple version)
@app.post("/youtube-comments")
def get_youtube_comments(request: YouTubeRequest):
    """Extract comments from a YouTube video URL"""
    try:
        video_url = request.url
        max_comments = request.max_comments
        
        logger.info(f"YouTube request received - URL: {video_url}, Max comments: {max_comments}")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        try:
            import sys
            current_dir = os.path.dirname(__file__)
            backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
            if backend_services_path not in sys.path:
                sys.path.insert(0, backend_services_path)
            
            from youtube_service import obtener_comentarios_video
            resultado = obtener_comentarios_video(video_url, max_comments)
            
            if isinstance(resultado, dict) and "error" in resultado:
                raise HTTPException(status_code=400, detail=resultado["error"])
            
            return resultado
            
        except ImportError as e:
            logger.error(f"Import error: {e}")
            return {
                "success": False,
                "error": f"YouTube service not available: {str(e)}"
            }
        except Exception as e:
            logger.error(f"YouTube service error: {e}")
            return {
                "success": False,
                "error": f"YouTube API error: {str(e)}"
            }
            
    except Exception as e:
        logger.error(f"General YouTube error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# YouTube analysis endpoint (simple version)
@app.post("/youtube-analyze")
def analyze_youtube_comments(request: YouTubeAnalysisRequest, db: Session = Depends(get_db)):
    """Extract, analyze, and save YouTube comments to database"""
    try:
        video_url = request.url
        max_comments = request.max_comments
        save_to_db = request.save_to_database
        
        logger.info(f"YouTube analysis request - URL: {video_url}, Max: {max_comments}, Save: {save_to_db}")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        try:
            import sys
            current_dir = os.path.dirname(__file__)
            backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
            if backend_services_path not in sys.path:
                sys.path.insert(0, backend_services_path)
            
            from youtube_service import obtener_comentarios_video
            resultado = obtener_comentarios_video(video_url, max_comments)
            
            if isinstance(resultado, dict) and "error" in resultado:
                raise HTTPException(status_code=400, detail=resultado["error"])
            
            analyzed_comments = []
            saved_messages = []
            
            if save_to_db and resultado.get("success") and resultado.get("comentarios"):
                for comment in resultado["comentarios"]:
                    try:
                        sentiment, confidence = predict_sentiment(comment["texto"])
                        embedding = get_embedding(comment["texto"])
                        
                        video_id = video_url.split("v=")[-1].split("&")[0] if "v=" in video_url else video_url.split("/")[-1]
                        
                        analyzed_comment = {
                            "original": comment,
                            "sentiment": sentiment,
                            "confidence": confidence,
                            "youtube_metadata": {
                                "video_url": video_url,
                                "video_title": resultado["video_info"]["titulo"],
                                "channel": resultado["video_info"]["canal"],
                                "author": comment["autor"],
                                "likes": comment["likes"],
                                "date": comment["fecha"]
                            }
                        }
                        analyzed_comments.append(analyzed_comment)
                        
                        new_message = models.Message(
                            text=comment["texto"],
                            sentiment=sentiment,
                            confidence=confidence,
                            embedding=embedding,
                            source="youtube",
                            youtube_video_id=video_id,
                            youtube_author=comment["autor"],
                            youtube_likes=comment["likes"],
                            youtube_video_title=resultado["video_info"]["titulo"],
                            youtube_channel=resultado["video_info"]["canal"]
                        )
                        db.add(new_message)
                        saved_messages.append(new_message)
                        
                    except Exception as e:
                        logger.error(f"Error analyzing comment: {e}")
                        continue
                
                db.commit()
                
                for msg in saved_messages:
                    db.refresh(msg)
            
            return {
                "success": True,
                "video_info": resultado.get("video_info", {}),
                "total_comments": len(resultado.get("comentarios", [])),
                "analyzed_comments": len(analyzed_comments),
                "saved_to_database": len(saved_messages),
                "analysis_summary": {
                    "toxic_count": sum(1 for c in analyzed_comments if c["sentiment"] == "toxic"),
                    "not_toxic_count": sum(1 for c in analyzed_comments if c["sentiment"] == "not toxic"),
                    "avg_confidence": sum(c["confidence"] for c in analyzed_comments) / len(analyzed_comments) if analyzed_comments else 0
                },
                "comments": analyzed_comments[:5]
            }
            
        except ImportError as e:
            logger.error(f"Import error: {e}")
            return {
                "success": False,
                "error": f"YouTube service not available: {str(e)}"
            }
        except Exception as e:
            logger.error(f"YouTube service error: {e}")
            return {
                "success": False,
                "error": f"YouTube API error: {str(e)}"
            }
            
    except Exception as e:
        logger.error(f"General YouTube error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Statistics endpoints
@app.get("/messages/stats")
def get_message_stats(db: Session = Depends(get_db)):
    """Get statistics about messages"""
    from sqlalchemy import func
    
    total_messages = db.query(func.count(models.Message.id)).scalar()
    toxic_messages = db.query(func.count(models.Message.id)).filter(models.Message.sentiment == "toxic").scalar()
    not_toxic_messages = db.query(func.count(models.Message.id)).filter(models.Message.sentiment == "not toxic").scalar()
    
    return {
        "total_messages": total_messages,
        "toxic_messages": toxic_messages,
        "not_toxic_messages": not_toxic_messages,
        "toxicity_rate": (toxic_messages / total_messages * 100) if total_messages > 0 else 0
    }

# Test endpoint
@app.get("/test-youtube")
def test_youtube_service():
    try:
        import sys
        current_dir = os.path.dirname(__file__)
        backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
        if backend_services_path not in sys.path:
            sys.path.insert(0, backend_services_path)
        from youtube_service import obtener_comentarios_video
        return {"status": "YouTube service available", "path": backend_services_path}
    except Exception as e:
        return {"status": "YouTube service not available", "error": str(e)}
