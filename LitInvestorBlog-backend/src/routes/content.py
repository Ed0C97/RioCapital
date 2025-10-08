# LitInvestorBlog-backend/src/routes/content.py

from flask import Blueprint, request, jsonify
from src.extensions import db
from src.models.content import Content
from src.routes.auth import admin_required

content_bp = Blueprint("content", __name__)

@content_bp.route("/<string:page_key>", methods=["GET"])
def get_content(page_key):
    content_entry = Content.query.filter_by(page_key=page_key).first()

    if content_entry:
        return jsonify({"content": content_entry.to_dict()}), 200
    else:

        return jsonify({"error": "Contenuto non trovato"}), 404

@content_bp.route("/<string:page_key>", methods=["PUT"])
@admin_required
def update_content(page_key):
    data = request.get_json()
    if "body" not in data:
        return jsonify({"error": "Contenuto (body) mancante"}), 400

    new_body = data["body"]

    content_entry = Content.query.filter_by(page_key=page_key).first()

    if content_entry:

        content_entry.body = new_body
    else:

        content_entry = Content(page_key=page_key, body=new_body)
        db.session.add(content_entry)

    db.session.commit()

    return (
        jsonify(
            {
                "message": "Contenuto aggiornato con successo",
                "content": content_entry.to_dict(),
            }
        ),
        200,
    )
