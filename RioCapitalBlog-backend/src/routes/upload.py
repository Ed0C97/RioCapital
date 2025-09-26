# RioCapitalBlog-backend/src/routes/upload.py

import os
from flask import Blueprint, request, jsonify, current_app
from src.routes.auth import login_required

# --- MODIFICA 1: Importiamo la nostra nuova funzione ---
from src.utils.convert_img import convert_and_save_webp

upload_bp = Blueprint('upload', __name__)

# Manteniamo il tuo controllo sulle estensioni, è un'ottima idea
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload/image', methods=['POST'])
@login_required
def upload_image():
    # I tuoi controlli iniziali sono perfetti
    if 'image' not in request.files:
        return jsonify({'error': 'Nessun file immagine trovato'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'Nessun file selezionato'}), 400

    # Usiamo la tua funzione di validazione
    if file and allowed_file(file.filename):
        try:
            # Definiamo la cartella di destinazione come facevi tu
            upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            # --- MODIFICA 2: Sostituiamo tutta la logica di salvataggio ---
            # Chiamiamo la nostra funzione per fare tutto il lavoro:
            # conversione, rinomina e salvataggio.
            file_url = convert_and_save_webp(file, upload_folder)
            # -------------------------------------------------------------

            return jsonify({'url': file_url}), 200

        except Exception as e:
            # Se la nostra funzione fallisce, catturiamo l'errore qui
            return jsonify({'error': f'Impossibile elaborare il file: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Tipo di file non consentito'}), 400