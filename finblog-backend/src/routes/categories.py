from flask import Blueprint, request, jsonify, session
from src.models.category import Category
from src.extensions import db
from src.routes.auth import login_required, author_required
import re

categories_bp = Blueprint('categories', __name__)

def create_slug(name):
    """Crea uno slug dal nome della categoria"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        
        return jsonify({
            'categories': [category.to_dict() for category in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        return jsonify({'category': category.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories', methods=['POST'])
@author_required
def create_category():
    try:
        data = request.get_json()
        
        # Validazione dati
        if not data.get('name'):
            return jsonify({'error': 'Nome della categoria è obbligatorio'}), 400
        
        # Crea lo slug
        slug = create_slug(data['name'])
        
        # Verifica che il nome e lo slug non esistano già
        if Category.query.filter_by(name=data['name']).first():
            return jsonify({'error': 'Categoria con questo nome già esistente'}), 400
        
        if Category.query.filter_by(slug=slug).first():
            return jsonify({'error': 'Slug della categoria già esistente'}), 400
        
        # Crea la categoria
        category = Category(
            name=data['name'],
            slug=slug,
            description=data.get('description', ''),
            color=data.get('color', '#007BFF'),
            created_by=session['user_id']
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Categoria creata con successo',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
@author_required
def update_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        
        # Aggiorna i campi
        if 'name' in data:
            # Verifica che il nuovo nome non esista già
            existing = Category.query.filter_by(name=data['name']).first()
            if existing and existing.id != category_id:
                return jsonify({'error': 'Categoria con questo nome già esistente'}), 400
            
            category.name = data['name']
            category.slug = create_slug(data['name'])
        
        if 'description' in data:
            category.description = data['description']
        
        if 'color' in data:
            category.color = data['color']
        
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Categoria aggiornata con successo',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@author_required
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        # Verifica se ci sono articoli associati a questa categoria
        from src.models.article import Article
        articles_count = Article.query.filter_by(category_id=category_id).count()
        
        if articles_count > 0:
            return jsonify({
                'error': f'Impossibile eliminare la categoria: ci sono {articles_count} articoli associati'
            }), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Categoria eliminata con successo'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@categories_bp.route('/categories/<slug>', methods=['GET'])
def get_category_by_slug(slug):
    try:
        category = Category.query.filter_by(slug=slug, is_active=True).first_or_404()
        
        return jsonify({'category': category.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

