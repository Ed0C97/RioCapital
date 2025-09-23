# src/models/favorite.py
from datetime import datetime
from src.extensions import db

class ArticleFavorite(db.Model):  # <-- NOME CORRETTO
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('article_id', 'user_id', name='unique_article_favorite'),)

    # --- RELAZIONI ---
    article = db.relationship("Article", back_populates="favorites")
    user = db.relationship("User", back_populates="article_favorites")