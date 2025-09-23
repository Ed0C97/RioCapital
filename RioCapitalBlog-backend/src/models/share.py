# RioCapitalBlog-backend/src/models/share.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from src.extensions import db

class Share(db.Model):
    __tablename__ = 'shares'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    article_id = Column(Integer, ForeignKey('article.id'), nullable=False)
    platform = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="shares")
    article = relationship("Article", back_populates="shares")
