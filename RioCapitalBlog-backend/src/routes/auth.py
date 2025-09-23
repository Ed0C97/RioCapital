# RioCapitalBlog-backend/src/routes/auth.py

from flask import Blueprint, request, jsonify, session
from src.models.user import User
from src.extensions import db
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login richiesto'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login richiesto'}), 401

        user = User.query.get(session['user_id'])
        if not user or not user.is_admin():
            return jsonify({'error': 'Accesso negato: privilegi amministratore richiesti'}), 403
        return f(*args, **kwargs)
    return decorated_function

def author_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login richiesto'}), 401

        user = User.query.get(session['user_id'])
        if not user or not user.can_write_articles():
            return jsonify({'error': 'Accesso negato: privilegi di scrittura richiesti'}), 403
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email e password sono obbligatori'}), 400

        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username già esistente'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email già registrata'}), 400

        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=data.get('role', 'reader')
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'message': 'Registrazione completata con successo',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username e password sono obbligatori'}), 400

        user = User.query.filter_by(username=data['username']).first()

        if user and user.check_password(data['password']) and user.is_active:
            session['user_id'] = user.id
            return jsonify({
                'message': 'Login effettuato con successo',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Credenziali non valide'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout effettuato con successo'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    try:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({'user': user.to_dict()}), 200
        else:
            return jsonify({'error': 'Utente non trovato'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    try:
        data = request.get_json()

        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Password attuale e nuova password sono obbligatorie'}), 400

        user = User.query.get(session['user_id'])

        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Password attuale non corretta'}), 400

        user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({'message': 'Password cambiata con successo'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
