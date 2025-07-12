from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    sentiment = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    embedding = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    source = Column(String, default="manual")
    
    # YouTube specific fields
    youtube_video_id = Column(String, nullable=True)
    youtube_author = Column(String, nullable=True)
    youtube_likes = Column(Integer, default=0)
    youtube_video_title = Column(String, nullable=True)
    youtube_channel = Column(String, nullable=True)
    
    # Add timestamp fields for timeline analysis
    youtube_comment_timestamp = Column(DateTime, nullable=True)
    youtube_comment_date_str = Column(String, nullable=True)

    def __repr__(self):
        return f"<Message(id={self.id}, sentiment='{self.sentiment}', text='{self.text[:50]}...')>"
