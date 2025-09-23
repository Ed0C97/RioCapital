# finblog-backend/src/models/category.py

from datetime import datetime
from sqlalchemy import func
from src.extensions import db
from src.models.article import Article

class Category(db.Model):
    __tablename__ = 'category'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), default='#007BFF')
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    creator = db.relationship("User", back_populates="created_categories")
    articles = db.relationship("Article", back_populates="category")

    def __repr__(self):
        return f'<Category {self.name}>'

    def to_dict(self):

        latest_article_date = db.session.query(func.max(Article.created_at)) \
            .filter(Article.category_id == self.id) \
            .scalar()

        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'color': self.color,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by,
            'article_count': len(self.articles),
            'latest_article_date': latest_article_date.isoformat() if latest_article_date else None,
            'creator_name': self.creator.username if self.creator else None,
            'is_active': self.is_active
        }
