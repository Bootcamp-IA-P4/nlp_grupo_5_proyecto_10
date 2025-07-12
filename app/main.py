# main.py

import os
import json
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
import joblib
from sqlalchemy.orm import Session

from db import models
from db.database import SessionLocal, engine

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load models with fallback strategy
USE_OPTIMIZED_MODEL = False
tokenizer = None
model = None
pipeline = None

# Try to load HuggingFace model first (from teammate)
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    model_dir = r"C:/Users/admin/Desktop/Proyecto 10/nlp_grupo_5_proyecto_10/tokenizador"
    model_file = os.path.join(model_dir, 'model.safetensors')
    if os.path.exists(model_dir) and os.path.exists(model_file):
        tokenizer = AutoTokenizer.from_pretrained(model_dir)
        model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        USE_OPTIMIZED_MODEL = True
        logger.info("✅ Modelo HuggingFace cargado desde tokenizador/model.safetensors")
    else:
        raise Exception("No se encontró el modelo HuggingFace")
except Exception as e:
    logger.warning(f"No se pudo cargar modelo HuggingFace: {e}")
    
    # Fallback to your original pipeline
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
        pipeline = joblib.load(model_path)
        logger.info("✅ Modelo pipeline original cargado como fallback")
    except Exception as e2:
        logger.warning(f"⚠️ No se pudo cargar ningún modelo: {e2}")

# Load embedding model (from teammate - better than your hash fallback)
try:
    from sentence_transformers import SentenceTransformer
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("✅ SentenceTransformer cargado correctamente")
except Exception as e:
    logger.warning(f"No se pudo cargar SentenceTransformer: {e}")
    embedder = None

def get_embedding(text):
    if embedder:
        try:
            # Use real embeddings (teammate's improvement)
            embedding = embedder.encode(text).tolist()
            return json.dumps(embedding)
        except Exception as e:
            logger.warning(f"Error generating real embedding: {e}")
    
    # Fallback to your hash method
    import hashlib
    hash_obj = hashlib.md5(text.encode())
    embedding = [ord(c) for c in hash_obj.hexdigest()[:10]]
    return json.dumps(embedding)

def predict_sentiment(text):
    """Enhanced prediction with HuggingFace + fallback"""
    
    # Try HuggingFace model first (teammate's improvement)
    if USE_OPTIMIZED_MODEL and model and tokenizer:
        try:
            inputs = tokenizer([text], padding=True, truncation=True, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                preds = torch.argmax(probs, dim=1)
            
            id2label = model.config.id2label
            try:
                label = [id2label[str(i)] for i in preds.tolist()][0]
            except Exception:
                label = [id2label[i] for i in preds.tolist()][0]
            
            try:
                stars = int(label[0])
                sentiment = 'toxic' if stars <= 3 else 'not toxic'
            except Exception:
                sentiment = 'not toxic'
            
            confidence = probs.max().item()
            logger.info(f"HuggingFace prediction: {sentiment} ({confidence:.3f})")
            return sentiment, confidence
            
        except Exception as e:
            logger.error(f"Error con modelo HuggingFace: {e}")
    
    # Fallback to your original pipeline
    if pipeline:
        try:
            prediction = pipeline.predict([text])
            sentiment = "not toxic" if int(prediction[0]) == 0 else "toxic"
            
            try:
                prediction_proba = pipeline.predict_proba([text])
                confidence = float(max(prediction_proba[0]))
            except:
                confidence = 0.75
            
            logger.info(f"Pipeline prediction: {sentiment} ({confidence:.3f})")
            return sentiment, confidence
        except Exception as e:
            logger.error(f"Error con pipeline: {e}")
    
    # Final fallback (your word-based method)
    toxic_words = ["hate", "stupid", "idiot", "kill", "die", "worst", "fuck", "shit", "damn"]
    text_lower = text.lower()
    toxic_count = sum(1 for word in toxic_words if word in text_lower)
    
    if toxic_count > 0:
        sentiment = "toxic"
        confidence = min(0.6 + (toxic_count * 0.1), 0.9)
    else:
        sentiment = "not toxic"
        confidence = 0.7
    
    logger.info(f"Fallback prediction: {sentiment} ({confidence:.3f})")
    return sentiment, confidence

# App
app = FastAPI(
    title="NLP Sentiment Classifier API",
    description="Una API que clasifica texto usando un modelo de NLP",
    version="1.0"
)

# CORS - More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
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

# Schemas (preserve all your YouTube schemas)
class TextInput(BaseModel):
    text: str

class YouTubeRequest(BaseModel):
    url: str
    max_comments: int = 50

class YouTubeAnalysisRequest(BaseModel):
    url: str
    max_comments: int = 50
    save_to_database: bool = True

# Helper function for Supabase integration (teammate's feature)
def save_to_supabase(message_data):
    """Save to Supabase if available"""
    try:
        # Import from the existing service file
        from backend.services.pinecone_service import insert_message_to_supabase
        success = insert_message_to_supabase(
            message_data.text,
            message_data.confidence,
            message_data.sentiment
        )
        if success:
            logger.info("💾 Datos guardados en Supabase exitosamente")
            return True
        else:
            logger.warning("⚠️ No se pudo guardar en Supabase")
            return False
    except ImportError as e:
        logger.warning(f"⚠️ Servicio Supabase no disponible: {e}")
        return False
    except Exception as e:
        logger.warning(f"⚠️ Error al guardar en Supabase: {e}")
        return False

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Server is running"}

# Enhanced predict endpoint
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

# Enhanced get all messages with filtering
@app.get("/messages")
def get_messages(
    db: Session = Depends(get_db),
    sentiment: str = None,
    source: str = None,
    confidence_min: float = None,
    confidence_max: float = None,
    search_text: str = None,
    limit: int = 100,
    offset: int = 0,
    format: str = "array"  # Add format parameter for backward compatibility
):
    """Get messages with optional filtering"""
    query = db.query(models.Message)
    
    # Apply filters
    if sentiment:
        query = query.filter(models.Message.sentiment == sentiment)
    
    if source:
        query = query.filter(models.Message.source == source)
    
    if confidence_min is not None:
        query = query.filter(models.Message.confidence >= confidence_min)
    
    if confidence_max is not None:
        query = query.filter(models.Message.confidence <= confidence_max)
    
    if search_text:
        query = query.filter(models.Message.text.contains(search_text))
    
    # Order by creation date (newest first)
    query = query.order_by(models.Message.created_at.desc())
    
    # Apply pagination
    total_count = query.count()
    messages = query.offset(offset).limit(limit).all()
    
    # Check if any filters are applied (for backward compatibility)
    has_filters = any([sentiment, source, confidence_min, confidence_max, search_text, offset > 0, limit != 100])
    
    # Return array format for backward compatibility when no filters applied
    if format == "array" and not has_filters:
        return messages
    
    # Return object format with pagination info
    return {
        "messages": messages,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total_count
    }

# Add new endpoint for enhanced filtering with pagination
@app.get("/messages/search")
def search_messages(
    db: Session = Depends(get_db),
    sentiment: str = None,
    source: str = None,
    confidence_min: float = None,
    confidence_max: float = None,
    search_text: str = None,
    limit: int = 100,
    offset: int = 0
):
    """Search messages with pagination (always returns object format)"""
    query = db.query(models.Message)
    
    # Apply filters
    if sentiment:
        query = query.filter(models.Message.sentiment == sentiment)
    
    if source:
        query = query.filter(models.Message.source == source)
    
    if confidence_min is not None:
        query = query.filter(models.Message.confidence >= confidence_min)
    
    if confidence_max is not None:
        query = query.filter(models.Message.confidence <= confidence_max)
    
    if search_text:
        query = query.filter(models.Message.text.contains(search_text))
    
    # Order by creation date (newest first)
    query = query.order_by(models.Message.created_at.desc())
    
    # Apply pagination
    total_count = query.count()
    messages = query.offset(offset).limit(limit).all()
    
    return {
        "messages": messages,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total_count,
        "filters_applied": {
            "sentiment": sentiment,
            "source": source,
            "confidence_min": confidence_min,
            "confidence_max": confidence_max,
            "search_text": search_text
        }
    }

# Enhanced HTML viewer with filters and timestamps
@app.get("/view", response_class=HTMLResponse)
def view_messages(
    db: Session = Depends(get_db),
    sentiment: str = None,
    source: str = None,
    confidence_min: float = None,
    confidence_max: float = None,
    search_text: str = None
):
    """Enhanced HTML viewer with filters and timestamps"""
    query = db.query(models.Message)
    
    # Apply same filters as API endpoint
    if sentiment:
        query = query.filter(models.Message.sentiment == sentiment)
    if source:
        query = query.filter(models.Message.source == source)
    if confidence_min is not None:
        query = query.filter(models.Message.confidence >= confidence_min)
    if confidence_max is not None:
        query = query.filter(models.Message.confidence <= confidence_max)
    if search_text:
        query = query.filter(models.Message.text.contains(search_text))
    
    messages = query.order_by(models.Message.created_at.desc()).limit(50).all()
    
    html_content = f"""
    <html>
    <head>
        <title>Messages Database</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .filters {{ margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; }}
            .filter-input {{ margin: 5px; padding: 5px; }}
            .toxic {{ background-color: #ffebee; }}
            .not-toxic {{ background-color: #e8f5e8; }}
        </style>
    </head>
    <body>
        <h1>Messages Database</h1>
        
        <div class="filters">
            <h3>Filters</h3>
            <form method="get">
                <input type="text" name="search_text" placeholder="Search text..." value="{search_text or ''}" class="filter-input">
                
                <select name="sentiment" class="filter-input">
                    <option value="">All Sentiments</option>
                    <option value="toxic" {'selected' if sentiment == 'toxic' else ''}>Toxic</option>
                    <option value="not toxic" {'selected' if sentiment == 'not toxic' else ''}>Not Toxic</option>
                </select>
                
                <select name="source" class="filter-input">
                    <option value="">All Sources</option>
                    <option value="youtube" {'selected' if source == 'youtube' else ''}>YouTube</option>
                    <option value="manual" {'selected' if source == 'manual' else ''}>Manual</option>
                </select>
                
                <input type="number" name="confidence_min" placeholder="Min Confidence" value="{confidence_min or ''}" step="0.1" min="0" max="1" class="filter-input">
                <input type="number" name="confidence_max" placeholder="Max Confidence" value="{confidence_max or ''}" step="0.1" min="0" max="1" class="filter-input">
                
                <button type="submit">Apply Filters</button>
                <a href="/view">Clear Filters</a>
            </form>
        </div>
        
        <table>
            <tr>
                <th>ID</th>
                <th>Text</th>
                <th>Sentiment</th>
                <th>Confidence</th>
                <th>Source</th>
                <th>Author</th>
                <th>Likes</th>
                <th>YouTube Date</th>
                <th>Created</th>
            </tr>
    """
    
    for msg in messages:
        sentiment_class = "toxic" if msg.sentiment == "toxic" else "not-toxic"
        youtube_timestamp = "N/A"
        
        # Safely try to get YouTube timestamp - handle missing columns gracefully
        try:
            if hasattr(msg, 'youtube_comment_timestamp') and getattr(msg, 'youtube_comment_timestamp', None):
                youtube_timestamp = msg.youtube_comment_timestamp.strftime("%Y-%m-%d %H:%M")
            elif hasattr(msg, 'youtube_comment_date_str') and getattr(msg, 'youtube_comment_date_str', None):
                youtube_timestamp = msg.youtube_comment_date_str
            elif getattr(msg, 'source', None) == 'youtube':
                youtube_timestamp = "YouTube (no timestamp)"
        except Exception:
            youtube_timestamp = "N/A"
        
        html_content += f"""
            <tr class="{sentiment_class}">
                <td>{msg.id}</td>
                <td>{msg.text[:100]}{'...' if len(msg.text) > 100 else ''}</td>
                <td>{msg.sentiment}</td>
                <td>{msg.confidence:.3f}</td>
                <td>{getattr(msg, 'source', 'manual')}</td>
                <td>{getattr(msg, 'youtube_author', 'N/A')}</td>
                <td>{getattr(msg, 'youtube_likes', 0)}</td>
                <td>{youtube_timestamp}</td>
                <td>{msg.created_at.strftime('%Y-%m-%d %H:%M')}</td>
            </tr>
        """
    
    html_content += f"""
        </table>
        <p>Showing {len(messages)} messages | 
           <a href="/docs">API Docs</a> | 
           <a href="/messages">JSON View</a> |
           <a href="/messages/stats">Statistics</a>
        </p>
    </body>
    </html>
    """
    
    return html_content

# Add filter options endpoint
@app.get("/messages/filter-options")
def get_filter_options(db: Session = Depends(get_db)):
    """Get available filter options"""
    from sqlalchemy import func, distinct
    
    sentiments = db.query(distinct(models.Message.sentiment)).all()
    sources = db.query(distinct(models.Message.source)).all()
    
    confidence_stats = db.query(
        func.min(models.Message.confidence).label('min_confidence'),
        func.max(models.Message.confidence).label('max_confidence')
    ).first()
    
    return {
        "sentiments": [s[0] for s in sentiments if s[0]],
        "sources": [s[0] for s in sources if s[0]],
        "confidence_range": {
            "min": float(confidence_stats.min_confidence or 0),
            "max": float(confidence_stats.max_confidence or 1)
        }
    }

# Enhanced create message with Supabase integration
@app.post("/messages")
def create_message(message: TextInput, db: Session = Depends(get_db)):
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

    # Save to Supabase (teammate's feature)
    save_to_supabase(new_message)

    return new_message

# Enhanced update message
@app.put("/messages/{id}")
def update_message(id: int, message: TextInput, db: Session = Depends(get_db)):
    db_message = db.query(models.Message).filter(models.Message.id == id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    sentiment, confidence = predict_sentiment(message.text)
    
    db_message.text = message.text
    db_message.sentiment = sentiment
    db_message.confidence = confidence
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

# YOUR YOUTUBE ENDPOINTS (PRESERVED COMPLETELY) 

# YouTube Comments endpoint
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

# Enhanced YouTube analysis endpoint with Supabase integration
@app.post("/youtube-analyze")
def analyze_youtube_comments(request: YouTubeAnalysisRequest, db: Session = Depends(get_db)):
    """Extract, analyze, and save YouTube comments to database + Supabase"""
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
                        
                        # Parse YouTube comment timestamp
                        comment_timestamp = None
                        comment_date_str = comment.get("fecha", "")
                        
                        if comment_date_str:
                            try:
                                import re
                                current_time = datetime.now()
                                
                                # Handle "hace X días/horas/minutos" format
                                if "hace" in comment_date_str.lower():
                                    if "día" in comment_date_str or "day" in comment_date_str:
                                        days_match = re.search(r'\d+', comment_date_str)
                                        if days_match:
                                            days = int(days_match.group())
                                            comment_timestamp = current_time - timedelta(days=days)
                                    elif "hora" in comment_date_str or "hour" in comment_date_str:
                                        hours_match = re.search(r'\d+', comment_date_str)
                                        if hours_match:
                                            hours = int(hours_match.group())
                                            comment_timestamp = current_time - timedelta(hours=hours)
                                    elif "minuto" in comment_date_str or "minute" in comment_date_str:
                                        minutes_match = re.search(r'\d+', comment_date_str)
                                        if minutes_match:
                                            minutes = int(minutes_match.group())
                                            comment_timestamp = current_time - timedelta(minutes=minutes)
                                else:
                                    # Try to parse absolute date formats
                                    for date_format in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d %H:%M:%S"]:
                                        try:
                                            comment_timestamp = datetime.strptime(comment_date_str, date_format)
                                            break
                                        except ValueError:
                                            continue
                            except Exception as e:
                                logger.warning(f"Could not parse timestamp '{comment_date_str}': {e}")
                        
                        analyzed_comment = {
                            "original": comment,
                            "sentiment": sentiment,
                            "confidence": confidence,
                            "timestamp": comment_timestamp.isoformat() if comment_timestamp else None,
                            "youtube_metadata": {
                                "video_url": video_url,
                                "video_title": resultado["video_info"]["titulo"],
                                "channel": resultado["video_info"]["canal"],
                                "author": comment["autor"],
                                "likes": comment["likes"],
                                "date": comment["fecha"],
                                "timestamp": comment_timestamp.isoformat() if comment_timestamp else None,
                                "date_string": comment_date_str
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
                        
                        # Only add timestamp fields if they exist in the model
                        try:
                            if hasattr(models.Message, 'youtube_comment_timestamp'):
                                new_message.youtube_comment_timestamp = comment_timestamp
                            if hasattr(models.Message, 'youtube_comment_date_str'):
                                new_message.youtube_comment_date_str = comment_date_str
                        except Exception as e:
                            logger.warning(f"Could not set timestamp fields: {e}")
                        
                        db.add(new_message)
                        saved_messages.append(new_message)
                        
                    except Exception as e:
                        logger.error(f"Error analyzing comment: {e}")
                        continue
                
                db.commit()
                
                # Save each message to Supabase too
                for msg in saved_messages:
                    db.refresh(msg)
                    save_to_supabase(msg)
            
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

# Endpoint to get message statistics
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
        current_dir = os.path.dirname(__file__)
        backend_services_path = os.path.join(current_dir, '..', 'backend', 'services')
        if backend_services_path not in sys.path:
            sys.path.insert(0, backend_services_path)
        from youtube_service import obtener_comentarios_video
        return {"status": "YouTube service available", "path": backend_services_path}
    except Exception as e:
        return {"status": "YouTube service not available", "error": str(e)}

# Add new endpoint to test Supabase connection
@app.get("/test-supabase")
def test_supabase():
    try:
        from backend.services.pinecone_service import test_supabase_connection
        return test_supabase_connection()
    except ImportError as e:
        return {"status": "error", "message": f"Supabase service not available: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Supabase test failed: {str(e)}"}

# Enhanced debug endpoint to check environment variables
@app.get("/debug-env")
def debug_env():
    from dotenv import load_dotenv
    load_dotenv()

    supabase_url = os.getenv("SUPABASE_URL", "NOT_SET")
    supabase_key = os.getenv("SUPABASE_KEY", "NOT_SET")

    return {
        "env_file_exists": os.path.exists(".env"),
        "supabase_url_exists": bool(supabase_url and supabase_url != "NOT_SET"),
        "supabase_key_exists": bool(supabase_key and supabase_key != "NOT_SET"),
        "supabase_url_preview": supabase_url[:50] + "..." if len(supabase_url) > 50 else supabase_url,
        "supabase_url_is_placeholder": "tu-proyecto" in supabase_url.lower(),
        "working_directory": os.getcwd(),
        "env_path": os.path.abspath(".env") if os.path.exists(".env") else "NOT_FOUND"
    }

# Endpoint to update environment variables
@app.post("/update-supabase-config")
def update_supabase_config(config: dict):
    """Update Supabase configuration (for development only)"""
    try:
        env_path = ".env"
        env_vars = {}
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    if '=' in line and not line.strip().startswith('#'):
                        key, value = line.strip().split('=', 1)
                        env_vars[key] = value

        if 'supabase_url' in config:
            env_vars['SUPABASE_URL'] = config['supabase_url']
        if 'supabase_key' in config:
            env_vars['SUPABASE_KEY'] = config['supabase_key']

        with open(env_path, 'w') as f:
            for key, value in env_vars.items():
                f.write(f"{key}={value}\n")

        return {
            "success": True,
            "message": "Environment variables updated. Please restart the server.",
            "updated_vars": list(config.keys())
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Supabase data viewer endpoint
@app.get("/supabase-messages")
def get_supabase_messages():
    """Get messages from Supabase database"""
    try:
        from backend.services.pinecone_service import get_all_messages_from_supabase
        messages = get_all_messages_from_supabase()
        return {
            "success": True,
            "count": len(messages) if messages else 0,
            "messages": messages
        }
    except ImportError as e:
        return {"success": False, "error": f"Supabase service not available: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Supabase error: {str(e)}"}

# Timeline analysis endpoint
@app.get("/messages/timeline")
def get_timeline_data(db: Session = Depends(get_db)):
    """Get timeline data for dashboard graphs"""
    timeline_data = db.query(
        func.date(models.Message.created_at).label('date'),
        func.count(models.Message.id).label('total_comments'),
        func.sum(func.case((models.Message.sentiment == 'toxic', 1), else_=0)).label('toxic_comments'),
        func.sum(func.case((models.Message.sentiment == 'not toxic', 1), else_=0)).label('not_toxic_comments'),
        func.avg(models.Message.confidence).label('avg_confidence')
    ).filter(
        models.Message.source == "youtube"
    ).group_by(
        func.date(models.Message.created_at)
    ).order_by(
        func.date(models.Message.created_at)
    ).all()

    return {
        "timeline": [
            {
                "date": str(row.date),
                "total_comments": row.total_comments,
                "toxic_comments": row.toxic_comments,
                "not_toxic_comments": row.not_toxic_comments,
                "toxicity_rate": (row.toxic_comments / row.total_comments * 100) if row.total_comments > 0 else 0,
                "avg_confidence": round(float(row.avg_confidence or 0), 2)
            }
            for row in timeline_data
        ]
    }

# Video analysis endpoint
@app.get("/messages/video-analysis/{video_id}")
def get_video_analysis(video_id: str, db: Session = Depends(get_db)):
    """Get analysis for a specific video"""
    messages = db.query(models.Message).filter(
        models.Message.youtube_video_id == video_id,
        models.Message.source == "youtube"
    ).all()

    if not messages:
        raise HTTPException(status_code=404, detail="Video not found")

    total_comments = len(messages)
    toxic_comments = sum(1 for msg in messages if msg.sentiment == "toxic")

    return {
        "video_id": video_id,
        "video_title": messages[0].youtube_video_title,
        "channel": messages[0].youtube_channel,
        "total_comments": total_comments,
        "toxic_comments": toxic_comments,
        "not_toxic_comments": total_comments - toxic_comments,
        "toxicity_rate": (toxic_comments / total_comments * 100) if total_comments > 0 else 0,
        "avg_confidence": sum(msg.confidence for msg in messages) / total_comments if total_comments > 0 else 0,
        "comments": [
            {
                "id": msg.id,
                "text": msg.text,
                "sentiment": msg.sentiment,
                "confidence": msg.confidence,
                "author": msg.youtube_author,
                "likes": msg.youtube_likes,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }

# Server startup
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5174)