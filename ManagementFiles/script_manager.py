import os
import re
import argparse
import logging
from typing import Dict, Callable, List, Set, Optional, Tuple
from collections import deque
from pathlib import Path
import sys
import datetime

try:
    from tqdm import tqdm
except ImportError:
    # Implementazione fittizia per robustezza
    def tqdm(iterable, *args, **kwargs):
        return iterable

try:
    from send2trash import send2trash
    USE_SEND2TRASH = True
except ImportError:
    USE_SEND2TRASH = False
    print("ATTENZIONE: Modulo 'send2trash' non trovato. L'eliminazione dei file sarà permanente se non si usa il cestino personalizzato.")


# ==============================================================================
# CONFIGURAZIONE LOGGING
# ==============================================================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==============================================================================
# CONFIGURAZIONE CENTRALE
# ==============================================================================
SCRIPT_NAME = Path(__file__).name
EXCLUDED_DIRS = {
    'node_modules', 'venv', '.venv', 'env', '.git', '.idea', '.vscode',
    '__pycache__', 'build', 'dist', 'target', '.pytest_cache', '.unused_files_trash'
}
PROJECT_ENTRYPOINTS = [
    'index.html', 'main.js', 'main.ts', 'main.py', 'app.js', 'app.py',
    'App.jsx', 'App.tsx', 'vite.config.js', 'webpack.config.js', 'package.json'
]
ALWAYS_USED_FILENAMES = {
    'package.json', 'package-lock.json', 'requirements.txt', '.env',
    'vite.config.js', 'webpack.config.js', 'tailwind.config.js', 'postcss.config.js',
    'README.md', '.gitignore'
}

# ==============================================================================
# CLASSE PER LA GESTIONE DEI COMMENTI (Modularità)
# ==============================================================================

class CommentRemover:
    """Gestisce la rimozione dei commenti per diversi tipi di file."""

    JS_LIKE_STRING_PATTERN = r"'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\"|`(?:\\.|[^`])*`"
    C_STYLE_COMMENT_PATTERN = r"//.*?$|/\*.*?\*/"
    PYTHON_STRING_PATTERN = r"'''(?:.|\n)*?'''|\"\"\"(?:.|\n)*?\"\"\"|'(?:\\.|[^'])*'|\"(?:\\.|[^\"])*\""
    PYTHON_COMMENT_PATTERN = r"#.*?$"
    HTML_COMMENT_PATTERN = r"<!--.*?-->"

    COMMENT_HANDLERS: Dict[str, Tuple[Optional[Callable[[str], str]], str]] = {
        '.js': (None, '//'), '.jsx': (None, '//'), '.ts': (None, '//'), '.tsx': (None, '//'),
        '.css': (None, '/*'), '.scss': (None, '//'), '.html': (None, '<!--'), '.py': (None, '#'),
        '.java': (None, '//'), '.c': (None, '//'), '.cpp': (None, '//'), '.cs': (None, '//'),
        '.go': (None, '//'), '.rs': (None, '//'), '.php': (None, '//'), '.sh': (None, '#'),
        '.yml': (None, '#'), '.xml': (None, '<!--'),
    }

    def __init__(self):
        # Inizializza i replacer specifici
        self.COMMENT_HANDLERS['.js'] = (self._create_replacer(self.JS_LIKE_STRING_PATTERN, self.C_STYLE_COMMENT_PATTERN), '//')
        self.COMMENT_HANDLERS['.jsx'] = (self._create_replacer(self.JS_LIKE_STRING_PATTERN, self.C_STYLE_COMMENT_PATTERN), '//')
        self.COMMENT_HANDLERS['.ts'] = (self._create_replacer(self.JS_LIKE_STRING_PATTERN, self.C_STYLE_COMMENT_PATTERN), '//')
        self.COMMENT_HANDLERS['.tsx'] = (self._create_replacer(self.JS_LIKE_STRING_PATTERN, self.C_STYLE_COMMENT_PATTERN), '//')
        self.COMMENT_HANDLERS['.css'] = (self._create_replacer(self.JS_LIKE_STRING_PATTERN, self.C_STYLE_COMMENT_PATTERN), '/*')
        self.COMMENT_HANDLERS['.py'] = (self._create_replacer(self.PYTHON_STRING_PATTERN, self.PYTHON_COMMENT_PATTERN), '#')
        self.COMMENT_HANDLERS['.html'] = (self._create_replacer(r"", self.HTML_COMMENT_PATTERN), '<!--')
        # Aggiungi altri handler C-style se necessario

    def _create_replacer(self, string_pattern: str, comment_pattern: str) -> Callable[[str], str]:
        """Crea una funzione replacer che ignora le stringhe durante la rimozione dei commenti."""
        pattern = re.compile(f"({string_pattern})|({comment_pattern})", re.DOTALL | re.MULTILINE)

        def replacer(match: re.Match) -> str:
            # Se match.group(1) esiste, è una stringa, la manteniamo. Altrimenti, è un commento, lo rimuoviamo.
            return match.group(1) if match.group(1) else ''

        return lambda content: pattern.sub(replacer, content)

    def remove_comments(self, content: str, extension: str) -> Tuple[str, str]:
        """Rimuove i commenti e restituisce il contenuto pulito e il prefisso del commento."""
        handler = self.COMMENT_HANDLERS.get(extension.lower())
        if not handler:
            return content, '#' # Default a Python comment style

        clean_function, comment_start = handler
        if clean_function:
            return clean_function(content), comment_start
        return content, comment_start


# ==============================================================================
# CLASSE PER LA PULIZIA DEI FILE (Modularità)
# ==============================================================================

class ProjectCleaner:
    """Gestisce la pulizia dei file (rimozione commenti, formattazione)."""

    def __init__(self, root_dir: Path, dry_run: bool):
        self.root_dir = root_dir
        self.dry_run = dry_run
        self.comment_remover = CommentRemover()

    def clean_files(self, extensions_to_clean: List[str]):
        """Elabora i file, rimuove i commenti e aggiunge un header."""
        logger.info(f"Inizio pulizia per: {', '.join(extensions_to_clean)}")
        if self.dry_run:
            logger.warning("Modalità DRY RUN attiva. Nessun file verrà modificato.")

        all_files_to_process = self._scan_files(extensions_to_clean)

        processed_count = 0
        # MODIFICA: Aggiungi un logger per il debug
        logger.info("Avvio del ciclo di processamento dei file...")

        for filepath in tqdm(all_files_to_process, desc="Pulizia file"):
            rel_path = filepath.relative_to(self.root_dir).as_posix()

            # ===== AGGIUNGI QUESTA RIGA =====
            logger.info(f"ORA PROCESSO: {rel_path}")
            # ===============================

            ext = filepath.suffix.lower()

            try:
                content = filepath.read_text(encoding='utf-8', errors='ignore')
            except (FileNotFoundError, PermissionError, UnicodeDecodeError) as e:
                logger.warning(f"Errore in lettura per {rel_path}: {e}")
                continue

            cleaned_content, comment_start = self.comment_remover.remove_comments(content, ext)

            # Aggiunta Header
            comment_end = ' */' if comment_start == '/*' else ''
            header = f'{comment_start} {rel_path}{comment_end}\n\n'

            # Pulizia spazi bianchi
            cleaned_content = re.sub(r'[ \t]+$', '', cleaned_content, flags=re.MULTILINE)
            cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
            final_content = header + cleaned_content.strip() + '\n'

            if not self.dry_run:
                try:
                    filepath.write_text(final_content, encoding='utf-8')
                    processed_count += 1
                except PermissionError as e:
                    logger.error(f"Errore in scrittura (Permesso negato) per {rel_path}: {e}")
                except Exception as e:
                    logger.error(f"Errore in scrittura per {rel_path}: {e}")
            else:
                logger.info(f"[DRY RUN] Pulizia completata per: {rel_path}")

        logger.info(f"Pulizia completata. File processati: {processed_count}")

    def _scan_files(self, extensions_to_clean: List[str]) -> List[Path]:
        """Scansiona il filesystem e restituisce la lista dei Path da processare."""
        all_files = []
        ext_set = {ext.lower() for ext in extensions_to_clean}
        excluded_names = EXCLUDED_DIRS

        for path in self.root_dir.rglob('*'):
            # NUOVA LOGICA DI ESCLUSIONE: Controlla se un componente del percorso è una directory esclusa
            try:
                relative_path = path.relative_to(self.root_dir)
            except ValueError:
                continue # Non dovrebbe succedere

            if any(part in excluded_names for part in relative_path.parts):
                continue

            if path.is_file() and path.suffix.lower() in ext_set and path.name != SCRIPT_NAME:
                all_files.append(path)
        return all_files


# ==============================================================================
# CLASSE PER L'ANALISI DELLE DIPENDENZE (Modularità e Sicurezza)
# ==============================================================================

class DependencyAnalyzer:
    """Analizza le dipendenze del progetto per trovare file inutilizzati."""

    REFERENCE_PATTERNS = {
        'code': re.compile(r"(?:import|require|from)\s*\(?['\"]([^'\"]+)['\"]"),
        'html': re.compile(r"""(?:src|href)\s*=\s*['\"]([^'\"]+)['\"]"""),
        'css': re.compile(r"""@import\s*(?:url\()?['\"]([^'\"]+)['\"]""")
    }
    POSSIBLE_EXTENSIONS = ['', '.js', '.jsx', '.ts', '.tsx', '.py', '.css', '.scss', '.json']

    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.all_files: Set[Path] = set()
        self.file_name_to_path: Dict[str, Path] = {}
        self._scan_project()

    def _scan_project(self):
        """Scansiona il progetto e popola le mappe dei file (con esclusione robusta)."""
        excluded_names = EXCLUDED_DIRS
        for path in self.root_dir.rglob('*'):
            # NUOVA LOGICA DI ESCLUSIONE: Controlla se un componente del percorso è una directory esclusa
            try:
                relative_path = path.relative_to(self.root_dir)
            except ValueError:
                continue # Non dovrebbe succedere

            if any(part in excluded_names for part in relative_path.parts):
                continue

            if path.is_file() and path.name != SCRIPT_NAME:
                self.all_files.add(path)
                self.file_name_to_path[path.name] = path

    def _resolve_path(self, base_file: Path, reference: str) -> Optional[Path]:
        """Tenta di risolvere un riferimento relativo in un percorso di file assoluto (con Path Traversal Check)."""
        if not reference.startswith(('.', '/')):
            return None  # Ignora le dipendenze di librerie (es. 'react')

        base_dir = base_file.parent
        abs_path_str = os.path.normpath(str(base_dir / reference))
        abs_path = Path(abs_path_str)

        # --- SICUREZZA: Path Traversal Check ---
        # Assicura che il percorso risolto sia un sottopercorso della root_dir
        try:
            abs_path.relative_to(self.root_dir)
        except ValueError:
            # Il percorso risolto è al di fuori della root_dir (Path Traversal)
            logger.warning(f"Riferimento bloccato (Path Traversal): {reference} in {base_file.name}")
            return None
        # ---------------------------------------

        # Caso 1: Il riferimento è già un file esatto (es. './style.css')
        if abs_path in self.all_files:
            return abs_path

        # Caso 2: Il riferimento è una directory (es. './component/Button/')
        for ext in self.POSSIBLE_EXTENSIONS:
            index_path = abs_path / f'index{ext}'
            if index_path in self.all_files:
                return index_path

        # Caso 3: Il riferimento è un file senza estensione (es. './component/Button')
        for ext in self.POSSIBLE_EXTENSIONS:
            file_path = abs_path.with_suffix(ext)
            if file_path in self.all_files:
                return file_path

        return None

    def find_unused_files(self, extensions_filter: Optional[List[str]] = None, delete: bool = False,
                          dry_run: bool = False, use_trash: bool = True):
        """Analizza il progetto per trovare file non referenziati."""
        logger.info("Inizio analisi per trovare file inutilizzati...")

        dependencies: Dict[Path, Set[Path]] = {file: set() for file in self.all_files}

        logger.info(f"Analisi delle dipendenze per {len(self.all_files)} file...")
        for filepath in tqdm(self.all_files, desc="Analisi dipendenze"):
            ext = filepath.suffix.lower()
            patterns = []
            if ext in ['.js', '.jsx', '.ts', '.tsx', '.py']: patterns.append(self.REFERENCE_PATTERNS['code'])
            if ext in ['.html', '.jsx', '.tsx']: patterns.append(self.REFERENCE_PATTERNS['html'])
            if ext in ['.css', '.scss']: patterns.append(self.REFERENCE_PATTERNS['css'])

            try:
                content = filepath.read_text(encoding='utf-8', errors='ignore')
            except (FileNotFoundError, PermissionError, UnicodeDecodeError) as e:
                logger.warning(f"Errore in lettura per {filepath.name}: {e}")
                continue

            found_references = set()
            for pattern in patterns:
                found_references.update(pattern.findall(content))

            for ref in found_references:
                resolved = self._resolve_path(filepath, ref)
                if resolved:
                    dependencies[filepath].add(resolved)

        logger.info("Costruzione del grafo delle dipendenze (BFS)...")
        reachable_files: Set[Path] = set()
        queue: deque[Path] = deque()

        # 1. Aggiungi i punti di ingresso espliciti
        for entry_name in PROJECT_ENTRYPOINTS:
            if entry_name in self.file_name_to_path:
                entry_path = self.file_name_to_path[entry_name]
                if entry_path not in reachable_files:
                    queue.append(entry_path)
                    reachable_files.add(entry_path)

        # 2. Breadth-First Search (BFS)
        while queue:
            current_file = queue.popleft()
            for dep in dependencies.get(current_file, set()):
                if dep not in reachable_files:
                    reachable_files.add(dep)
                    queue.append(dep)

        # 3. Calcola i file inutilizzati
        unused_files = self.all_files - reachable_files
        unused_files = {f for f in unused_files if f.name not in ALWAYS_USED_FILENAMES}

        if extensions_filter:
            filter_set = {ext.lower() for ext in extensions_filter}
            unused_files = {f for f in unused_files if f.suffix.lower() in filter_set}

        logger.info("Analisi completata.")

        sorted_unused = sorted(list(unused_files))

        if not sorted_unused:
            if extensions_filter:
                print(f"\nNessun file inutilizzato trovato per le estensioni specificate: {', '.join(extensions_filter)}")
            else:
                print("\nNessun file inutilizzato trovato. Ottimo lavoro!")
            return

        # Se non è attiva la modalità delete, stampa solo la lista
        if not delete:
            self._print_unused_files(sorted_unused, extensions_filter)
            return

        # Se la modalità delete è attiva, avvia il processo interattivo
        files_to_delete = self._prompt_for_deletion(sorted_unused)
        if files_to_delete:
            self._delete_files_safely(files_to_delete, dry_run, use_trash)

    def _print_unused_files(self, unused_files: List[Path], extensions_filter: Optional[List[str]]):
        """Stampa la lista dei file inutilizzati."""
        if extensions_filter:
            print(f"\nTrovati {len(unused_files)} file inutilizzati per le estensioni specificate:")
        else:
            print(f"\nTrovati {len(unused_files)} file potenzialmente inutilizzati:")
        for i, file in enumerate(unused_files):
            print(f"  [{i + 1}] {file.relative_to(self.root_dir).as_posix()}")

    def _parse_selection(self, selection_str: str, max_index: int) -> Set[int]:
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
                except ValueError as e:
                    logger.warning(f"Ignorato intervallo non valido: '{part}' ({e})")
            else:
                try:
                    index = int(part)
                    if 1 <= index <= max_index:
                        indices.add(index - 1)
                    else:
                        raise ValueError("Indice fuori range.")
                except ValueError as e:
                    logger.warning(f"Ignorato indice non valido: '{part}' ({e})")
        return indices

    def _prompt_for_deletion(self, unused_files: List[Path]) -> List[Path]:
        """Mostra un prompt interattivo per selezionare i file da eliminare."""
        print("\nSeleziona i file da eliminare:")
        for i, file in enumerate(unused_files):
            print(f"  [{i + 1}] {file.relative_to(self.root_dir).as_posix()}")

        while True:
            choice = input("\nCosa vuoi fare? (A) Elimina tutti, (S) Seleziona, (C) Annulla: ").strip().lower()
            if choice in ['a', 's', 'c']:
                break
            print("Scelta non valida.")

        files_to_delete: List[Path] = []
        if choice == 'a':
            files_to_delete = unused_files
        elif choice == 's':
            selection_str = input("Inserisci i numeri dei file da eliminare (es. 1, 3, 5-7): ")
            selected_indices = self._parse_selection(selection_str, len(unused_files))
            files_to_delete = [unused_files[i] for i in selected_indices]

        if not files_to_delete:
            print("Nessun file selezionato. Operazione annullata.")
            return []

        print("\nHai selezionato i seguenti file per l'eliminazione:")
        for file in files_to_delete:
            print(f"  - {file.relative_to(self.root_dir).as_posix()}")

        confirm = input(
            f"\nSei assolutamente sicuro di voler eliminare questi {len(files_to_delete)} file? (scrivi 'yes' per confermare): ").strip().lower()
        if confirm == 'yes':
            return files_to_delete

        print("Eliminazione annullata dall'utente.")
        return []

    def _delete_files_safely(self, files_to_delete: List[Path], dry_run: bool, use_trash: bool):
        """Sposta i file nel cestino di sistema o in un cestino personalizzato, o li elimina permanentemente."""
        if not files_to_delete:
            return

        if use_trash and USE_SEND2TRASH:
            action_desc = "Spostamento nel Cestino di Sistema"
            logger.info(f"{action_desc} di {len(files_to_delete)} file.")

            for file in tqdm(files_to_delete, desc=action_desc):
                rel_path = file.relative_to(self.root_dir).as_posix()
                if not dry_run:
                    try:
                        send2trash(str(file))
                    except Exception as e:
                        logger.error(f"Impossibile spostare {rel_path} nel cestino di sistema: {e}")
                else:
                    logger.info(f"[DRY RUN] Sposterebbe {rel_path} nel cestino di sistema.")

            if not dry_run:
                print(f"\nOperazione completata. I file sono stati spostati nel Cestino di Sistema.")
            else:
                logger.info(f"Operazione completata (DRY RUN). {len(files_to_delete)} file sarebbero stati spostati.")

        elif use_trash and not USE_SEND2TRASH:
            # Fallback al cestino personalizzato se send2trash non è disponibile
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            trash_dir = self.root_dir / ".unused_files_trash" / f"trash_{timestamp}"

            if not dry_run:
                trash_dir.mkdir(parents=True, exist_ok=True)

            action_desc = "Spostamento nel Cestino Personalizzato"
            logger.info(f"{action_desc} di {len(files_to_delete)} file in: {trash_dir.relative_to(self.root_dir).as_posix()}")

            for file in tqdm(files_to_delete, desc=action_desc):
                rel_path = file.relative_to(self.root_dir).as_posix()
                dest_path = trash_dir / rel_path
                if not dry_run:
                    try:
                        dest_path.parent.mkdir(parents=True, exist_ok=True)
                        file.rename(dest_path) # rename è più sicuro di shutil.move per Path
                    except Exception as e:
                        logger.error(f"Impossibile spostare {rel_path}: {e}")
                else:
                    logger.info(f"[DRY RUN] Sposterebbe {rel_path} in {dest_path.relative_to(self.root_dir).as_posix()}")

            if not dry_run:
                print(f"\nOperazione completata. I file sono stati spostati in:\n{trash_dir.as_posix()}")
                print("Puoi ripristinarli manualmente o eliminare la cartella se sei sicuro.")
            else:
                logger.info(f"Operazione completata (DRY RUN). {len(files_to_delete)} file sarebbero stati spostati.")

        else:  # Eliminazione permanente
            logger.warning("Modalità ELIMINAZIONE PERMANENTE attiva.")
            action_desc = "Eliminazione permanente"

            for file in tqdm(files_to_delete, desc=action_desc):
                rel_path = file.relative_to(self.root_dir).as_posix()
                if not dry_run:
                    try:
                        file.unlink()
                    except PermissionError as e:
                        logger.error(f"Impossibile eliminare (Permesso negato) {rel_path}: {e}")
                    except Exception as e:
                        logger.error(f"Impossibile eliminare {rel_path}: {e}")
                logger.info(f"{'[DRY RUN] Eliminerebbe' if dry_run else 'Eliminato'} permanentemente: {rel_path}")

            if not dry_run:
                logger.info(f"Operazione completata. {len(files_to_delete)} file eliminati permanentemente.")
            else:
                logger.info(f"Operazione completata (DRY RUN). {len(files_to_delete)} file sarebbero stati eliminati.")


# ==============================================================================
# FUNZIONE PRINCIPALE E PARSING ARGOMENTI
# ==============================================================================

def main():
    """Funzione principale per l'esecuzione dello script."""
    parser = argparse.ArgumentParser(
        description="Strumento per la gestione e pulizia dei progetti: rimuove commenti e trova file inutilizzati.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        'root_dir',
        type=str,
        default='.',
        nargs='?',
        help="Directory radice del progetto da analizzare (default: .)"
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help="Esegue lo script senza apportare modifiche al filesystem."
    )

    subparsers = parser.add_subparsers(dest='command', required=True)

    # Subparser per la pulizia
    parser_clean = subparsers.add_parser('clean', help='Rimuove i commenti e aggiunge un header ai file specificati.')
    parser_clean.add_argument(
        '-e', '--extensions',
        nargs='+',
        required=True,
        help="Lista di estensioni di file da pulire (es. .js .py .css)"
    )

    # Subparser per la ricerca di file inutilizzati
    parser_unused = subparsers.add_parser('unused', help='Trova e opzionalmente elimina i file non referenziati.')
    parser_unused.add_argument(
        '-e', '--extensions',
        nargs='+',
        default=None,
        help="Filtra la ricerca solo per queste estensioni (es. .js .css)"
    )
    parser_unused.add_argument(
        '-d', '--delete',
        action='store_true',
        help="Abilita la modalità interattiva di eliminazione dei file trovati."
    )
    parser_unused.add_argument(
        '--no-trash',
        action='store_true',
        help="Forza l'eliminazione permanente (NON RACCOMANDATO). Ignorato se --delete non è specificato."
    )

    args = parser.parse_args()

    try:
        root_dir = Path(args.root_dir).resolve()
        if not root_dir.is_dir():
            logger.error(f"Il percorso specificato non è una directory valida: {args.root_dir}")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Errore nella risoluzione del percorso: {e}")
        sys.exit(1)

    if args.command == 'clean':
        cleaner = ProjectCleaner(root_dir, args.dry_run)
        cleaner.clean_files(args.extensions)
    elif args.command == 'unused':
        analyzer = DependencyAnalyzer(root_dir)
        analyzer.find_unused_files(
            extensions_filter=args.extensions,
            delete=args.delete,
            dry_run=args.dry_run,
            use_trash=not args.no_trash
        )

if __name__ == '__main__':
    main()