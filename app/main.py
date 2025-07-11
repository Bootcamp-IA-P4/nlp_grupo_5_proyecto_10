# main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
# from app.TextPreprocessor import TextPreprocessor  # Temporarily commented out
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

# Load original model as fallback with error handling
try:
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
    pipeline = joblib.load(model_path)
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.warning(f"⚠️ Could not load model: {e}")
    pipeline = None

# Simple embedding fallback
def get_embedding(text):
    import hashlib
    import json
    hash_obj = hashlib.md5(text.encode())
    embedding = [ord(c) for c in hash_obj.hexdigest()[:10]]
    return json.dumps(embedding)

# Disable heavy models for now to save space
USE_OPTIMIZED_MODEL = False
optimized_model = None

logger.info("🎯 Using lightweight configuration - Original Pipeline only")

# Define prediction function with fallback
def predict_sentiment(text):
    # Use original pipeline if available
    if pipeline:
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
    
    # Fallback prediction (simple word-based)
    toxic_words = ["hate", "stupid", "idiot", "kill", "die", "worst"]
    text_lower = text.lower()
    toxic_count = sum(1 for word in toxic_words if word in text_lower)
    
    if toxic_count > 0:
        sentiment = "toxic"
        confidence = min(0.6 + (toxic_count * 0.1), 0.9)
    else:
        sentiment = "not toxic"
        confidence = 0.7
    
    return sentiment, confidence

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

class YouTubeRequest(BaseModel):
    url: str
    max_comments: int = 50

# Add new schema for bulk comment analysis
class YouTubeAnalysisRequest(BaseModel):
    url: str
    max_comments: int = 50
    save_to_database: bool = True

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

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

# YouTube Comments endpoint
@app.post("/youtube-comments")
def get_youtube_comments(request: YouTubeRequest):
    """
    Extract comments from a YouTube video URL
    """
    try:
        video_url = request.url
        max_comments = request.max_comments
        
        logger.info(f"YouTube request received - URL: {video_url}, Max comments: {max_comments}")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        # Try to import and use YouTube service
        try:
            import sys
            import os
            current_dir = os.path.dirname(__file__)
            backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
            if backend_services_path not in sys.path:
                sys.path.insert(0, backend_services_path)
            logger.info(f"Backend services path: {backend_services_path}")
            from youtube_service import obtener_comentarios_video
            resultado = obtener_comentarios_video(video_url, max_comments)
            logger.info(f"YouTube service result keys: {resultado.keys() if isinstance(resultado, dict) else 'Not a dict'}")
            if isinstance(resultado, dict) and "error" in resultado:
                logger.error(f"YouTube service error: {resultado['error']}")
                raise HTTPException(status_code=400, detail=resultado["error"])
            return resultado
        except ImportError as e:
            logger.error(f"Import error: {e}")
            return {
                "success": False,
                "error": f"YouTube service not available. Missing dependencies: {str(e)}"
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

# New endpoint for YouTube comment analysis and saving
@app.post("/youtube-analyze")
def analyze_youtube_comments(request: YouTubeAnalysisRequest, db: Session = Depends(get_db)):
    """
    Extract, analyze, and save YouTube comments to database
    """
    try:
        video_url = request.url
        max_comments = request.max_comments
        save_to_db = request.save_to_database
        
        logger.info(f"YouTube analysis request - URL: {video_url}, Max: {max_comments}, Save: {save_to_db}")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        # Get YouTube comments
        try:
            import sys
            import os
            current_dir = os.path.dirname(__file__)
            backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
            if backend_services_path not in sys.path:
                sys.path.insert(0, backend_services_path)
            
            from youtube_service import obtener_comentarios_video
            resultado = obtener_comentarios_video(video_url, max_comments)
            
            if isinstance(resultado, dict) and "error" in resultado:
                raise HTTPException(status_code=400, detail=resultado["error"])
            
            # Analyze and save comments if requested
            analyzed_comments = []
            saved_messages = []
            
            if save_to_db and resultado.get("success") and resultado.get("comentarios"):
                for comment in resultado["comentarios"]:
                    try:
                        # Analyze sentiment
                        sentiment, confidence = predict_sentiment(comment["texto"])
                        embedding = get_embedding(comment["texto"])
                        
                        # Extract video ID from URL
                        video_id = video_url.split("v=")[-1].split("&")[0] if "v=" in video_url else video_url.split("/")[-1]
                        
                        # Create analyzed comment object
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
                        
                        # Save to database
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
                
                # Commit all at once for efficiency
                db.commit()
                
                # Refresh saved messages
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
                "comments": analyzed_comments[:5] if not save_to_db else analyzed_comments[:5]  # Show preview
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

# Enhanced messages endpoint with filtering
@app.get("/messages/youtube")
def get_youtube_messages(db: Session = Depends(get_db)):
    """Get only messages from YouTube"""
    return db.query(models.Message).filter(models.Message.source == "youtube").all()

@app.get("/messages/stats")
def get_message_stats(db: Session = Depends(get_db)):
    """Get statistics about messages"""
    from sqlalchemy import func
    
    total_messages = db.query(func.count(models.Message.id)).scalar()
    youtube_messages = db.query(func.count(models.Message.id)).filter(models.Message.source == "youtube").scalar()
    toxic_messages = db.query(func.count(models.Message.id)).filter(models.Message.sentiment == "toxic").scalar()
    not_toxic_messages = db.query(func.count(models.Message.id)).filter(models.Message.sentiment == "not toxic").scalar()
    
    avg_confidence = db.query(func.avg(models.Message.confidence)).scalar() or 0
    
    return {
        "total_messages": total_messages,
        "youtube_messages": youtube_messages,
        "manual_messages": total_messages - youtube_messages,
        "toxic_messages": toxic_messages,
        "not_toxic_messages": not_toxic_messages,
        "toxicity_rate": (toxic_messages / total_messages * 100) if total_messages > 0 else 0,
        "avg_confidence": round(float(avg_confidence), 2)
    }

# Test endpoint to verify YouTube service
@app.get("/test-youtube")
def test_youtube_service():
    try:
        import sys
        import os
        current_dir = os.path.dirname(__file__)
        backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
        if backend_services_path not in sys.path:
            sys.path.insert(0, backend_services_path)
        from youtube_service import obtener_comentarios_video
        return {"status": "YouTube service available", "path": backend_services_path}
    except Exception as e:
        return {"status": "YouTube service not available", "error": str(e)}
