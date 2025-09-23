# RioCapitalBlog-backend/src/models/comment.py

from datetime import datetime
from src.extensions import db

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    article = db.relationship("Article", back_populates="comments")
    user = db.relationship("User", back_populates="comments")

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'article_id': self.article_id,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
