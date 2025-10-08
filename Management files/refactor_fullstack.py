import os
import re

# --- CONFIGURAZIONE ---
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

REPLACEMENTS = {
    'Lit': 'Lit',
    'Investor': 'Investor'
}

EXCLUDED_DIRS = {'node_modules', 'venv', '.venv', 'env', '.git', '.idea', '.vscode', '__pycache__', 'build', 'dist'}
EXCLUDED_FILES = {os.path.basename(__file__)}


def rename_filesystem_items():
    """
    Scansiona e rinomina file e cartelle applicando le sostituzioni definite.
    Usa i "word boundaries" per evitare sostituzioni parziali e controlla
    se il file esiste già per prevenire errori.
    """
    replacements_str = ", ".join([f"'{k}' -> '{v}'" for k, v in REPLACEMENTS.items()])
    print(f"--- Inizio rinomina di file e cartelle: {replacements_str} ---\n")

    for dirpath, dirnames, filenames in os.walk(ROOT_DIR, topdown=False):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]

        # 1. Rinomina i file
        for filename in filenames:
            if filename in EXCLUDED_FILES:
                continue

            new_filename = filename
            for old, new in REPLACEMENTS.items():
                # Usa \b per cercare solo parole intere
                pattern = r'\b' + re.escape(old) + r'\b'
                new_filename, subs = re.subn(pattern, new, new_filename, flags=re.IGNORECASE)

            old_filepath = os.path.join(dirpath, filename)
            new_filepath = os.path.join(dirpath, new_filename)

            # Esegui la rinomina solo se il nome è effettivamente cambiato
            if old_filepath.lower() != new_filepath.lower():
                print(
                    f"Rinomino file:    {os.path.relpath(old_filepath, ROOT_DIR)} -> {os.path.relpath(new_filepath, ROOT_DIR)}")
                try:
                    os.rename(old_filepath, new_filepath)
                except OSError as e:
                    print(f"  -> ERRORE durante la rinomina del file: {e}")

        # 2. Rinomina le cartelle
        for dirname in dirnames:
            new_dirname = dirname
            for old, new in REPLACEMENTS.items():
                # Usa \b anche per le cartelle
                pattern = r'\b' + re.escape(old) + r'\b'
                new_dirname, subs = re.subn(pattern, new, new_dirname, flags=re.IGNORECASE)

            old_dirpath = os.path.join(dirpath, dirname)
            new_dirpath = os.path.join(dirpath, new_dirname)

            # Applica lo stesso controllo di sicurezza per le cartelle
            if old_dirpath.lower() != new_dirpath.lower():
                print(
                    f"Rinomino cartella: {os.path.relpath(old_dirpath, ROOT_DIR)} -> {os.path.relpath(new_dirpath, ROOT_DIR)}")
                try:
                    os.rename(old_dirpath, new_dirpath)
                except OSError as e:
                    print(f"  -> ERRORE durante la rinomina della cartella: {e}")

    print("\n--- Rinomina interna completata. ---")

    final_root_name = os.path.basename(ROOT_DIR)
    for old, new in REPLACEMENTS.items():
        pattern = r'\b' + re.escape(old) + r'\b'
        final_root_name, _ = re.subn(pattern, new, final_root_name, flags=re.IGNORECASE)

    print("\nAZIONE MANUALE RICHIESTA:")
    print(f"Per completare, rinomina la cartella radice del progetto:")
    print(f"  DA: {os.path.basename(ROOT_DIR)}")
    print(f"  A:  {final_root_name}")


if __name__ == "__main__":
    print("ATTENZIONE: Questo script modificherà i nomi di file e cartelle in modo permanente.")
    print(f"La radice del progetto identificata è: {ROOT_DIR}")
    print("Assicurati di aver chiuso tutti i file e gli editor in questa cartella.")

    confirm = input(f"Sei sicuro di voler procedere? (Digita 'si' per iniziare): ")
    if confirm.lower() == 'si':
        rename_filesystem_items()
    else:
        print("Operazione annullata.")