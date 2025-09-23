import os
import re

# --- CONFIGURAZIONE ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OLD_NAME = 'Finblog'
# --- CORREZIONE APPLICATA QUI ---
NEW_NAME_FILESYSTEM = 'RioCapitalBlog'
EXCLUDED_ITEMS = { os.path.basename(__file__), 'node_modules', 'venv', '.venv', 'env', '.git', '.idea', '.vscode', '__pycache__', 'build', 'dist' }

def rename_filesystem_items():
    print("--- FASE 1: Inizio rinomina di file e cartelle (Bottom-Up) ---\n")
    # ... (il resto della logica di questo script è corretto e rimane invariato) ...
    for dirpath, dirnames, filenames in os.walk(ROOT_DIR, topdown=False):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_ITEMS]
        filenames[:] = [f for f in filenames if f not in EXCLUDED_ITEMS]
        for filename in filenames:
            if OLD_NAME.lower() in filename.lower():
                old_filepath = os.path.join(dirpath, filename)
                new_filename = re.sub(OLD_NAME, NEW_NAME_FILESYSTEM, filename, flags=re.IGNORECASE)
                new_filepath = os.path.join(dirpath, new_filename)
                print(f"Rinomino file: {os.path.relpath(old_filepath, ROOT_DIR)} -> {os.path.relpath(new_filepath, ROOT_DIR)}")
                try:
                    os.rename(old_filepath, new_filepath)
                except OSError as e:
                    print(f"  -> ERRORE: {e}")
        for dirname in dirnames:
            if OLD_NAME.lower() in dirname.lower():
                old_dirpath = os.path.join(dirpath, dirname)
                new_dirname = re.sub(OLD_NAME, NEW_NAME_FILESYSTEM, dirname, flags=re.IGNORECASE)
                new_dirpath = os.path.join(dirpath, new_dirname)
                print(f"Rinomino cartella: {os.path.relpath(old_dirpath, ROOT_DIR)} -> {os.path.relpath(new_dirpath, ROOT_DIR)}")
                try:
                    os.rename(old_dirpath, new_dirpath)
                except OSError as e:
                    print(f"  -> ERRORE: {e}")
    print("\n--- FASE 1: Rinomina completata. ---")

if __name__ == "__main__":
    print("ATTENZIONE: Questo script rinominerà file e cartelle in modo permanente.")
    print(f"Cerca '{OLD_NAME}' e sostituisce con '{NEW_NAME_FILESYSTEM}'.")
    confirm = input("Hai fatto un backup? Digita 'si' per procedere con la FASE 1: ")
    if confirm.lower() == 'si':
        rename_filesystem_items()
    else:
        print("Operazione annullata.")
