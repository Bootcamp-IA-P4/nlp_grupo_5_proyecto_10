#!/usr/bin/env python3
"""
Script to test database connection and functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from db import models

def test_database():
    print("🔍 Testing database connection...")
    
    # Create tables
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    # Test database connection
    try:
        db: Session = SessionLocal()
        
        # Test insert
        test_message = models.Message(
            text="This is a test message for database verification",
            sentiment="not toxic",
            confidence=0.95
        )
        db.add(test_message)
        db.commit()
        db.refresh(test_message)
        print(f"✅ Test message created with ID: {test_message.id}")
        
        # Test query
        messages = db.query(models.Message).all()
        print(f"✅ Found {len(messages)} total messages in database")
        
        # Test delete test message
        db.delete(test_message)
        db.commit()
        print("✅ Test message cleaned up")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

if __name__ == "__main__":
    if test_database():
        print("\n🎉 Database is working correctly!")
    else:
        print("\n💥 Database test failed!")
        sys.exit(1)
