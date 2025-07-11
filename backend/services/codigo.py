import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from backend.services.pinecone_service import sync_all_messages_to_supabase, insert_message_to_supabase, search_messages_in_supabase

# 1. Sincronizar todos los mensajes de la base de datos a Supabase
sync_all_messages_to_supabase()
print("Mensajes sincronizados correctamente en Supabase.")

# 2. Insertar un nuevo comentario de ejemplo
insert_message_to_supabase("hola anca , me fui de joda y no me quede estudiando", 0.7, "not toxic")
print("Comentario insertado.")

# 3. Buscar un comentario en Supabase para verificar que se guardó
query = "hola"
resultados = search_messages_in_supabase(query)
print("Resultados de búsqueda en Supabase:")
for r in resultados:
    print(r)