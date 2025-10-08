# LitInvestorBlog-backend/src/routes/articles.py

from flask import Blueprint, request, jsonify, session
from sqlalchemy import or_, extract
from datetime import datetime
import re
from sqlalchemy.exc import IntegrityError

from src.models.article import Article
from src.models.like import ArticleLike
from src.models.favorite import ArticleFavorite
from src.models.comment import Comment
from src.models.category import Category
from src.models.user import User

from src.extensions import db
from src.routes.auth import login_required, author_required

articles_bp = Blueprint("articles", __name__)

def create_slug(title):
    """Crea uno slug dall'titolo dell'articolo"""
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug.strip("-")

@articles_bp.route("/", methods=["GET"])
def get_articles():
    try:

        print("PARAMETRI RICEVUTI:", request.args)

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 12, type=int)
        category_slug = request.args.get("category_slug", type=str)
        author_id = request.args.get("author_id", type=int)
        year = request.args.get("year", type=int)
        month = request.args.get("month", type=int)
        exclude_id = request.args.get("exclude_id", type=int)
        search_query = request.args.get("q", type=str)

        query = Article.query.filter(Article.published.is_(True))

        if exclude_id:
            query = query.filter(Article.id != exclude_id)

        if search_query:

            print(f"FILTRO DI RICERCA ATTIVATO CON TERMINE: {search_query}")

            search_term = f"%{search_query}%"
            query = query.filter(
                or_(
                    Article.title.ilike(search_term),
                    Article.content.ilike(search_term),
                    Article.excerpt.ilike(search_term),
                )
            )

        if category_slug:
            query = query.join(Category).filter(Category.slug == category_slug)
        if author_id:
            query = query.filter(Article.author_id == author_id)
        if year:
            query = query.filter(extract("year", Article.created_at) == year)
            if month:
                query = query.filter(extract("month", Article.created_at) == month)

        paginated_articles = query.order_by(Article.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        return (
            jsonify(
                {
                    "articles": [
                        article.to_dict() for article in paginated_articles.items
                    ],
                    "total_articles": paginated_articles.total,
                    "total_pages": paginated_articles.pages,
                    "current_page": page,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Errore in get_articles: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@articles_bp.route("/<int:article_id>", methods=["GET"])
def get_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)

        article.views_count += 1
        db.session.commit()

        comments = (
            Comment.query.filter_by(article_id=article_id)
            .order_by(Comment.created_at.desc())
            .all()
        )

        article_data = article.to_dict()
        article_data["comments"] = [comment.to_dict() for comment in comments]

        return jsonify({"article": article_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/<string:slug>", methods=["GET"])
def get_article_by_slug(slug):
    try:
        article = Article.query.filter_by(slug=slug).first_or_404()

        article.views_count += 1
        db.session.commit()

        comments = (
            Comment.query.filter_by(article_id=article.id)
            .order_by(Comment.created_at.desc())
            .all()
        )

        article_data = article.to_dict()
        article_data["comments"] = [comment.to_dict() for comment in comments]

        return jsonify({"article": article_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/id/<int:article_id>", methods=["GET"])
def get_article_by_id(article_id):
    try:
        article = Article.query.get_or_404(article_id)

        article_data = article.to_dict()

        comments = (
            Comment.query.filter_by(article_id=article_id)
            .order_by(Comment.created_at.desc())
            .all()
        )
        article_data["comments"] = [comment.to_dict() for comment in comments]

        return jsonify({"article": article_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/", methods=["POST"])
@author_required
def create_article():
    try:
        data = request.get_json()
        title = data.get("title")

        if not data.get("title") or not data.get("content"):
            return jsonify({"error": "Titolo e contenuto sono obbligatori"}), 400
        if not data.get("category_id"):
            return jsonify({"error": "Categoria è obbligatoria"}), 400
        if not title:
            return jsonify({"error": "Il titolo è obbligatorio"}), 400
        category = Category.query.get(data["category_id"])
        if not category:
            return jsonify({"error": "Categoria non trovata"}), 404

        new_slug = create_slug(title)

        if Article.query.filter_by(slug=new_slug).first():

            timestamp = int(datetime.utcnow().timestamp())
            new_slug = f"{new_slug}-{timestamp}"

        article = Article(
            title=title,
            slug=new_slug,
            content=data["content"],
            excerpt=data.get("excerpt", ""),
            image_url=data.get("image_url", None),
            author_id=session["user_id"],
            category_id=data["category_id"],
            published=data.get("published", False),
            featured=data.get("featured", False),
            show_author_contacts=data.get("show_author_contacts", False),
        )

        db.session.add(article)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Articolo creato con successo",
                    "article": article.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        print(f"Errore in create_article: {e}")
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/<int:article_id>", methods=["PUT"])
@author_required
def update_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)

        user = User.query.get(session["user_id"])
        if article.author_id != session["user_id"] and not user.is_admin():
            return (
                jsonify({"error": "Non autorizzato a modificare questo articolo"}),
                403,
            )

        data = request.get_json()

        if "title" in data:
            article.title = data["title"]
        if "content" in data:
            article.content = data["content"]
        if "excerpt" in data:
            article.excerpt = data["excerpt"]
        if "image_url" in data:
            article.image_url = data["image_url"]
        if "category_id" in data:
            category = Category.query.get(data["category_id"])
            if not category:
                return jsonify({"error": "Categoria non trovata"}), 404
            article.category_id = data["category_id"]
        if "published" in data:
            article.published = data["published"]
        if "show_author_contacts" in data:
            article.show_author_contacts = data["show_author_contacts"]

        article.updated_at = datetime.utcnow()

        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Articolo aggiornato con successo",
                    "article": article.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/<int:article_id>", methods=["DELETE"])
@author_required
def delete_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)

        user = User.query.get(session["user_id"])
        if article.author_id != session["user_id"] and not user.is_admin():
            return (
                jsonify({"error": "Non autorizzato a eliminare questo articolo"}),
                403,
            )

        db.session.delete(article)
        db.session.commit()

        return jsonify({"message": "Articolo eliminato con successo"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/<int:article_id>/like", methods=["POST"])
@login_required
def like_article(article_id):
    user_id = session["user_id"]

    try:

        new_like = ArticleLike(user_id=user_id, article_id=article_id)
        db.session.add(new_like)
        db.session.commit()

        Article.query.filter_by(id=article_id).update(
            {"likes_count": Article.likes_count + 1}
        )
        db.session.commit()

        article = Article.query.get(article_id)
        return jsonify({"liked": True, "likes_count": article.likes_count}), 200

    except IntegrityError:

        db.session.rollback()

        like_to_delete = ArticleLike.query.filter_by(
            user_id=user_id, article_id=article_id
        ).first()
        if like_to_delete:
            db.session.delete(like_to_delete)
            Article.query.filter_by(id=article_id).update(
                {"likes_count": Article.likes_count - 1}
            )
            db.session.commit()

            article = Article.query.get(article_id)
            return jsonify({"liked": False, "likes_count": article.likes_count}), 200

        return jsonify({"error": "Impossibile trovare il like da rimuovere"}), 500

@articles_bp.route("/<int:article_id>/favorite", methods=["POST"])
@login_required
def favorite_article(article_id):
    try:
        Article.query.get_or_404(article_id)
        user_id = session["user_id"]

        existing_favorite = ArticleFavorite.query.filter_by(
            article_id=article_id, user_id=user_id
        ).first()

        if existing_favorite:
            db.session.delete(existing_favorite)
            favorited = False
        else:
            favorite = ArticleFavorite(article_id=article_id, user_id=user_id)
            db.session.add(favorite)
            favorited = True

        db.session.commit()

        return (
            jsonify(
                {"message": "Preferiti aggiornati con successo", "favorited": favorited}
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/<int:article_id>/comments", methods=["POST"])
@login_required
def add_comment(article_id):
    try:
        Article.query.get_or_404(article_id)
        data = request.get_json()

        if not data.get("content"):
            return jsonify({"error": "Contenuto del commento è obbligatorio"}), 400

        comment = Comment(
            content=data["content"], article_id=article_id, user_id=session["user_id"]
        )

        db.session.add(comment)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Commento aggiunto con successo",
                    "comment": comment.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/my-articles", methods=["GET"])
@author_required
def get_my_articles():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        articles = (
            Article.query.filter_by(author_id=session["user_id"])
            .order_by(Article.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return (
            jsonify(
                {
                    "articles": [article.to_dict() for article in articles.items],
                    "total": articles.total,
                    "pages": articles.pages,
                    "current_page": page,
                    "per_page": per_page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@articles_bp.route("/favorites", methods=["GET"])
@login_required
def get_favorite_articles():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        favorites = (
            db.session.query(Article)
            .join(ArticleFavorite)
            .filter(ArticleFavorite.user_id == session["user_id"])
            .order_by(ArticleFavorite.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        return (
            jsonify(
                {
                    "articles": [article.to_dict() for article in favorites.items],
                    "total": favorites.total,
                    "pages": favorites.pages,
                    "current_page": page,
                    "per_page": per_page,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
