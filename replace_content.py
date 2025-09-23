import os
import re

# --- CONFIGURAZIONE ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
EXCLUDED_ITEMS = {os.path.basename(__file__), 'rename_filesystem.py', 'node_modules', 'venv', '.venv', 'env', '.git',
                  '.idea', '.vscode', '__pycache__', 'build', 'dist'}

# --- REGOLE DI SOSTITUZIONE (L'ORDINE È FONDAMENTALE!) ---
# Eseguite dalla più specifica alla più generica per evitare errori.
REPLACEMENT_RULES = [
    # REGOLA 1 (LA PIÙ IMPORTANTE): Sostituzione per percorsi e nomi tecnici.
    # Cerca 'finblog' (case-insensitive) ma solo quando è parte di una parola più grande
    # o è una parola intera, e lo sostituisce con la versione attaccata.
    # Esempio: 'finblog-frontend' -> 'RioCapitalBlog-frontend'
    # Esempio: 'FinblogUser' -> 'RioCapitalBlogUser'
    (re.compile(r'finblog', re.IGNORECASE), 'RioCapitalBlog'),

    # REGOLA 2: Sostituzione per testo leggibile (con spazi).
    # Questa regola viene applicata DOPO la prima. Per evitare di sovrascrivere
    # la regola precedente, la applichiamo solo ai file "di testo" (es. .html, .md)
    # e non ai file di codice.
    (re.compile(r'RioCapitalBlog', re.IGNORECASE), 'Rio Capital Blog'),
]

# Estensioni di file da considerare "testo per utente" dove applicare la Regola 2
USER_TEXT_EXTENSIONS = {'.html', '.md', '.txt'}


def replace_content_in_files():
    print("\n--- FASE 2: Inizio sostituzione contenuto nei file ---\n")

    rule_technical = REPLACEMENT_RULES[0]
    rule_human = REPLACEMENT_RULES[1]

    for dirpath, dirnames, filenames in os.walk(ROOT_DIR):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_ITEMS]

        for filename in filenames:
            if filename in EXCLUDED_ITEMS:
                continue

            filepath = os.path.join(dirpath, filename)
            file_ext = os.path.splitext(filename)[1].lower()

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except IOError:
                continue

            original_content = content

            # Applica sempre la regola tecnica (RioCapitalBlog)
            content = rule_technical[0].sub(rule_technical[1], content)

            # Applica la regola per il testo umano (Rio Capital Blog) SOLO su file specifici
            if file_ext in USER_TEXT_EXTENSIONS:
                content = rule_human[0].sub(rule_human[1], content)

            if content != original_content:
                print(f"Modificato contenuto in: {os.path.relpath(filepath, ROOT_DIR)}")
                try:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                except IOError as e:
                    print(f"  -> ERRORE scrittura: {e}")

    print("\n--- FASE 2: Sostituzione contenuto completata. ---")


if __name__ == "__main__":
    print("\nATTENZIONE: Questo script modificherà il contenuto dei file in modo permanente.")
    confirm = input("Hai eseguito la FASE 1 e hai ancora il backup? Digita 'si' per procedere con la FASE 2: ")
    if confirm.lower() == 'si':
        replace_content_in_files()
    else:
        print("Operazione annullata.")
