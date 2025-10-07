import os

# --- CONFIGURAZIONE ---

# 1. Percorsi dei progetti (CORRETTI PER WINDOWS CON r'...')
FRONTEND_PROJECT_ROOT = r'F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\RioCapitalBlog-frontend'
BACKEND_PROJECT_ROOT = r'F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\RioCapitalBlog-backend'

# 2. Mappa di sostituzione
REPLACEMENT_MAP = {
    # Frontend
    '/articolo/': '/article/',
    # Backend
    '/api/articolo/': '/api/article/'
}

# 3. Estensioni e cartelle da ignorare (invariate)
FRONTEND_EXTENSIONS = ('.js', '.jsx', '.json')
BACKEND_EXTENSIONS = ('.py',)
EXCLUDED_DIRS = ('node_modules', '.git', 'build', 'dist', 'public', '__pycache__', 'venv', '.venv')


# --- FINE CONFIGURAZIONE ---


def process_file(file_path, route_map):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"  -> Errore durante la lettura di {file_path}: {e}")
        return False

    original_content = content
    modified_content = content

    # --- LOGICA DI SOSTITUZIONE CORRETTA (PIÙ SEMPLICE E POTENTE) ---
    for old_string, new_string in route_map.items():
        modified_content = modified_content.replace(old_string, new_string)
    # ----------------------------------------------------------------

    if modified_content != original_content:
        print(f"  -> Sostituzione eseguita in: {os.path.basename(file_path)}")
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            return True
        except Exception as e:
            print(f"  -> ERRORE: Impossibile scrivere su {file_path}: {e}")
            return False

    return False


def run_refactor(project_path, extensions, route_map, project_name):
    if not project_path or not os.path.exists(project_path):
        print(f"--- Sostituzione per {project_name} saltata: percorso non valido o non configurato. ---")
        return 0

    print(f"--- Avvio scansione del {project_name}: {project_path} ---")
    modified_count = 0
    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for file in files:
            if file.endswith(extensions):
                file_path = os.path.join(root, file)
                if process_file(file_path, route_map):
                    modified_count += 1
    return modified_count


def main():
    total_modified = 0

    total_modified += run_refactor(FRONTEND_PROJECT_ROOT, FRONTEND_EXTENSIONS, REPLACEMENT_MAP, "Frontend")
    print("\n")
    total_modified += run_refactor(BACKEND_PROJECT_ROOT, BACKEND_EXTENSIONS, REPLACEMENT_MAP, "Backend")

    print("\n--- Operazione completata ---")
    if total_modified > 0:
        print(f"✅ Sono stati modificati {total_modified} file.")
        print("Consiglio: Rivedi le modifiche con 'git diff' prima di fare un commit.")
    else:
        print("ℹ️ Nessuna stringa da sostituire è stata trovata nei file.")


if __name__ == '__main__':
    main()