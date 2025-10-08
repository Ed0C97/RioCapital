# RioCapitalBlog-backend/src/routes/comments.py

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from src.models.comment import Comment
from src.models.article import Article
from src.models.user import User
from src.extensions import db
from src.middleware.auth import admin_required
import logging

comments_bp = Blueprint("comments", __name__)


@comments_bp.route("/api/comments/article/<int:article_id>", methods=["GET"])
def get_article_comments(article_id):
    """Ottieni commenti di un articolo (solo approvati per utenti normali)"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)

        query = Comment.query.filter_by(article_id=article_id, parent_id=None)

        if not (current_user.is_authenticated and current_user.role == "admin"):
            query = query.filter_by(status="approved")

        comments = query.order_by(desc(Comment.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "success": True,
                "comments": [comment.to_dict() for comment in comments.items],
                "pagination": {
                    "page": page,
                    "pages": comments.pages,
                    "per_page": per_page,
                    "total": comments.total,
                },
            }
        )

    except Exception as e:
        logging.error(f"Errore nel caricamento commenti: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments", methods=["POST"])
@login_required
def create_comment():
    """Crea un nuovo commento"""
    try:
        data = request.get_json()

        if not data or not data.get("content") or not data.get("article_id"):
            return jsonify({"success": False, "message": "Dati mancanti"}), 400

        article = Article.query.get(data["article_id"])
        if not article:
            return jsonify({"success": False, "message": "Articolo non trovato"}), 404

        parent_id = data.get("parent_id")
        if parent_id:
            parent_comment = Comment.query.get(parent_id)
            if not parent_comment or parent_comment.article_id != data["article_id"]:
                return (
                    jsonify({"success": False, "message": "Commento padre non valido"}),
                    400,
                )

        comment = Comment(
            content=data["content"].strip(),
            article_id=data["article_id"],
            user_id=current_user.id,
            parent_id=parent_id,
            status="pending",
        )

        db.session.add(comment)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Commento inviato per moderazione",
                    "comment": comment.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella creazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>", methods=["PUT"])
@login_required
def update_comment(comment_id):
    """Aggiorna un commento (solo il proprietario)"""
    try:
        comment = Comment.query.get_or_404(comment_id)

        if comment.user_id != current_user.id:
            return jsonify({"success": False, "message": "Non autorizzato"}), 403

        data = request.get_json()
        if not data or not data.get("content"):
            return jsonify({"success": False, "message": "Contenuto mancante"}), 400

        comment.content = data["content"].strip()
        comment.status = "pending"

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Commento aggiornato",
                "comment": comment.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nell'aggiornamento commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>", methods=["DELETE"])
@login_required
def delete_comment(comment_id):
    """Elimina un commento (proprietario o admin)"""
    try:
        comment = Comment.query.get_or_404(comment_id)

        if comment.user_id != current_user.id and current_user.role != "admin":
            return jsonify({"success": False, "message": "Non autorizzato"}), 403

        db.session.delete(comment)
        db.session.commit()

        return jsonify({"success": True, "message": "Commento eliminato"})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nell'eliminazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>/report", methods=["POST"])
@login_required
def report_comment(comment_id):
    """Segnala un commento"""
    try:
        comment = Comment.query.get_or_404(comment_id)
        comment.reported = True

        db.session.commit()

        return jsonify({"success": True, "message": "Commento segnalato"})

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella segnalazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/moderate", methods=["GET"])
@admin_required
def get_comments_for_moderation():
    """Ottieni commenti per moderazione"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 50, type=int), 100)
        status = request.args.get("status", "all")

        query = Comment.query.join(User).join(Article)

        if status != "all":
            query = query.filter(Comment.status == status)

        comments = query.order_by(desc(Comment.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return jsonify(
            {
                "success": True,
                "comments": [comment.to_dict() for comment in comments.items],
                "pagination": {
                    "page": page,
                    "pages": comments.pages,
                    "per_page": per_page,
                    "total": comments.total,
                },
            }
        )

    except Exception as e:
        logging.error(f"Errore nel caricamento commenti per moderazione: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/<int:comment_id>/moderate", methods=["PATCH"])
@admin_required
def moderate_comment(comment_id):
    """Modera un commento"""
    try:
        comment = Comment.query.get_or_404(comment_id)
        data = request.get_json()

        action = data.get("action")
        reason = data.get("reason", "")

        if action == "approve":
            comment.status = "approved"
        elif action == "reject":
            comment.status = "rejected"
        elif action == "delete":
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"success": True, "message": "Commento eliminato"})
        else:
            return jsonify({"success": False, "message": "Azione non valida"}), 400

        if reason:
            comment.moderation_reason = reason

        db.session.commit()

        return jsonify(
            {"success": True, "message": f"Commento {action}", "status": comment.status}
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella moderazione commento: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500


@comments_bp.route("/api/comments/moderate-bulk", methods=["PATCH"])
@admin_required
def moderate_comments_bulk():
    """Modera più commenti contemporaneamente"""
    try:
        data = request.get_json()
        comment_ids = data.get("comment_ids", [])
        action = data.get("action")
        reason = data.get("reason", "")

        if not comment_ids or not action:
            return jsonify({"success": False, "message": "Dati mancanti"}), 400

        comments = Comment.query.filter(Comment.id.in_(comment_ids)).all()

        for comment in comments:
            if action == "approve":
                comment.status = "approved"
            elif action == "reject":
                comment.status = "rejected"
            elif action == "delete":
                db.session.delete(comment)
                continue

            if reason:
                comment.moderation_reason = reason

        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": f"{len(comment_ids)} commenti processati",
                "status": (
                    "approved"
                    if action == "approve"
                    else "rejected"
                    if action == "reject"
                    else "deleted"
                ),
            }
        )

    except Exception as e:
        db.session.rollback()
        logging.error(f"Errore nella moderazione bulk: {e}")
        return jsonify({"success": False, "message": "Errore interno del server"}), 500
