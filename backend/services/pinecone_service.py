"""
Servicio Supabase para sincronizar mensajes de la base de datos y guardar nuevos análisis.      
"""

from supabase import create_client, Client
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Message
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

# Cargar variables de entorno desde .env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Debug: Log loaded values
logger.info(f"Loading Supabase credentials...")
logger.info(f"SUPABASE_URL: {SUPABASE_URL[:30] + '...' if SUPABASE_URL else 'None'}")
logger.info(f"SUPABASE_KEY: {SUPABASE_KEY[:30] + '...' if SUPABASE_KEY else 'None'}")

try:
    if SUPABASE_URL and SUPABASE_KEY:
        # Clean URL (remove trailing slash if present)
        clean_url = SUPABASE_URL.rstrip('/')
        supabase: Client = create_client(clean_url, SUPABASE_KEY)
        TABLE_NAME = "Margarita"
        logger.info("✅ Supabase client initialized successfully")
        
        # Test connection immediately
        try:
            test_result = supabase.table(TABLE_NAME).select("count").limit(1).execute()
            logger.info("✅ Supabase connection test successful")
        except Exception as test_error:
            logger.error(f"❌ Supabase connection test failed: {test_error}")
            supabase = None
            
    else:
        supabase = None
        TABLE_NAME = None
        logger.warning("⚠️ Supabase credentials not found in environment variables")
except Exception as e:
    supabase = None
    TABLE_NAME = None
    logger.error(f"❌ Error initializing Supabase client: {e}")

# Insertar todos los mensajes existentes en Supabase
def sync_all_messages_to_supabase():
    db: Session = SessionLocal()
    messages = db.query(Message).all()
    for msg in messages:
        data = {
            "Texto": msg.text,
            "Toxicidad": msg.confidence,
            "Label": msg.sentiment
        }
        supabase.table(TABLE_NAME).insert(data).execute()
    db.close()

# Guardar un nuevo análisis en Supabase
def insert_message_to_supabase(text, confidence, sentiment):
    try:
        if not supabase or not TABLE_NAME:
            logger.warning("⚠️ Supabase not configured - skipping save")
            return False
            
        data = {
            "Texto": text,
            "Toxicidad": float(confidence),
            "Label": sentiment
        }
        result = supabase.table(TABLE_NAME).insert(data).execute()
        
        if result.data:
            logger.info(f"✅ Message saved to Supabase table '{TABLE_NAME}': {result.data[0].get('id', 'unknown')}")
            return True
        else:
            logger.error("❌ Failed to save to Supabase - No data returned")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error saving to Supabase: {e}")
        return False

# Buscar mensajes en Supabase por texto
def search_messages_in_supabase(query_text):
    res = supabase.table(TABLE_NAME).select("*").ilike("Texto", f"%{query_text}%").execute()
    return res.data

# Test connection function
def test_supabase_connection():
    """Test Supabase connection and return detailed status"""
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            return {
                "status": "error", 
                "message": "Missing credentials",
                "details": f"URL: {bool(SUPABASE_URL)}, KEY: {bool(SUPABASE_KEY)}"
            }
        
        if not supabase:
            return {
                "status": "error", 
                "message": "Supabase client not initialized",
                "details": "Check logs for initialization errors"
            }
        
        # Test actual connection
        result = supabase.table(TABLE_NAME).select("count").limit(1).execute()
        
        return {
            "status": "success", 
            "message": "Supabase connection working",
            "table": TABLE_NAME,
            "url": SUPABASE_URL[:30] + "..."
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Connection test failed: {str(e)}",
            "details": "Check credentials and network connectivity"
        }
