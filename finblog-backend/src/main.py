import os
import click
from flask import Flask, send_from_directory, Blueprint
from flask.cli import with_appcontext
from flask_cors import CORS

# Importa l'estensione db
from src.extensions import db

# Importa i modelli (devono essere tutti importati qui perché db.create_all() li veda)
from src.models.user import User
from src.models.article import Article
from src.models.category import Category
from src.models.comment import Comment
from src.models.donation import Donation as NewDonation
from src.models.favorite import ArticleFavorite
from src.models.like import ArticleLike
from src.models.share import Share
from src.models.newsletter import NewsletterSubscriber, NotificationPreference

# Importa i blueprint
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

# Inizializzazione dell'app Flask
# Il static_folder ora punta alla cartella 'dist' del frontend per il deployment
app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

app.config['MAX_CONTENT_LENGTH'] = 26 * 1024 * 1024

# Configurazione CORS
CORS(app, resources={r"/api/*": {"origins": "*"},
                     r"/apiauth/*": {"origins": "*"}},
     supports_credentials=True)


# --- NUOVO COMANDO PER CREARE L'ADMIN ---
@click.command(name='create-admin')
@with_appcontext
def create_admin():
    """Crea l'utente amministratore di default."""
    if User.query.filter_by(role='admin').first():
        print('Un utente amministratore esiste già.')
        return

    # Se vuoi chiedere i dati da terminale (più sicuro)
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


# Aggiungi il comando all'interfaccia a riga di comando di Flask
app.cli.add_command(create_admin)

# --- BLUEPRINT PER SERVIRE IL FRONTEND REACT ---
frontend_bp = Blueprint('frontend', __name__,
                        static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), 'finblog-frontend',
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


# Registra i blueprint API PRIMA
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

# Registra il blueprint del frontend PER ULTIMO
app.register_blueprint(frontend_bp)

# Configurazione database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'finblog.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Inizializzazione del database e creazione delle categorie di default
with app.app_context():
    db.create_all()

    # Crea categorie di default se non esistono e se esiste l'utente admin (ID 1)
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
                    created_by=admin_user.id  # Usa l'ID dell'admin trovato
                )
                db.session.add(category)
            db.session.commit()
            print("Categorie di default create con successo.")

# Avvio del server di sviluppo
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)