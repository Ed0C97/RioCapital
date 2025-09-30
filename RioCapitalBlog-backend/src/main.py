# src/main.py

import os
import click
from flask import Flask, send_from_directory, Blueprint
from flask.cli import with_appcontext
from flask_cors import CORS
from flask_migrate import Migrate
import click
from authlib.integrations.flask_client import OAuth # <-- 1. AGGIUNGI IMPORT

# Importa i modelli e le estensioni
from src.extensions import db, oauth
from src.models.user import User
from src.models.article import Article
from src.models.category import Category
from src.models.comment import Comment
from src.models.donation import Donation as NewDonation
from src.models.favorite import ArticleFavorite
from src.models.like import ArticleLike
from src.models.share import Share
from src.models.newsletter import NewsletterSubscriber, NotificationPreference

# Importa i blueprint delle rotte
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.articles import articles_bp
from src.routes.categories import categories_bp
from src.routes.newsletter import newsletter_bp
from src.routes.contact import contact_bp
from src.routes.comments import comments_bp
from src.routes.favorites import favorites_bp
from src.routes.donations import donations_bp
from src.routes.analytics import analytics_bp
from src.routes.upload import upload_bp
from src.routes.filters import filters_bp
from src.routes.content import content_bp


def create_app():
    """Application Factory Function"""
    app = Flask(__name__)

    # --- Configurazione dell'Applicazione ---
    app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
    app.config['MAX_CONTENT_LENGTH'] = 26 * 1024 * 1024
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'RioCapitalBlog.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['GOOGLE_CLIENT_ID'] = '157706702557-furil8otnbp3r5841j9lhjgk3vk7837j.apps.googleusercontent.com'
    app.config['GOOGLE_CLIENT_SECRET'] = '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'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # impedisce l'accesso al cookie da JS

    # --- Inizializzazione delle Estensioni ---
    db.init_app(app)
    oauth.init_app(app)
    Migrate(app, db)
    CORS(app, origins="http://localhost:5173", supports_credentials=True)

    # --- Registrazione Provider OAuth ---
    oauth.register(
        name='google',
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

    # --- Definizione e Registrazione Blueprint del Frontend ---
    frontend_bp = Blueprint('frontend', __name__,
                            static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                                       'RioCapitalBlog-frontend', 'dist'),
                            static_url_path='/')

    @frontend_bp.route('/', defaults={'path': 'index.html'})
    @frontend_bp.route('/<path:path>')
    def serve_frontend(path):
        static_folder = frontend_bp.static_folder
        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        else:
            return send_from_directory(static_folder, 'index.html')

    app.register_blueprint(frontend_bp)

    # --- Registrazione Blueprint delle API ---
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(filters_bp, url_prefix='/api/filters')
    app.register_blueprint(newsletter_bp, url_prefix='/api/newsletter')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(content_bp, url_prefix='/api/content')

    # --- Registrazione Comandi CLI ---
    app.cli.add_command(create_admin)
    app.cli.add_command(seed_db)

    return app

@click.command(name='create-admin')
@click.argument('username')
@click.argument('email')
@click.argument('password')
@with_appcontext
def create_admin(username, email, password):
    """Crea l'utente amministratore con le credenziali fornite."""
    if User.query.filter_by(username=username).first():
        print(f'Un utente con username "{username}" esiste già.')
        return
    if User.query.filter_by(email=email).first():
        print(f'Un utente con email "{email}" esiste già.')
        return

    admin_user = User(
        username=username,
        email=email,
        role='admin',
        is_active=True
    )
    admin_user.set_password(password)
    db.session.add(admin_user)
    db.session.commit()
    print(f'Utente admin "{username}" creato con successo.')

@click.command(name='seed-db')
@with_appcontext
def seed_db():
    """Popola il database con le categorie di default."""
    if Category.query.count() == 0:
        admin_user = User.query.filter_by(role='admin').first()
        if admin_user:
            print("Creazione categorie di default...")
            default_categories = [
                {
                    'name': 'Personal Finance',
                    'description': 'Tips and strategies for managing personal finances',
                    'color': '#6F42C1'
                },
                {
                    'name': 'Investments',
                    'description': 'Articles on investments and financial strategies',
                    'color': '#28A745'
                },
                {
                    'name': 'Alternative Thinking',
                    'description': 'Alternative perspectives and reflections on finance and economics',
                    'color': '#FFC107'
                }
            ]
            for cat_data in default_categories:
                slug = cat_data['name'].lower().replace(' ', '-')
                category = Category(name=cat_data['name'], slug=slug, description=cat_data['description'], color=cat_data['color'], created_by=admin_user.id)
                db.session.add(category)
            db.session.commit()
            print("Categorie di default create con successo.")
        else:
            print("Crea prima un utente admin con 'flask create-admin'.")
    else:
        print("Le categorie esistono già.")

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)