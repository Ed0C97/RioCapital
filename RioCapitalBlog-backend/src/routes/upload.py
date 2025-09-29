# RioCapitalBlog-backend/src/routes/upload.py

import os
from flask import Blueprint, request, jsonify, current_app
from src.routes.auth import login_required
from src.utils.convert_img import convert_and_save_webp

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('/image', methods=['POST'])  # URL: POST /api/upload/image
@login_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Nessun file immagine trovato'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'Nessun file selezionato'}), 400

    if file and allowed_file(file.filename):
        try:
            upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            file_url = convert_and_save_webp(file, upload_folder)

            return jsonify({'url': file_url}), 200

        except Exception as e:
            return jsonify({'error': f'Impossibile elaborare il file: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Tipo di file non consentito'}), 400