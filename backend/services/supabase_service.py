import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def insert_message_to_supabase(text, confidence, sentiment):
    """Insert message to Supabase database"""
    try:
        from supabase import create_client, Client
        
        # Get Supabase credentials from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            logger.warning("Supabase credentials not found in environment variables")
            return False
        
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Prepare data
        data = {
            "text": text,
            "sentiment": sentiment,
            "confidence": float(confidence),
            "created_at": datetime.utcnow().isoformat(),
            "source": "nlp_app"
        }
        
        # Insert data
        result = supabase.table('messages').insert(data).execute()
        
        if result.data:
            logger.info(f"✅ Message saved to Supabase: ID {result.data[0].get('id', 'unknown')}")
            return True
        else:
            logger.error("❌ Failed to save to Supabase - No data returned")
            return False
            
    except ImportError:
        logger.warning("⚠️ Supabase library not installed. Run: pip install supabase")
        return False
    except Exception as e:
        logger.error(f"❌ Error saving to Supabase: {e}")
        return False

def test_supabase_connection():
    """Test Supabase connection"""
    try:
        from supabase import create_client, Client
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            return {"status": "error", "message": "Missing Supabase credentials"}
        
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Test connection by trying to read from messages table
        result = supabase.table('messages').select("count").limit(1).execute()
        
        return {
            "status": "success", 
            "message": "Supabase connection successful",
            "url": supabase_url[:20] + "..."
        }
        
    except ImportError:
        return {"status": "error", "message": "Supabase library not installed"}
    except Exception as e:
        return {"status": "error", "message": f"Connection failed: {str(e)}"}
