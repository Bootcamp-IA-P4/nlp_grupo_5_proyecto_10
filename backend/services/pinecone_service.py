"""
Servicio Supabase para sincronizar mensajes de la base de datos y guardar nuevos análisis.
"""

from supabase import create_client, Client
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Message
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde .env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
TABLE_NAME = "Margarita"

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
    data = {
        "Texto": text,
        "Toxicidad": confidence,
        "Label": sentiment
    }
    supabase.table(TABLE_NAME).insert(data).execute()

# Buscar mensajes en Supabase por texto
def search_messages_in_supabase(query_text):
    res = supabase.table(TABLE_NAME).select("*").ilike("Texto", f"%{query_text}%").execute()
    return res.data
