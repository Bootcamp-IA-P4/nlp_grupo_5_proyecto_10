import sqlite3
import os

def migrate_database():
    """Add new columns to existing messages table"""
    db_path = "messages.db"
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if new columns exist
    cursor.execute("PRAGMA table_info(messages)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # Add new columns if they don't exist
    new_columns = [
        ("source", "VARCHAR DEFAULT 'manual'"),
        ("youtube_video_id", "VARCHAR"),
        ("youtube_author", "VARCHAR"),
        ("youtube_likes", "INTEGER DEFAULT 0"),
        ("youtube_video_title", "VARCHAR"),
        ("youtube_channel", "VARCHAR")
    ]
    
    for column_name, column_def in new_columns:
        if column_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE messages ADD COLUMN {column_name} {column_def}")
                print(f"✅ Added column: {column_name}")
            except Exception as e:
                print(f"❌ Error adding column {column_name}: {e}")
    
    # Commit changes
    conn.commit()
    conn.close()
    print("🎯 Database migration completed!")

if __name__ == "__main__":
    migrate_database()
