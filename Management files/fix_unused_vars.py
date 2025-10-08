import os
import re
import shutil

# --- INCOLLA QUI IL LOG DI ESLINT ---
ESLINT_LOG = r"""
F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\AnalyticsChart.jsx
  137:9  error  Unexpected lexical declaration in case block  no-case-declarations

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\ArticleCarousel.jsx
  143:35  error  'index' is defined but never used  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\Footer.jsx
  36:14  error  'error' is defined but never used  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\GridRelatedArticles.jsx
   3:27  error  'useEffect' is defined but never used. Allowed unused vars must match /^[A-Z_]/u             no-unused-vars
  37:39  error  'fetchUrl' is defined but never used                                                         no-unused-vars
  38:20  error  'setArticles' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\InteractionBar.jsx
  10:36  error  'onUpdate' is defined but never used  no-unused-vars
  61:16  error  'error' is defined but never used     no-unused-vars
  87:16  error  'error' is defined but never used     no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\RichTextEditor.jsx
  214:18  error  'e' is defined but never used  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\components\ShareButton.jsx
   30:21  error  'setIsLoading' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  116:18  error  'error' is defined but never used                                                             no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\hooks\useAuth.jsx
   35:14  error    'error' is defined but never used                                                                                               no-unused-vars
   61:14  error    'error' is defined but never used                                                                                               no-unused-vars
   84:14  error    'error' is defined but never used                                                                                               no-unused-vars
  134:14  error    'error' is defined but never used                                                                                               no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\AboutPage.jsx
  11:8   error  'remarkBreaks' is defined but never used. Allowed unused vars must match /^[A-Z_]/u             no-unused-vars
  12:8   error  'rehypeRaw' is defined but never used. Allowed unused vars must match /^[A-Z_]/u                no-unused-vars
  13:8   error  'rehypeSanitize' is defined but never used. Allowed unused vars must match /^[A-Z_]/u           no-unused-vars
  15:8   error  'clsx' is defined but never used. Allowed unused vars must match /^[A-Z_]/u                     no-unused-vars
  22:11  error  'user' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u            no-unused-vars
  31:10  error  'isJustified' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u     no-unused-vars
  31:23  error  'setIsJustified' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\AdminAnalyticsPage.jsx
   3:27  error  'useEffect' is defined but never used. Allowed unused vars must match /^[A-Z_]/u         no-unused-vars
  54:17  error  'isAdmin' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\AdminDashboard.jsx
  29:10  error  'categories' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  99:14  error  'error' is defined but never used                                                           no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\AdminPage.jsx
  101:9   error  'Icon' is defined but never used                                                                no-unused-vars
  282:16  error  'error' is defined but never used                                                               no-unused-vars
  459:12  error  'analyticsError' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  568:14  error  'error' is defined but never used                                                               no-unused-vars
  591:14  error  'error' is defined but never used                                                               no-unused-vars
  607:14  error  'error' is defined but never used                                                               no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\ArchivePage.jsx
  456:27  error  'isLast' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\ArticleDetailPage.jsx
  87:25  error  'node' is defined but never used  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\CommentModerationPage.jsx
  59:17  error  'isAdmin' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\ContactPage.jsx
  44:14  error  'error' is defined but never used  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\DonatePage.jsx
    3:10  error  'cn' is defined but never used. Allowed unused vars must match /^[A-Z_]/u                              no-unused-vars
   42:20  error  'useStripe' is defined but never used. Allowed unused vars must match /^[A-Z_]/u                       no-unused-vars
  152:10  error  'cardDetails' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u            no-unused-vars
  248:9   error  'handleCardInputChange' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-frontend\src\pages\MyArticlesPage.jsx
  50:17  error  'isAdmin' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u   no-unused-vars
  51:9   error  'navigate' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
"""


def parse_eslint_log(log):
    """Estrae le informazioni necessarie dal log di ESLint."""
    tasks = []
    current_file = None

    # Regex per trovare la riga, la colonna e il nome della variabile
    error_regex = re.compile(
        r"^\s*(\d+):\d+.*?'([^']*)'\s+is (?:defined|assigned a value) but never used.*no-unused-vars")

    for line in log.strip().split('\n'):
        line = line.strip()
        if not line:
            continue

        # Se la riga sembra un percorso di file, la salviamo
        if os.path.exists(line):
            current_file = line
            continue

        match = error_regex.search(line)
        if current_file and match:
            line_number = int(match.group(1))
            var_name = match.group(2)
            tasks.append({'file': current_file, 'line': line_number, 'var': var_name})

    return tasks


def fix_unused_vars(tasks):
    """Modifica i file per rimuovere le variabili non utilizzate."""
    modified_files = set()

    for task in tasks:
        file_path = task['file']
        line_number = task['line']
        var_name = task['var']

        try:
            # Crea un backup la prima volta che modifichiamo un file
            if file_path not in modified_files:
                backup_path = file_path + '.bak'
                print(f"Creando backup: {os.path.basename(backup_path)}")
                shutil.copy2(file_path, backup_path)
                modified_files.add(file_path)

            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            if line_number > len(lines):
                print(f"ATTENZIONE: Numero di riga {line_number} non valido per il file {file_path}")
                continue

            target_line = lines[line_number - 1]

            # Logica di rimozione "intelligente"
            # Tenta di rimuovere la variabile e una virgola, se presente
            # Pattern 1: , var_name
            new_line, count = re.subn(r',\s*\b' + re.escape(var_name) + r'\b', '', target_line)
            if not count:
                # Pattern 2: var_name,
                new_line, count = re.subn(r'\b' + re.escape(var_name) + r'\b,\s*', '', target_line)
            if not count:
                # Pattern 3: var_name (da sola, es. in un import o parametro singolo)
                new_line, count = re.subn(r'\b' + re.escape(var_name) + r'\b', '', target_line)

            # Controlla se la linea è diventata vuota o contiene solo "{} , []"
            if re.match(r'^\s*({}|\[\]|,)\s*$', new_line.strip()):
                print(
                    f"ATTENZIONE: La modifica potrebbe aver corrotto la riga {line_number} in {os.path.basename(file_path)}. Controllare manualmente.")

            lines[line_number - 1] = new_line

            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)

            print(f"Rimosso '{var_name}' da {os.path.basename(file_path)}:{line_number}")

        except Exception as e:
            print(f"ERRORE durante l'elaborazione di {file_path}: {e}")


if __name__ == "__main__":
    print("--- Inizio la correzione automatica delle variabili non utilizzate ---")
    tasks_to_run = parse_eslint_log(ESLINT_LOG)
    if not tasks_to_run:
        print("Nessun errore 'no-unused-vars' trovato nel log.")
    else:
        fix_unused_vars(tasks_to_run)
        print("\n--- Correzione completata! ---")
        print(f"IMPORTANTE: Sono stati creati file di backup '.bak' per tutti i file modificati.")
        print("Per favore, controlla le modifiche. Se qualcosa non va, ripristina dal backup.")