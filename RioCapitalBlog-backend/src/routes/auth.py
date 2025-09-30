# RioCapitalBlog-backend/src/routes/auth.py

import os # <-- 1. AGGIUNGI QUESTO IMPORT
from flask import Blueprint, request, jsonify, session, url_for, redirect
from src.models.user import User
from src.extensions import db
from functools import wraps
from src.extensions import oauth # <-- IMPORTA DA EXTENSIONS
from urllib.parse import urlencode # <-- 1. AGGIUNGI QUESTO IMPORT

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

@auth_bp.route('/me', methods=['GET']) # URL finale: /api/auth/me
@login_required
def get_current_user():
    try:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({'user': user.to_dict()}), 200
        else:
            # Questo caso non dovrebbe accadere se @login_required funziona
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


@auth_bp.route('/google/login')
def google_login():
    # Chiediamo a Flask di generare l'URL
    redirect_uri = url_for('auth.google_callback', _external=True)

    # QUESTO PRINT CI DARÀ LA PROVA DEFINITIVA
    print("---------------------------------------------------------------")
    print(f"!!! URL GENERATO DA FLASK: {redirect_uri}")
    print("!!! QUESTO URL DEVE ESSERE IDENTICO A QUELLO IN GOOGLE CONSOLE")
    print("---------------------------------------------------------------")

    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/callback')
def google_callback():
    try:
        token = oauth.google.authorize_access_token()
        user_info = token.get('userinfo')

        if not user_info:
            # USA SEMPRE localhost
            return redirect('http://localhost:5173/login?error=oauth_failed')

        email = user_info.get('email')
        user = User.query.filter_by(email=email).first()

        if user:
            session['user_id'] = user.id
            session.modified = True
            # USA SEMPRE localhost
            return redirect('http://localhost:5173/')
        else:
            session['oauth_profile'] = {
                'email': email,
                'first_name': user_info.get('given_name', ''),
                'last_name': user_info.get('family_name', '')
            }
            session.modified = True
            # USA SEMPRE localhost
            return redirect('http://localhost:5173/complete-profile')

    except Exception as e:
        print(f"Errore nel callback di Google: {e}")
        # USA SEMPRE localhost
        return redirect('http://localhost:5173/login?error=oauth_generic_error')

    except Exception as e:
        print(f"Errore nel callback di Google: {e}")
        return redirect('http://localhost:5173/login?error=oauth_generic_error')

    except Exception as e:
        print(f"Errore nel callback di Google: {e}")
        return redirect('http://localhost:5173/login?error=oauth_generic_error')

    except Exception as e:
        print(f"Errore nel callback di Google: {e}")
        return redirect('http://localhost:5173/login?error=oauth_generic_error')


@auth_bp.route('/complete-oauth', methods=['POST'])
def complete_oauth_registration():
    print("--- Inizio richiesta /complete-oauth ---")
    try:
        if 'oauth_profile' not in session:
            print("ERRORE: 'oauth_profile' non trovato in sessione.")
            return jsonify({'error': 'Nessuna sessione OAuth in corso.'}), 400

        print(f"Step 1 OK: Trovato oauth_profile in sessione: {session['oauth_profile']}")

        data = request.get_json()
        username = data.get('username')

        if not username:
            print("ERRORE: Username non fornito nel corpo della richiesta.")
            return jsonify({'error': 'Username obbligatorio'}), 400

        print(f"Step 2 OK: Ricevuto username dal frontend: {username}")

        oauth_profile = session['oauth_profile']
        email = oauth_profile.get('email')

        # Controlli di sicurezza
        if User.query.filter_by(email=email).first():
            print(f"ERRORE: Email '{email}' già registrata.")
            return jsonify({'error': 'Email già registrata'}), 409
        if User.query.filter_by(username=username).first():
            print(f"ERRORE: Username '{username}' già in uso.")
            return jsonify({'error': 'Username già in uso'}), 409

        print("Step 3 OK: Controlli di unicità superati.")

        # Creazione del nuovo utente
        new_user = User(
            username=username,
            email=email,
            first_name=oauth_profile.get('first_name'),
            last_name=oauth_profile.get('last_name'),
        )
        random_password = os.urandom(16).hex()
        new_user.set_password(random_password)

        print(f"Step 4: Sto per aggiungere l'utente al database: {new_user.username}")
        db.session.add(new_user)
        db.session.commit()
        print("Step 4 OK: Utente salvato nel database con successo.")

        # Pulizia e login
        session.pop('oauth_profile', None)
        session['user_id'] = new_user.id
        print(f"Step 5 OK: Sessione pulita e login effettuato per user_id: {new_user.id}")

        return jsonify({'user': new_user.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        print(f"!!! ERRORE CRITICO in complete_oauth_registration: {e} !!!")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Errore interno del server'}), 500