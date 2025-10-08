# RioCapitalBlog-backend/src/routes/user.py

from flask import Blueprint, jsonify, request, session  # <-- MODIFICA QUESTA RIGA
from src.routes.auth import login_required
from src.models.user import User
from src.extensions import db
from src.models.article import Article
from src.models.like import ArticleLike

user_bp = Blueprint("user", __name__)


@user_bp.route("/", methods=["GET"])  # URL: GET /api/users/
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@user_bp.route("/", methods=["POST"])  # URL: POST /api/users/
def create_user():
    data = request.json
    user = User(username=data["username"], email=data["email"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@user_bp.route("/<int:user_id>", methods=["GET"])  # URL: GET /api/users/1
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@user_bp.route("/<int:user_id>", methods=["PUT"])  # URL: PUT /api/users/1
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    print(f"Dati ricevuti per l'utente {user_id}: {data}")
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.bio = data.get("bio", user.bio)
    user.linkedin_url = data.get("linkedin_url", user.linkedin_url)
    db.session.commit()
    print(f"Utente {user_id} aggiornato con successo.")
    return jsonify(user.to_dict())


@user_bp.route("/<int:user_id>", methods=["DELETE"])  # URL: DELETE /api/users/1
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204


@user_bp.route("/me/likes", methods=["GET"])
@login_required
def get_liked_articles():
    try:
        user_id = session["user_id"]

        # Query per trovare tutti gli articoli a cui l'utente ha messo "mi piace"
        liked_articles = (
            db.session.query(Article)
            .join(ArticleLike)
            .filter(ArticleLike.user_id == user_id)
            .order_by(ArticleLike.created_at.desc())
            .all()
        )

        return (
            jsonify({"articles": [article.to_dict() for article in liked_articles]}),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
