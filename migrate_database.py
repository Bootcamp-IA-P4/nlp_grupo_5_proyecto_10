#!/usr/bin/env python3
"""
Script to migrate/update database schema
"""

import sys
import os
import sqlite3
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import SessionLocal, engine
from db import models

def check_current_schema():
    """Check current database schema"""
    print("🔍 Checking current database schema...")
    
    conn = sqlite3.connect('messages.db')
    cursor = conn.cursor()
    
    # Get table info
    cursor.execute("PRAGMA table_info(messages)")
    columns = cursor.fetchall()
    
    print("Current columns in messages table:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    conn.close()
    return [col[1] for col in columns]

def migrate_database():
    """Migrate database to new schema"""
    print("\n🔄 Starting database migration...")
    
    current_columns = check_current_schema()
    
    # Check if we need to add new columns
    if 'confidence' not in current_columns:
        print("Adding 'confidence' column...")
        conn = sqlite3.connect('messages.db')
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE messages ADD COLUMN confidence REAL")
        conn.commit()
        conn.close()
        print("✅ Added 'confidence' column")
    
    if 'updated_at' not in current_columns:
        print("Adding 'updated_at' column...")
        conn = sqlite3.connect('messages.db')
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE messages ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP")
        conn.commit()
        conn.close()
        print("✅ Added 'updated_at' column")
    
    print("✅ Database migration completed!")

def recreate_database():
    """Recreate database with new schema (WARNING: This will delete all data!)"""
    print("\n⚠️  RECREATING DATABASE - THIS WILL DELETE ALL EXISTING DATA!")
    response = input("Are you sure? Type 'yes' to continue: ")
    
    if response.lower() != 'yes':
        print("❌ Migration cancelled")
        return False
    
    # Remove existing database
    if os.path.exists('messages.db'):
        os.remove('messages.db')
        print("🗑️  Removed old database file")
    
    # Create new database with updated schema
    models.Base.metadata.create_all(bind=engine)
    print("✅ Created new database with updated schema")
    
    return True

if __name__ == "__main__":
    print("Database Migration Tool")
    print("=" * 50)
    
    if not os.path.exists('messages.db'):
        print("No database found. Creating new one...")
        models.Base.metadata.create_all(bind=engine)
        print("✅ New database created!")
    else:
        print("1. Migrate existing database (preserve data)")
        print("2. Recreate database (delete all data)")
        
        choice = input("\nChoose option (1 or 2): ")
        
        if choice == "1":
            migrate_database()
        elif choice == "2":
            if recreate_database():
                print("Database recreated successfully!")
        else:
            print("Invalid choice")
            sys.exit(1)
    
    # Test the updated database
    print("\n🧪 Testing updated database...")
    os.system("python test_database.py")
