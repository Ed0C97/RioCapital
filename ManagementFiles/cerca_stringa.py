# cerca_stringa.py

import os
import mmap
from concurrent.futures import ProcessPoolExecutor, as_completed

# Percorso fisso del progetto principale
PROJECT_ROOT = r"F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog"

def cerca_in_file(percorso_file, stringa_bytes):
    try:
        with open(percorso_file, "rb", 0) as f:
            mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            if mm.find(stringa_bytes) != -1:
                return percorso_file
    except Exception:
        return None
    return None

def cerca_stringa_in_file(directory_radice, stringa_da_cercare, workers=8):
    stringa_bytes = stringa_da_cercare.encode("utf-8")

    file_list = []
    for dirpath, _, nomi_file in os.walk(directory_radice):
        for nome_file in nomi_file:
            file_list.append(os.path.join(dirpath, nome_file))

    print(f"Trovati {len(file_list)} file da analizzare...")

    risultati = []
    with ProcessPoolExecutor(max_workers=workers) as executor:
        future_to_file = {executor.submit(cerca_in_file, f, stringa_bytes): f for f in file_list}
        for future in as_completed(future_to_file):
            result = future.result()
            if result:
                risultati.append(result)
                print(f"✅ Stringa trovata in: {result}")

    return risultati

if __name__ == "__main__":
    stringa_obiettivo = "index.css"

    print(
        f"🔍 Ricerca della stringa '{stringa_obiettivo}' "
        f"nella directory '{PROJECT_ROOT}' e sottodirectory..."
    )

    trovati = cerca_stringa_in_file(
        PROJECT_ROOT,
        stringa_obiettivo,
        workers=os.cpu_count()
    )

    print("\n📌 Ricerca completata.")
    if trovati:
        print(f"👉 Stringa trovata in {len(trovati)} file:")
        for f in trovati:
            print("   -", f)
    else:
        print("❌ Nessun file trovato.")
