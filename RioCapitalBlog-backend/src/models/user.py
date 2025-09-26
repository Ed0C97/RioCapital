# RioCapitalBlog-backend/src/models/user.py

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from src.extensions import db

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='reader')
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    newsletter_subscribed = db.Column(db.Boolean, default=False)
    linkedin_url = db.Column(db.String(255), nullable=True)

    articles = db.relationship("Article", back_populates="author")
    comments = db.relationship("Comment", back_populates="user")
    article_likes = db.relationship("ArticleLike", back_populates="user")
    article_favorites = db.relationship("ArticleFavorite", back_populates="user")
    shares = db.relationship("Share", back_populates="user")
    created_categories = db.relationship("Category", back_populates="creator")

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def can_write_articles(self):
        return self.role in ['collaborator', 'admin']

    def is_admin(self):
        return self.role == 'admin'

    def to_dict(self):
        # --- COSTRUISCI IL NOME COMPLETO QUI DENTRO ---
        full_name_str = self.username  # Inizia con l'username come fallback
        if self.first_name and self.last_name:
            full_name_str = f"{self.first_name} {self.last_name}"
        # ---------------------------------------------

        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'newsletter_subscribed': self.newsletter_subscribed,

            # --- AGGIUNGI QUESTI DUE CAMPI ---
            'linkedin_url': self.linkedin_url,
            'full_name': full_name_str
            # ---------------------------------
        }