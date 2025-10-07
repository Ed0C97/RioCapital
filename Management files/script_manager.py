# script_manager.py
import os
import re
import argparse
import logging
from typing import Dict, Callable, List, Set, Optional, Tuple
from collections import deque
import shutil
from datetime import datetime

try:
    from tqdm import tqdm
except ImportError:
    print("Modulo 'tqdm' non trovato. Installalo con: pip install tqdm")


    # Forniamo un'implementazione fittizia se tqdm non è installato
    def tqdm(iterable, *args, **kwargs):
        return iterable

# ==============================================================================
# CONFIGURAZIONE LOGGING
# ==============================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ==============================================================================
# CONFIGURAZIONE CENTRALE (Default, sovrascrivibile da CLI)
# ==============================================================================
SCRIPT_NAME = os.path.basename(__file__)
EXCLUDED_DIRS = {
    'node_modules', 'venv', '.venv', 'env', '.git', '.idea', '.vscode',
    '__pycache__', 'build', 'dist', 'target', '.pytest_cache',
}


# ==============================================================================
# GESTIONE DEI COMMENTI (Invariato, ma integrato nel nuovo sistema)
# ==============================================================================
def create_replacer(string_pattern: str, comment_pattern: str) -> Callable[[str], str]:
    pattern = re.compile(f"({string_pattern})|({comment_pattern})", re.DOTALL | re.MULTILINE)

    def replacer(match: re.Match) -> str:
        return match.group(1) if match.group(1) else ''

    return lambda content: pattern.sub(replacer, content)


JS_LIKE_STRING_PATTERN = r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"|`(?:\\.|[^`])*`"
C_STYLE_COMMENT_PATTERN = r"//.*?$|/\*.*?\*/"
PYTHON_STRING_PATTERN = r"'''(?:.|\n)*?'''|\"\"\"(?:.|\n)*?\"\"\"|'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\""
PYTHON_COMMENT_PATTERN = r"#.*?$"
HTML_COMMENT_PATTERN = r"<!--.*?-->"

remove_c_style_comments = create_replacer(JS_LIKE_STRING_PATTERN, C_STYLE_COMMENT_PATTERN)
remove_python_comments = create_replacer(PYTHON_STRING_PATTERN, PYTHON_COMMENT_PATTERN)
remove_html_comments = create_replacer(r"", HTML_COMMENT_PATTERN)

COMMENT_HANDLERS: Dict[str, Tuple[Optional[Callable[[str], str]], str]] = {
    '.js': (remove_c_style_comments, '//'), '.jsx': (remove_c_style_comments, '//'),
    '.ts': (remove_c_style_comments, '//'), '.tsx': (remove_c_style_comments, '//'),
    '.css': (remove_c_style_comments, '/*'), '.scss': (remove_c_style_comments, '//'),
    '.html': (remove_html_comments, '<!--'), '.py': (remove_python_comments, '#'),
    '.java': (remove_c_style_comments, '//'), '.c': (remove_c_style_comments, '//'),
    '.cpp': (remove_c_style_comments, '//'), '.cs': (remove_c_style_comments, '//'),
    '.go': (remove_c_style_comments, '//'), '.rs': (remove_c_style_comments, '//'),
    '.php': (remove_c_style_comments, '//'), '.sh': (remove_python_comments, '#'),
    '.yml': (remove_python_comments, '#'), '.xml': (remove_html_comments, '<!--'),
}

# ==============================================================================
# NUOVA FUNZIONALITÀ: RILEVAMENTO FILE INUTILIZZATI
# ==============================================================================

# Pattern per trovare import/require/riferimenti a file
# Semplificato per catturare i percorsi all'interno di virgolette/apici
REFERENCE_PATTERNS = {
    'code': re.compile(r"(?:import|require|from)\s*\(?['\"]([^'\"]+)['\"]"),
    'html': re.compile(r"""(?:src|href)\s*=\s*['\"]([^'\"]+)['\"]"""),
    'css': re.compile(r"""@import\s*(?:url\()?['\"]([^'\"]+)['\"]""")
}

# File che sono quasi sempre punti di ingresso o usati implicitamente
PROJECT_ENTRYPOINTS = [
    'index.html', 'main.js', 'main.ts', 'main.py', 'app.js', 'app.py',
    'App.jsx', 'App.tsx', 'vite.config.js', 'webpack.config.js', 'package.json'
]
ALWAYS_USED_FILENAMES = {
    'package.json', 'package-lock.json', 'requirements.txt', '.env',
    'vite.config.js', 'webpack.config.js', 'tailwind.config.js', 'postcss.config.js',
    'README.md', '.gitignore'
}


def resolve_path(base_file: str, reference: str, all_files_map: Dict[str, str]) -> Optional[str]:
    """Tenta di risolvere un riferimento relativo in un percorso di file assoluto."""
    if not reference.startswith(('.', '/')):
        return None  # Ignora le dipendenze di librerie (es. 'react')

    base_dir = os.path.dirname(base_file)

    # Normalizza il percorso (es. './component/Button' -> '/path/to/project/component/Button')
    abs_path = os.path.normpath(os.path.join(base_dir, reference))

    # Prova a trovare il file con varie estensioni comuni
    possible_extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.scss', '.json']

    # Caso 1: Il riferimento è già un file esatto (es. './style.css')
    if os.path.basename(abs_path) in all_files_map:
        return all_files_map[os.path.basename(abs_path)]

    # Caso 2: Il riferimento è una directory (es. './component/Button/')
    for ext in possible_extensions:
        index_path = os.path.join(abs_path, f'index{ext}')
        if index_path in all_files_map.values():
            return index_path

    # Caso 3: Il riferimento è un file senza estensione (es. './component/Button')
    for ext in possible_extensions:
        file_path = f"{abs_path}{ext}"
        if file_path in all_files_map.values():
            return file_path

    return None


def find_unused_files(root_dir: str, extensions_filter: Optional[List[str]] = None, delete: bool = False,
                      dry_run: bool = False, use_trash: bool = True):
    """Analizza il progetto per trovare file non referenziati."""
    logging.info("Inizio analisi per trovare file inutilizzati...")

    all_files = set()
    all_files_map = {}
    for subdir, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for file in files:
            if file == SCRIPT_NAME: continue
            filepath = os.path.join(subdir, file)
            all_files.add(filepath)
            all_files_map[file] = filepath

    dependencies = {file: set() for file in all_files}

    logging.info(f"Analisi delle dipendenze per {len(all_files)} file...")
    for filepath in tqdm(all_files, desc="Analisi dipendenze"):
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            continue

        ext = os.path.splitext(filepath)[1]
        patterns = []
        if ext in ['.js', '.jsx', '.ts', '.tsx', '.py']: patterns.append(REFERENCE_PATTERNS['code'])
        if ext in ['.html', '.jsx', '.tsx']: patterns.append(REFERENCE_PATTERNS['html'])
        if ext in ['.css', '.scss']: patterns.append(REFERENCE_PATTERNS['css'])

        found_references = set()
        for pattern in patterns:
            found_references.update(pattern.findall(content))

        for ref in found_references:
            resolved = resolve_path(filepath, ref, all_files_map)
            if resolved:
                dependencies[filepath].add(resolved)

    logging.info("Costruzione del grafo delle dipendenze...")
    reachable_files = set()
    queue = deque()

    for entry in PROJECT_ENTRYPOINTS:
        if entry in all_files_map:
            entry_path = all_files_map[entry]
            if entry_path not in reachable_files:
                queue.append(entry_path)
                reachable_files.add(entry_path)

    while queue:
        current_file = queue.popleft()
        for dep in dependencies.get(current_file, set()):
            if dep not in reachable_files:
                reachable_files.add(dep)
                queue.append(dep)

    unused_files = all_files - reachable_files
    unused_files = {f for f in unused_files if os.path.basename(f) not in ALWAYS_USED_FILENAMES}

    if extensions_filter:
        filter_set = {ext.lower() for ext in extensions_filter}
        unused_files = {f for f in unused_files if os.path.splitext(f)[1].lower() in filter_set}

    logging.info("Analisi completata.")

    sorted_unused = sorted(list(unused_files))

    if not sorted_unused:
        if extensions_filter:
            print(f"\nNessun file inutilizzato trovato per le estensioni specificate: {', '.join(extensions_filter)}")
        else:
            print("\nNessun file inutilizzato trovato. Ottimo lavoro!")
        return

    # Se non è attiva la modalità delete, stampa solo la lista
    if not delete:
        if extensions_filter:
            print(f"\nTrovati {len(sorted_unused)} file inutilizzati per le estensioni specificate:")
        else:
            print(f"\nTrovati {len(sorted_unused)} file potenzialmente inutilizzati:")
        for file in sorted_unused:
            print(f"  - {os.path.relpath(file, root_dir)}")
        return

    # Se la modalità delete è attiva, avvia il processo interattivo
    files_to_delete = prompt_for_deletion(sorted_unused, root_dir)
    if files_to_delete:
        delete_files_safely(files_to_delete, root_dir, dry_run, use_trash)


def delete_files_safely(files_to_delete: List[str], root_dir: str, dry_run: bool, use_trash: bool):
    """Sposta i file in un cestino o li elimina permanentemente."""
    if not files_to_delete:
        return

    if use_trash:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        trash_dir = os.path.join(root_dir, ".unused_files_trash", f"trash_{timestamp}")

        if not dry_run:
            os.makedirs(trash_dir, exist_ok=True)

        action_desc = "Spostamento nel cestino"
        logging.info(f"{action_desc} di {len(files_to_delete)} file in: {os.path.relpath(trash_dir, root_dir)}")

        for file in tqdm(files_to_delete, desc=action_desc):
            rel_path = os.path.relpath(file, root_dir)
            dest_path = os.path.join(trash_dir, rel_path)
            if not dry_run:
                try:
                    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                    shutil.move(file, dest_path)
                except Exception as e:
                    logging.error(f"Impossibile spostare {rel_path}: {e}")
            else:
                logging.info(f"[DRY RUN] Sposterebbe {rel_path} in {os.path.relpath(dest_path, root_dir)}")

        if not dry_run:
            print(f"\nOperazione completata. I file sono stati spostati in:\n{trash_dir}")
            print("Puoi ripristinarli manualmente o eliminare la cartella se sei sicuro.")
        else:
            logging.info(f"Operazione completata (DRY RUN). {len(files_to_delete)} file sarebbero stati spostati.")

    else:  # Eliminazione permanente (questo è l'else corretto)
        logging.warning("Modalità ELIMINAZIONE PERMANENTE attiva.")
        action_desc = "Eliminazione permanente"

        for file in tqdm(files_to_delete, desc=action_desc):
            rel_path = os.path.relpath(file, root_dir)
            if not dry_run:
                try:
                    os.remove(file)
                except Exception as e:
                    logging.error(f"Impossibile eliminare {rel_path}: {e}")
            logging.info(f"{'[DRY RUN] Eliminerebbe' if dry_run else 'Eliminato'} permanentemente: {rel_path}")

        if not dry_run:
            logging.info(f"Operazione completata. {len(files_to_delete)} file eliminati permanentemente.")
        else:
            logging.info(f"Operazione completata (DRY RUN). {len(files_to_delete)} file sarebbero stati eliminati.")

def parse_selection(selection_str: str, max_index: int) -> Set[int]:
    """Converte una stringa di selezione (es. "1,3,5-7") in un set di indici."""
    indices = set()
    parts = selection_str.split(',')
    for part in parts:
        part = part.strip()
        if not part: continue
        if '-' in part:
            try:
                start, end = map(int, part.split('-'))
                if start > end or start < 1 or end > max_index:
                    raise ValueError("Intervallo non valido.")
                indices.update(range(start - 1, end))
            except ValueError:
                logging.warning(f"Ignorato intervallo non valido: '{part}'")
        else:
            try:
                index = int(part)
                if 1 <= index <= max_index:
                    indices.add(index - 1)
                else:
                    raise ValueError("Indice fuori range.")
            except ValueError:
                logging.warning(f"Ignorato indice non valido: '{part}'")
    return indices


def prompt_for_deletion(unused_files: List[str], root_dir: str) -> List[str]:
    """Mostra un prompt interattivo per selezionare i file da eliminare."""
    print("\nSeleziona i file da eliminare:")
    for i, file in enumerate(unused_files):
        print(f"  [{i + 1}] {os.path.relpath(file, root_dir)}")

    while True:
        choice = input("\nCosa vuoi fare? (A) Elimina tutti, (S) Seleziona, (C) Annulla: ").strip().lower()
        if choice in ['a', 's', 'c']:
            break
        print("Scelta non valida.")

    files_to_delete = []
    if choice == 'a':
        files_to_delete = unused_files
    elif choice == 's':
        selection_str = input("Inserisci i numeri dei file da eliminare (es. 1, 3, 5-7): ")
        selected_indices = parse_selection(selection_str, len(unused_files))
        files_to_delete = [unused_files[i] for i in selected_indices]

    if not files_to_delete:
        print("Nessun file selezionato. Operazione annullata.")
        return []

    print("\nHai selezionato i seguenti file per l'eliminazione:")
    for file in files_to_delete:
        print(f"  - {os.path.relpath(file, root_dir)}")

    confirm = input(
        f"\nSei assolutamente sicuro di voler spostare questi {len(files_to_delete)} file nel cestino? (scrivi 'yes' per confermare): ").strip().lower()
    if confirm == 'yes':
        return files_to_delete

    print("Eliminazione annullata dall'utente.")
    return []

# ==============================================================================
# FUNZIONI PRINCIPALI DELLO SCRIPT (Refactoring)
# ==============================================================================

def clean_files(root_dir: str, extensions_to_clean: List[str], dry_run: bool):
    """Elabora i file, rimuove i commenti e aggiunge un header."""
    logging.info(f"Inizio pulizia per: {', '.join(extensions_to_clean)}")
    if dry_run:
        logging.warning("Modalità DRY RUN attiva. Nessun file verrà modificato.")

    all_files_to_process = []
    for subdir, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for file in files:
            if file == SCRIPT_NAME: continue
            if os.path.splitext(file)[1].lower() in extensions_to_clean:
                all_files_to_process.append(os.path.join(subdir, file))

    processed_count = 0
    for filepath in tqdm(all_files_to_process, desc="Pulizia file"):
        rel_path = os.path.relpath(filepath, root_dir).replace('\\', '/')
        ext = os.path.splitext(filepath)[1].lower()

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            logging.warning(f"Errore in lettura per {rel_path}: {e}")
            continue

        handler = COMMENT_HANDLERS.get(ext)
        cleaned_content = content
        header = f'# {rel_path}\n\n'  # Header di default

        if handler:
            clean_function, comment_start = handler
            if clean_function:
                cleaned_content = clean_function(content)
            comment_end = ' */' if comment_start == '/*' else ''
            header = f'{comment_start} {rel_path}{comment_end}\n\n'

        cleaned_content = re.sub(r'[ \t]+$', '', cleaned_content, flags=re.MULTILINE)
        cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
        final_content = header + cleaned_content.strip() + '\n'

        if not dry_run:
            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(final_content)
                processed_count += 1
            except Exception as e:
                logging.error(f"Errore in scrittura per {rel_path}: {e}")
        else:
            # In dry run, contiamo comunque il file come "da processare"
            processed_count += 1

    if dry_run:
        logging.info(f"Operazione completata (DRY RUN). {processed_count} file sarebbero stati modificati.")
    else:
        logging.info(f"Operazione completata! File processati: {processed_count}.")


# ==============================================================================
# ESECUZIONE DELLO SCRIPT (con argparse)
# ==============================================================================

# ==============================================================================
# ESECUZIONE DELLO SCRIPT (con argparse)
# ==============================================================================

# SOSTITUISCI L'INTERA FUNZIONE CON QUESTA
def main():
    parser = argparse.ArgumentParser(description="Script per la gestione e pulizia di progetti software.")
    parser.add_argument("root_dir", nargs='?', default=os.getcwd(),
                        help="Directory principale del progetto. Default: directory corrente.")

    subparsers = parser.add_subparsers(dest="command", required=True, help="Comando da eseguire")

    # Sottocomando 'clean'
    clean_parser = subparsers.add_parser("clean", help="Pulisce i commenti e formatta i file.")
    clean_parser.add_argument("--extensions", nargs='+', help="Lista di estensioni da pulire (es. .py .js).")
    clean_parser.add_argument("--dry-run", action="store_true", help="Esegue lo script senza modificare i file.")

    # Sottocomando 'find-unused'
    unused_parser = subparsers.add_parser("find-unused", help="Trova i file non referenziati nel progetto.")
    unused_parser.add_argument("--extensions", nargs='*', help="Filtra i risultati per estensione (es. .js .png).")
    unused_parser.add_argument("--delete", action="store_true",
                               help="Avvia un prompt interattivo per eliminare i file trovati.")
    unused_parser.add_argument("--no-trash", action="store_true",
                               help="Elimina permanentemente i file invece di spostarli nel cestino (USA CON CAUTELA).")
    unused_parser.add_argument("--dry-run", action="store_true",
                               help="Simula l'eliminazione senza spostare/eliminare file.")
    args = parser.parse_args()

    if not os.path.isdir(args.root_dir):
        logging.error(f"La directory specificata non esiste: {args.root_dir}")
        return

    if args.command == "clean":
        extensions = args.extensions if args.extensions else list(COMMENT_HANDLERS.keys())
        clean_files(args.root_dir, extensions, args.dry_run)

    elif args.command == "find-unused":
        use_trash = not args.no_trash
        find_unused_files(args.root_dir, args.extensions, args.delete, args.dry_run, use_trash)


if __name__ == "__main__":
    main()