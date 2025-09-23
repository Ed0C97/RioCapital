# finblog-backend/src/models/like.py

from datetime import datetime
from src.extensions import db

class ArticleLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('article_id', 'user_id', name='unique_article_like'),)

    article = db.relationship("Article", back_populates="likes")
    user = db.relationship("User", back_populates="article_likes")
