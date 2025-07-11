from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from .database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    sentiment = Column(String, nullable=False)  # "toxic" or "not toxic"
    confidence = Column(Float, nullable=True)  # Confidence score of prediction
    embedding = Column(String, nullable=True)  # JSON string of embeddings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Message(id={self.id}, sentiment='{self.sentiment}', text='{self.text[:50]}...')>"
