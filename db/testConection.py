import os
from supabase import create_client, Client

url: str = 'https://daiadkhxrercjcbwqqva.supabase.co'
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaWFka2h4cmVyY2pjYndxcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzNDk2MCwiZXhwIjoyMDY3NzEwOTYwfQ.zAeDzxDNU1yQmW-s0_Ul5uK3cZqs0DEhjteMvjJzFHA"
supabase: Client = create_client(url, key)

# Lectura de datos
# response = (
#     supabase.table("test")
#     .select("*")
#     .execute()
# )

# Escritura de datos
# response = (
#     supabase.table("test")
#     .insert({"id": "test", "message": 123})
#     .execute()
# )

print(supabase)