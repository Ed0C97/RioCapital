# RioCapitalBlog-backend/src/routes/favorites.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from src.extensions import db
import logging
from src.models.favorite import ArticleFavorite as Favorite
from src.models.article import Article

favorites_bp = Blueprint("favorites", __name__)


@favorites_bp.route("/api/favorites", methods=["GET"])
@login_required
def get_user_favorites():
    """Ottieni gli articoli preferiti dell'utente"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)

        favorites = (
            Favorite.query.filter_by(user_id=current_user.id)
            .join(Article)
            .filter(Article.published)
            .order_by(desc(Favorite.created_at))
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return jsonify(
            {
                "success": True,
                "favorites": [favorite.to_dict() for favorite in favorites.items],
                "pagination": {
                    "page": page,
                    "pages": favorites.pages,
                    "per_page": per_page,
                    "total": favorites.total,
                },
            }
        )

    except Exception as e:
        logging.error(f"Errore nel caricamento preferiti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@favorites_bp.route("/api/favorites/<int:article_id>", methods=["POST"])
@login_required
def add_favorite(article_id):
    """Aggiungi un articolo ai preferiti"""
    try:
        article = Article.query.filter_by(id=article_id, published=True).first()
        if not article:
            return jsonify({"success": False, "message": "Articolo non trovato"}), 404

        existing_favorite = Favorite.query.filter_by(
            user_id=current_user.id, article_id=article_id
        ).first()

        if existing_favorite:
            return (
                jsonify({"success": False, "message": "Articolo già nei preferiti"}),
                400,
            )

        favorite = Favorite(user_id=current_user.id, article_id=article_id)
        db.session.add(favorite)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Articolo aggiunto ai preferiti",
                    "favorite": favorite.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nell'aggiunta ai preferiti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@favorites_bp.route("/api/favorites/<int:article_id>", methods=["DELETE"])
@login_required
def remove_favorite(article_id):
    """Rimuovi un articolo dai preferiti"""
    try:
        favorite = Favorite.query.filter_by(
            user_id=current_user.id, article_id=article_id
        ).first()

        if not favorite:
            return (
                jsonify({"success": False, "message": "Articolo non nei preferiti"}),
                404,
            )

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"success": True, "message": "Articolo rimosso dai preferiti"})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella rimozione dai preferiti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@favorites_bp.route("/api/favorites/<int:article_id>/check", methods=["GET"])
@login_required
def check_favorite(article_id):
    """Verifica se un articolo è nei preferiti"""
    try:
        favorite = Favorite.query.filter_by(
            user_id=current_user.id, article_id=article_id
        ).first()

        return jsonify({"success": True, "is_favorite": favorite is not None})

    except Exception as e:
        logging.error(f"Errore nella verifica preferiti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@favorites_bp.route("/api/favorites/toggle/<int:article_id>", methods=["POST"])
@login_required
def toggle_favorite(article_id):
    """Aggiungi/rimuovi un articolo dai preferiti"""
    try:
        article = Article.query.filter_by(id=article_id, published=True).first()
        if not article:
            return jsonify({"success": False, "message": "Articolo non trovato"}), 404

        favorite = Favorite.query.filter_by(
            user_id=current_user.id, article_id=article_id
        ).first()

        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            return jsonify(
                {
                    "success": True,
                    "message": "Articolo rimosso dai preferiti",
                    "is_favorite": False,
                }
            )
        else:
            favorite = Favorite(user_id=current_user.id, article_id=article_id)
            db.session.add(favorite)
            db.session.commit()
            return jsonify(
                {
                    "success": True,
                    "message": "Articolo aggiunto ai preferiti",
                    "is_favorite": True,
                    "favorite": favorite.to_dict(),
                }
            )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nel toggle preferiti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500
