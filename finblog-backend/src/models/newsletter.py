from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.extensions import db

class NewsletterSubscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.JSON, default={})  # Preferenze di notifica

    def __repr__(self):
        return f'<NewsletterSubscriber {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'subscribed_at': self.subscribed_at.isoformat() if self.subscribed_at else None,
            'is_active': self.is_active,
            'preferences': self.preferences
        }

class Donation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='EUR')
    donor_name = db.Column(db.String(100), nullable=True)
    donor_email = db.Column(db.String(120), nullable=True)
    message = db.Column(db.Text, nullable=True)
    payment_method = db.Column(db.String(50), nullable=False)
    payment_id = db.Column(db.String(255), nullable=True)  # ID transazione
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_anonymous = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Donation {self.amount} {self.currency}>'

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'currency': self.currency,
            'donor_name': self.donor_name if not self.is_anonymous else 'Anonimo',
            'donor_email': self.donor_email if not self.is_anonymous else None,
            'message': self.message,
            'payment_method': self.payment_method,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_anonymous': self.is_anonymous
        }

class NotificationPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # new_article, category, author
    target_id = db.Column(db.Integer, nullable=True)  # ID categoria o autore
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relazioni
    user = db.relationship('User')

    def __repr__(self):
        return f'<NotificationPreference {self.notification_type}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'notification_type': self.notification_type,
            'target_id': self.target_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

