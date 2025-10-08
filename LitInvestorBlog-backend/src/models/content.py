# LitInvestorBlog-backend/src/models/content.py

from src.extensions import db
from datetime import datetime

class Content(db.Model):
    __tablename__ = "content"

    id = db.Column(db.Integer, primary_key=True)

    page_key = db.Column(db.String(50), unique=True, nullable=False)

    body = db.Column(db.Text, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "page_key": self.page_key,
            "body": self.body,
            "updated_at": self.updated_at.isoformat(),
        }
