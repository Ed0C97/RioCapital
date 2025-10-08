# LitInvestorBlog-backend/src/routes/filters.py

from flask import Blueprint, jsonify
from sqlalchemy import extract
from src.models.article import Article
from src.models.category import Category
from src.models.user import User
from src.extensions import db

filters_bp = Blueprint("filters", __name__)

@filters_bp.route("/options", methods=["GET"])
def get_filter_options():
    try:

        categories = Category.query.order_by(Category.name).all()

        authors = db.session.query(User).join(Article).group_by(User.id).all()

        dates = (
            db.session.query(
                extract("year", Article.created_at).label("year"),
                extract("month", Article.created_at).label("month"),
            )
            .group_by("year", "month")
            .order_by(db.desc("year"), db.desc("month"))
            .all()
        )

        category_options = [
            {"value": cat.slug, "label": cat.name} for cat in categories
        ]
        author_options = [
            {"value": author.id, "label": author.username} for author in authors
        ]

        date_options = {}
        for row in dates:
            year, month = row.year, row.month
            if year not in date_options:
                date_options[year] = []
            date_options[year].append(month)

        return (
            jsonify(
                {
                    "categories": category_options,
                    "authors": author_options,
                    "dates": date_options,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Errore in get_filter_options: {e}")
        return jsonify({"error": "Errore nel caricamento dei filtri"}), 500
