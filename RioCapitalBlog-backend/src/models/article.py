# RioCapitalBlog-backend/src/models/article.py

from datetime import datetime
from src.extensions import db

class Article(db.Model):
    __tablename__ = 'article'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published = db.Column(db.Boolean, default=False)
    likes_count = db.Column(db.Integer, default=0)
    views_count = db.Column(db.Integer, default=0)

    author = db.relationship("User", back_populates="articles")
    category = db.relationship("Category", back_populates="articles")
    comments = db.relationship("Comment", back_populates="article")
    likes = db.relationship("ArticleLike", back_populates="article")
    favorites = db.relationship("ArticleFavorite", back_populates="article")
    shares = db.relationship("Share", back_populates="article")

    def __repr__(self):
        return f'<Article {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'image_url': self.image_url,
            'author_id': self.author_id,
            'author_name': self.author.username if self.author else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'category_color': self.category.color if self.category else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published': self.published,
            'likes_count': self.likes_count,
            'views_count': self.views_count
        }
