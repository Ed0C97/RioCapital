import os
import re

# --- CONFIGURAZIONE ---
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

REPLACEMENTS = {
    'Rio': 'Lit',
    'Capital': 'Investor'
}

# File e cartelle da ignorare completamente.
EXCLUDED_DIRS = {'node_modules', 'venv', '.venv', 'env', '.git', '.idea', '.vscode', '__pycache__', 'build', 'dist'}
EXCLUDED_FILES = {os.path.basename(__file__)}

# NUOVA LOGICA: Esclude i file binari noti invece di includere solo quelli di testo.
# Questo garantisce che file come .ps1, .xml, .yml, etc., vengano processati.
EXCLUDED_EXTENSIONS = { }


def case_aware_replace(match, new_word):
    """Funzione helper per sostituire una parola mantenendo il case originale."""
    old_word = match.group(0)
    if old_word.isupper():
        return new_word.upper()
    if old_word.istitle():
        return new_word.title()
    return new_word.lower()


def rename_filesystem_items():
    """FASE 1: Rinomina file e cartelle."""
    print("\n--- FASE 1: Inizio rinomina di file e cartelle ---\n")
    for dirpath, dirnames, filenames in os.walk(ROOT_DIR, topdown=False):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]

        for filename in filenames:
            if filename in EXCLUDED_FILES: continue

            new_filename = filename
            for old, new in REPLACEMENTS.items():
                pattern = re.escape(old)
                new_filename = re.sub(pattern, lambda m: case_aware_replace(m, new), new_filename, flags=re.IGNORECASE)

            old_filepath = os.path.join(dirpath, filename)
            new_filepath = os.path.join(dirpath, new_filename)

            if old_filepath.lower() != new_filepath.lower():
                print(
                    f"Rinomino file:    {os.path.relpath(old_filepath, ROOT_DIR)} -> {os.path.relpath(new_filepath, ROOT_DIR)}")
                try:
                    os.rename(old_filepath, new_filepath)
                except OSError as e:
                    print(f"  -> ERRORE: {e}")

        for dirname in dirnames:
            new_dirname = dirname
            for old, new in REPLACEMENTS.items():
                pattern = re.escape(old)
                new_dirname = re.sub(pattern, lambda m: case_aware_replace(m, new), new_dirname, flags=re.IGNORECASE)

            old_dirpath = os.path.join(dirpath, dirname)
            new_dirpath = os.path.join(dirpath, new_dirname)

            if old_dirpath.lower() != new_dirpath.lower():
                print(
                    f"Rinomino cartella: {os.path.relpath(old_dirpath, ROOT_DIR)} -> {os.path.relpath(new_dirpath, ROOT_DIR)}")
                try:
                    os.rename(old_dirpath, new_dirpath)
                except OSError as e:
                    print(f"  -> ERRORE: {e}")
    print("\n--- FASE 1: Rinomina file e cartelle completata. ---")


def replace_text_in_files():
    """FASE 2: Sostituisce il testo all'interno di TUTTI i file non binari."""
    print("\n--- FASE 2: Inizio sostituzione contenuto dei file ---\n")
    modified_files_count = 0
    for dirpath, dirnames, filenames in os.walk(ROOT_DIR):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]

        for filename in filenames:
            # NUOVA CONDIZIONE: Salta il file se è escluso per nome O per estensione binaria
            if filename in EXCLUDED_FILES or any(filename.lower().endswith(ext) for ext in EXCLUDED_EXTENSIONS):
                continue

            filepath = os.path.join(dirpath, filename)
            try:
                # Tenta di leggere come testo, ma con un fallback per file con encoding strani
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()

                new_content = content
                total_replacements = 0
                for old, new in REPLACEMENTS.items():
                    pattern = r'\b' + re.escape(old) + r'\b'
                    new_content, subs = re.subn(pattern, lambda m: case_aware_replace(m, new), new_content,
                                                flags=re.IGNORECASE)
                    total_replacements += subs

                if total_replacements > 0:
                    with open(filepath, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(
                        f"Modificato file:  {os.path.relpath(filepath, ROOT_DIR)} ({total_replacements} sostituzioni)")
                    modified_files_count += 1
            except Exception as e:
                print(f"  -> ERRORE durante la lettura/scrittura del file {os.path.relpath(filepath, ROOT_DIR)}: {e}")
    print(f"\n--- FASE 2: Sostituzione contenuto completata. {modified_files_count} file modificati. ---")


if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DI REBRANDING COMPLETO DEL PROGETTO (Versione Definitiva)")
    print("=" * 60)
    print(f"La radice del progetto identificata è: {ROOT_DIR}")
    print("\nQuesto script eseguirà le seguenti operazioni in modo PERMANENTE:")
    print("  1. Rinominerà tutti i file e le cartelle.")
    print("  2. Modificherà il contenuto di TUTTI i file (esclusi i formati binari).")
    print("\nSOSTITUZIONI:")
    for old, new in REPLACEMENTS.items():
        print(f"  - '{old}' diventerà '{new}' (rispettando maiuscole/minuscole)")

    print("\nATTENZIONE: Assicurati di aver fatto un backup e di aver chiuso tutti gli editor!")

    confirm = input(f"\nSei assolutamente sicuro di voler procedere? (Digita 'si' per iniziare): ")
    if confirm.lower() == 'si':
        rename_filesystem_items()
        replace_text_in_files()

        final_root_name = os.path.basename(ROOT_DIR)
        for old, new in REPLACEMENTS.items():
            pattern = re.escape(old)
            final_root_name = re.sub(pattern, lambda m: case_aware_replace(m, new), final_root_name,
                                     flags=re.IGNORECASE)

        print("\n--- OPERAZIONE COMPLETATA ---")
        print("\nAZIONE MANUALE FINALE RICHIESTA:")
        print(f"Per finire, rinomina la cartella radice del progetto:")
        print(f"  DA: {os.path.basename(ROOT_DIR)}")
        print(f"  A:  {final_root_name}")
    else:
        print("Operazione annullata.")