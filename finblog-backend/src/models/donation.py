# finblog-backend/src/models/donation.py

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from datetime import datetime
from src.extensions import db

class Donation(db.Model):
    __tablename__ = 'donations'

    id = Column(Integer, primary_key=True)
    donor_name = Column(String(100), nullable=True)
    donor_email = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default='EUR')
    message = Column(Text, nullable=True)
    anonymous = Column(Boolean, default=False)
    payment_method = Column(String(50), nullable=False)
    transaction_id = Column(String(255), nullable=True)
    status = Column(String(20), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'donor_name': self.donor_name if not self.anonymous else None,
            'donor_email': self.donor_email if not self.anonymous else None,
            'amount': self.amount,
            'currency': self.currency,
            'message': self.message,
            'anonymous': self.anonymous,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
