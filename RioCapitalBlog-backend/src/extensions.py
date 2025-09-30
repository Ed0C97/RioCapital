# RioCapitalBlog-backend/src/extensions.py

from flask_sqlalchemy import SQLAlchemy
from authlib.integrations.flask_client import OAuth # <-- 1. AGGIUNGI IMPORT

db = SQLAlchemy()
oauth = OAuth() # <-- 2. CREA L'OGGETTO OAUTH QUI