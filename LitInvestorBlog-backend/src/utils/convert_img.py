# LitInvestorBlog-backend/src/utils/convert_img.py

import os
from PIL import Image
from werkzeug.datastructures import FileStorage
from datetime import datetime

def convert_and_save_webp(file: FileStorage, upload_folder: str) -> str:
    """
    Prende un file immagine, lo converte in WebP, lo rinomina con un timestamp
    e lo salva nella cartella specificata.

    Args:
        file: L'oggetto file proveniente da request.files.
        upload_folder: Il percorso assoluto della cartella di destinazione.

    Returns:
        La URL pubblica del file salvato (es. /static/uploads/img_20251026123000.webp).

    Raises:
        Exception: Se si verifica un errore durante l'elaborazione.
    """
    try:

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        new_filename = f"img_{timestamp}.webp"

        save_path = os.path.join(upload_folder, new_filename)

        with Image.open(file.stream) as img:

            if img.mode != "RGB":
                img = img.convert("RGB")

            img.save(save_path, "webp", quality=80)

        public_url = f"/static/uploads/{new_filename}"

        return public_url

    except Exception as e:

        print(f"Errore in convert_and_save_webp: {e}")
        raise e
