import os
import re
from typing import Dict, Callable, List, Set, Optional, Tuple

# ==============================================================================
# CONFIGURAZIONE CENTRALE
# ==============================================================================

# Definisci qui la directory principale del tuo progetto.
# Per portabilità, è meglio usare un percorso assoluto o relativo allo script.
# Esempio: ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = r'/'

# Nome dello script da ignorare durante l'elaborazione.
SCRIPT_NAME = os.path.basename(__file__)

# Elenco delle directory da escludere durante la scansione.
# È FONDAMENTALE includere ambienti virtuali e cartelle di configurazione degli IDE.
EXCLUDED_DIRS = {
    # Cartelle di dipendenze e ambienti
    'node_modules',  # Dipendenze JavaScript
    'venv',  # Ambiente virtuale Python standard
    '.venv',  # Altro nome comune per ambienti virtuali
    'env',  # Altro nome comune
    'rcblog-venv',  # Nome specifico di un ambiente (aggiunto per sicurezza)

    # Cartelle di metadati e configurazione strumenti
    '.git',  # Repository Git
    '.idea',  # Cartella di configurazione per IDE JetBrains (PyCharm, etc.)
    '.vscode',  # Cartella di configurazione per Visual Studio Code

    # Cartelle di output e cache
    '__pycache__',  # Cache di Python
    'build',  # Directory di build comuni
    'dist',  # Directory di distribuzione comuni
    'target',  # Comune in progetti Java/Rust
    '.pytest_cache',  # Cache di Pytest
}


# ==============================================================================
# GESTIONE DEI COMMENTI PER ESTENSIONE
# ==============================================================================

# --- Funzioni generiche per la rimozione dei commenti ---

def create_replacer(string_pattern: str, comment_pattern: str) -> Callable[[str], str]:
    """Crea una funzione di sostituzione per rimuovere i commenti ignorando le stringhe."""
    pattern = re.compile(f"({string_pattern})|({comment_pattern})", re.DOTALL | re.MULTILINE)

    def replacer(match: re.Match) -> str:
        return match.group(1) if match.group(1) else ''

    return lambda content: pattern.sub(replacer, content)


# --- Definizione dei pattern per vari linguaggi ---

JS_LIKE_STRING_PATTERN = r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"|`(?:\\.|[^`])*`"
C_STYLE_COMMENT_PATTERN = r"//.*?$|/\*.*?\*/"

PYTHON_STRING_PATTERN = r"'''(?:.|\n)*?'''|\"\"\"(?:.|\n)*?\"\"\"|'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\""
PYTHON_COMMENT_PATTERN = r"#.*?$"

HTML_COMMENT_PATTERN = r"<!--.*?-->"

# --- Creazione delle funzioni di pulizia specifiche ---

remove_c_style_comments = create_replacer(JS_LIKE_STRING_PATTERN, C_STYLE_COMMENT_PATTERN)
remove_python_comments = create_replacer(PYTHON_STRING_PATTERN, PYTHON_COMMENT_PATTERN)
remove_html_comments = create_replacer(r"", HTML_COMMENT_PATTERN)

# --- Mappatura delle estensioni alle funzioni e sintassi dei commenti ---

COMMENT_HANDLERS: Dict[str, Tuple[Optional[Callable[[str], str]], str]] = {
    # Linguaggi Web Frontend
    '.js': (remove_c_style_comments, '//'),
    '.jsx': (remove_c_style_comments, '//'),
    '.ts': (remove_c_style_comments, '//'),
    '.tsx': (remove_c_style_comments, '//'),
    '.css': (remove_c_style_comments, '/*'),
    '.scss': (remove_c_style_comments, '//'),
    '.less': (remove_c_style_comments, '//'),
    '.html': (remove_html_comments, '<!--'),
    '.vue': (None, '//'),
    '.svelte': (remove_html_comments, '<!--'),

    # Linguaggi Backend e Scripting
    '.py': (remove_python_comments, '#'),
    '.php': (remove_c_style_comments, '//'),
    '.rb': (remove_python_comments, '#'),
    '.go': (remove_c_style_comments, '//'),
    '.rs': (remove_c_style_comments, '//'),
    '.sh': (remove_python_comments, '#'),
    '.ps1': (remove_python_comments, '#'),

    # Linguaggi Compilati (C-family e simili)
    '.c': (remove_c_style_comments, '//'),
    '.h': (remove_c_style_comments, '//'),
    '.cpp': (remove_c_style_comments, '//'),
    '.hpp': (remove_c_style_comments, '//'),
    '.cxx': (remove_c_style_comments, '//'),
    '.hxx': (remove_c_style_comments, '//'),
    '.cc': (remove_c_style_comments, '//'),
    '.hh': (remove_c_style_comments, '//'),
    '.cs': (remove_c_style_comments, '//'),
    '.java': (remove_c_style_comments, '//'),
    '.scala': (remove_c_style_comments, '//'),
    '.kt': (remove_c_style_comments, '//'),
    '.swift': (remove_c_style_comments, '//'),

    # Dati e Configurazione
    '.yaml': (remove_python_comments, '#'),
    '.yml': (remove_python_comments, '#'),
    '.xml': (remove_html_comments, '<!--'),
    '.toml': (remove_python_comments, '#'),
    '.env': (remove_python_comments, '#'),
    '.ini': (remove_python_comments, ';'),

    # Documentazione
    '.md': (None, '<!--'),
}


# ==============================================================================
# FUNZIONI PRINCIPALI DELLO SCRIPT
# ==============================================================================

def scan_project_extensions(root_dir: str, excluded_dirs: Set[str]) -> Set[str]:
    """Scansiona la directory del progetto e restituisce un set di tutte le estensioni trovate."""
    print("Scansione delle estensioni nel progetto...")
    found_extensions = set()
    for subdir, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext:
                found_extensions.add(ext.lower())

    print("Estensioni trovate:")
    for ext in sorted(list(found_extensions)):
        print(f"  {ext}")
    return found_extensions


def get_extensions_to_clean(available_extensions: Set[str]) -> List[str]:
    """Chiede all'utente quali estensioni pulire, basandosi su quelle disponibili."""
    while True:
        user_input = input(
            "\nInserisci le estensioni da pulire (es: .py .js), 'all' per tutte, o 'supported' per quelle gestite: ")
        choice = user_input.strip().lower()

        if choice == 'all':
            return list(available_extensions)
        elif choice == 'supported':
            return [ext for ext in available_extensions if ext in COMMENT_HANDLERS]

        selected_extensions = [e.strip().lower() for e in choice.split() if e.strip().startswith('.')]

        if selected_extensions:
            return selected_extensions

        print(
            "Input non valido. Per favore, inserisci estensioni valide (es. '.js') o una delle opzioni ('all', 'supported').")


def process_files(root_dir: str, extensions_to_clean: List[str], excluded_dirs: Set[str]):
    """Elabora i file, rimuove i commenti e aggiunge un header con il percorso."""
    print(f"\nInizio pulizia per le seguenti estensioni: {', '.join(extensions_to_clean)}\n")

    processed_count = 0
    for subdir, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]

        for file in files:
            if file == SCRIPT_NAME:
                continue

            ext = os.path.splitext(file)[1].lower()
            if ext not in extensions_to_clean:
                continue

            filepath = os.path.join(subdir, file)
            rel_path = os.path.relpath(filepath, root_dir).replace('\\', '/')

            print(f'Processing: {rel_path}')

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except Exception as e:
                print(f"  -> ERRORE in lettura: {e}")
                continue

            handler = COMMENT_HANDLERS.get(ext)
            cleaned_content = content

            if handler:
                clean_function, comment_syntax_start = handler

                if clean_function:
                    cleaned_content = clean_function(content)

                comment_syntax_end = ' */' if comment_syntax_start == '/*' else ''
                header = f'{comment_syntax_start} {rel_path}{comment_syntax_end}\n\n'
            else:
                header = f'# {rel_path}\n\n'

            # --- SEZIONE DI PULIZIA AGGIUNTIVA ---
            # Rimuove gli spazi bianchi (spazi, tab) alla fine di ogni riga.
            cleaned_content = re.sub(r'[ \t]+$', '', cleaned_content, flags=re.MULTILINE)

            # Sostituisce 3 o più newline consecutive con solo 2 (lasciando al massimo una riga vuota).
            cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
            # --- FINE SEZIONE ---

            # Unisce l'header e il contenuto pulito, assicurando una singola newline alla fine.
            final_content = header + cleaned_content.strip() + '\n'

            try:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(final_content)
                processed_count += 1
            except Exception as e:
                print(f"  -> ERRORE in scrittura: {e}")

    print(f"\nOperazione completata! File processati: {processed_count}.")


# ==============================================================================
# ESECUZIONE DELLO SCRIPT
# ==============================================================================

if __name__ == "__main__":
    if not os.path.isdir(ROOT_DIR):
        print(f"ERRORE: La directory specificata non esiste: {ROOT_DIR}")
    else:
        all_found_extensions = scan_project_extensions(ROOT_DIR, EXCLUDED_DIRS)

        if not all_found_extensions:
            print("Nessun file con estensione trovato nelle directory scansionate.")
        else:
            extensions_to_process = get_extensions_to_clean(all_found_extensions)
            if extensions_to_process:
                process_files(ROOT_DIR, extensions_to_process, EXCLUDED_DIRS)
            else:
                print("Nessuna estensione selezionata. Uscita.")
