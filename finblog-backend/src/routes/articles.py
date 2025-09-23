from flask import Blueprint, request, jsonify, session
from datetime import datetime
import re

# CORREGGI QUESTI IMPORT
from src.models.article import Article
from src.models.like import ArticleLike        # <-- Nome corretto
from src.models.favorite import ArticleFavorite  # <-- Nome corretto
from src.models.comment import Comment  # <-- Importa Comment dal suo file!
from src.models.category import Category
from src.models.user import User

from src.extensions import db
from src.routes.auth import login_required, author_required

articles_bp = Blueprint('articles', __name__)

def create_slug(title):
    """Crea uno slug dall'titolo dell'articolo"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')


@articles_bp.route('/articles', methods=['GET'])
def get_articles():
    try:
        # Parametri di paginazione e filtro esistenti
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category_id = request.args.get('category_id', type=int)
        author_id = request.args.get('author_id', type=int)
        search = request.args.get('search', '')
        published_only = request.args.get('published', 'true').lower() == 'true'
        exclude_id = request.args.get('exclude_id', type=int)

        # Aggiungiamo la lettura del parametro 'category_slug'
        category_slug = request.args.get('category_slug', type=str)

        query = Article.query

        if exclude_id:
            query = query.filter(Article.id != exclude_id)

        # Applica i filtri
        if published_only:
            query = query.filter(Article.published == True)

        if category_id:
            query = query.filter(Article.category_id == category_id)

        # AGGIUNGIAMO LA NUOVA LOGICA DI FILTRO PER SLUG
        if category_slug:
            # Uniamo (JOIN) la tabella Article con Category per poter filtrare
            # sulla colonna 'slug' della tabella Category
            query = query.join(Category).filter(Category.slug == category_slug)

        if author_id:
            query = query.filter(Article.author_id == author_id)

        if search:
            query = query.filter(
                Article.title.contains(search) |
                Article.content.contains(search) |
                Article.excerpt.contains(search)
            )

        # Ordina i risultati (più recenti prima)
        query = query.order_by(Article.created_at.desc())

        # Esegui la paginazione
        articles_pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # Prepara la risposta JSON
        return jsonify({
            'articles': [article.to_dict() for article in articles_pagination.items],
            'total': articles_pagination.total,
            'pages': articles_pagination.pages,
            'current_page': page,
            'per_page': per_page
        }), 200

    except Exception as e:
        # È buona pratica loggare l'errore per il debug
        print(f"Errore in get_articles: {e}")
        return jsonify({'error': 'Si è verificato un errore interno'}), 500

@articles_bp.route('/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        
        # Incrementa il contatore delle visualizzazioni
        article.views_count += 1
        db.session.commit()
        
        # Ottieni i commenti
        comments = Comment.query.filter_by(article_id=article_id).order_by(Comment.created_at.desc()).all()
        
        article_data = article.to_dict()
        article_data['comments'] = [comment.to_dict() for comment in comments]
        
        return jsonify({'article': article_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/articles/<string:slug>', methods=['GET'])
def get_article_by_slug(slug):
    try:
        article = Article.query.filter_by(slug=slug).first_or_404()

        # Incrementa il contatore delle visualizzazioni
        article.views_count += 1
        db.session.commit()

        # Ottieni i commenti
        comments = Comment.query.filter_by(article_id=article.id).order_by(Comment.created_at.desc()).all()

        article_data = article.to_dict()
        article_data['comments'] = [comment.to_dict() for comment in comments]

        return jsonify({'article': article_data}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles', methods=['POST'])
@author_required
def create_article():
    try:
        data = request.get_json()
        title = data.get('title')

        # Validazione dati
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Titolo e contenuto sono obbligatori'}), 400
        
        if not data.get('category_id'):
            return jsonify({'error': 'Categoria è obbligatoria'}), 400

        if not title:
            return jsonify({'error': 'Il titolo è obbligatorio'}), 400

        category = Category.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Categoria non trovata'}), 404

        new_slug = create_slug(title)
        existing_slug = Article.query.filter(Article.slug.startswith(new_slug)).count()
        if existing_slug > 0:
            # Se esiste, rendilo unico aggiungendo un numero
            new_slug = f"{new_slug}-{existing_slug + 1}"

        # Crea l'articolo
        article = Article(
            title=title,
            slug=new_slug,  # <-- SALVA LO SLUG
            content=data['content'],
            excerpt=data.get('excerpt', ''),
            image_url=data.get('image_url', ''),
            author_id=session['user_id'],
            category_id=data['category_id'],
            published=data.get('published', False)
        )
        
        db.session.add(article)
        db.session.commit()
        
        return jsonify({
            'message': 'Articolo creato con successo',
            'article': article.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Errore in create_article: {e}")
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles/<int:article_id>', methods=['PUT'])
@author_required
def update_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        
        # Verifica che l'utente sia l'autore o un admin
        user = User.query.get(session['user_id'])
        if article.author_id != session['user_id'] and not user.is_admin():
            return jsonify({'error': 'Non autorizzato a modificare questo articolo'}), 403
        
        data = request.get_json()
        
        # Aggiorna i campi
        if 'title' in data:
            article.title = data['title']
        if 'content' in data:
            article.content = data['content']
        if 'excerpt' in data:
            article.excerpt = data['excerpt']
        if 'image_url' in data:
            article.image_url = data['image_url']
        if 'category_id' in data:
            category = Category.query.get(data['category_id'])
            if not category:
                return jsonify({'error': 'Categoria non trovata'}), 404
            article.category_id = data['category_id']
        if 'published' in data:
            article.published = data['published']
        
        article.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Articolo aggiornato con successo',
            'article': article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles/<int:article_id>', methods=['DELETE'])
@author_required
def delete_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        
        # Verifica che l'utente sia l'autore o un admin
        user = User.query.get(session['user_id'])
        if article.author_id != session['user_id'] and not user.is_admin():
            return jsonify({'error': 'Non autorizzato a eliminare questo articolo'}), 403
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({'message': 'Articolo eliminato con successo'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles/<int:article_id>/like', methods=['POST'])
@login_required
def like_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        user_id = session['user_id']
        
        # Verifica se l'utente ha già messo like
        existing_like = ArticleLike.query.filter_by(
            article_id=article_id, 
            user_id=user_id
        ).first()
        
        if existing_like:
            # Rimuovi il like
            db.session.delete(existing_like)
            article.likes_count -= 1
            liked = False
        else:
            # Aggiungi il like
            like = ArticleLike(article_id=article_id, user_id=user_id)
            db.session.add(like)
            article.likes_count += 1
            liked = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Like aggiornato con successo',
            'liked': liked,
            'likes_count': article.likes_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles/<int:article_id>/favorite', methods=['POST'])
@login_required
def favorite_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        user_id = session['user_id']
        
        # Verifica se l'utente ha già salvato nei preferiti
        existing_favorite = ArticleFavorite.query.filter_by(
            article_id=article_id, 
            user_id=user_id
        ).first()
        
        if existing_favorite:
            # Rimuovi dai preferiti
            db.session.delete(existing_favorite)
            favorited = False
        else:
            # Aggiungi ai preferiti
            favorite = ArticleFavorite(article_id=article_id, user_id=user_id)
            db.session.add(favorite)
            favorited = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferiti aggiornati con successo',
            'favorited': favorited
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/articles/<int:article_id>/comments', methods=['POST'])
@login_required
def add_comment(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'error': 'Contenuto del commento è obbligatorio'}), 400
        
        comment = Comment(
            content=data['content'],
            article_id=article_id,
            user_id=session['user_id']
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Commento aggiunto con successo',
            'comment': comment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/my-articles', methods=['GET'])
@author_required
def get_my_articles():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        articles = Article.query.filter_by(author_id=session['user_id']).order_by(
            Article.created_at.desc()
        ).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'articles': [article.to_dict() for article in articles.items],
            'total': articles.total,
            'pages': articles.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/favorites', methods=['GET'])
@login_required
def get_favorite_articles():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        favorites = db.session.query(Article).join(ArticleFavorite).filter(
            ArticleFavorite.user_id == session['user_id']
        ).order_by(ArticleFavorite.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'articles': [article.to_dict() for article in favorites.items],
            'total': favorites.total,
            'pages': favorites.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

