from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    sentiment = Column(String, nullable=False)
    embedding = Column(String, nullable=True)  # store as JSON string or vector type if pgvector
    created_at = Column(DateTime(timezone=True), server_default=func.now())
