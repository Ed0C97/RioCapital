# RioCapitalBlog-backend/src/main.py

import os
import click
from flask import Flask, send_from_directory, Blueprint
from flask.cli import with_appcontext
from flask_cors import CORS

from src.extensions import db
from src.models.user import User
from src.models.article import Article
from src.models.category import Category
from src.models.comment import Comment
from src.models.donation import Donation as NewDonation
from src.models.favorite import ArticleFavorite
from src.models.like import ArticleLike
from src.models.share import Share
from src.models.newsletter import NewsletterSubscriber, NotificationPreference
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

app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

app.config['MAX_CONTENT_LENGTH'] = 26 * 1024 * 1024

CORS(app, resources={r"/api/*": {"origins": "*"},
                     r"/apiauth/*": {"origins": "*"}},
     supports_credentials=True)

@click.command(name='create-admin')
@with_appcontext
def create_admin():
    """Crea l'utente amministratore di default."""
    if User.query.filter_by(role='admin').first():
        print('Un utente amministratore esiste già.')
        return

    username = click.prompt('Inserisci username per l-admin', default='admin')
    email = click.prompt('Inserisci email per l-admin', default='admin@example.com')
    password = click.prompt('Inserisci password per l-admin', hide_input=True, confirmation_prompt=True)

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

app.cli.add_command(create_admin)

frontend_bp = Blueprint('frontend', __name__,
                        static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'RioCapitalBlog-frontend',
                                                   'dist'),
                        static_url_path='/')

@frontend_bp.route('/', defaults={'path': 'index.html'})
@frontend_bp.route('/<path:path>')
def serve_frontend(path):
    static_folder = frontend_bp.static_folder
    if path != "" and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/apiauth')
app.register_blueprint(articles_bp, url_prefix='/api')
app.register_blueprint(categories_bp, url_prefix='/api')
app.register_blueprint(newsletter_bp, url_prefix='/api')
app.register_blueprint(contact_bp, url_prefix='/api')
app.register_blueprint(comments_bp, url_prefix='/api')
app.register_blueprint(favorites_bp, url_prefix='/api')
app.register_blueprint(donations_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(filters_bp, url_prefix='/api')

app.register_blueprint(frontend_bp)

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'RioCapitalBlog.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

    if Category.query.count() == 0:
        admin_user = User.query.filter_by(role='admin').first()
        if admin_user:
            default_categories = [
                {'name': 'Investimenti', 'description': 'Articoli su investimenti e strategie finanziarie',
                 'color': '#28A745'},
                {'name': 'Mercati', 'description': 'Analisi dei mercati finanziari', 'color': '#007BFF'},
                {'name': 'Criptovalute', 'description': 'News e analisi sulle criptovalute', 'color': '#FFC107'},
                {'name': 'Economia', 'description': 'Notizie e analisi economiche', 'color': '#DC3545'},
                {'name': 'Finanza Personale', 'description': 'Consigli per la gestione delle finanze personali',
                 'color': '#6F42C1'}
            ]
            for cat_data in default_categories:
                slug = cat_data['name'].lower().replace(' ', '-')
                category = Category(
                    name=cat_data['name'],
                    slug=slug,
                    description=cat_data['description'],
                    color=cat_data['color'],
                    created_by=admin_user.id
                )
                db.session.add(category)
            db.session.commit()
            print("Categorie di default create con successo.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
