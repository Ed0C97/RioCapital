import os
import shutil

# --- CONFIGURAZIONE ---
# Percorso base del progetto
BASE_DIR = r"F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog"

# Lista dei percorsi relativi dei file da modificare
FILES_TO_MODIFY = [
    r"LitInvestorBlog-frontend\src\App.jsx",
    r"LitInvestorBlog-frontend\src\components\ArticleActions.jsx",
    r"LitInvestorBlog-frontend\src\components\CommentSystem.jsx",
    r"LitInvestorBlog-frontend\src\components\FavoriteButton.jsx",
    r"LitInvestorBlog-frontend\src\components\InteractionBar.jsx",
    # Escludiamo AuthProvider.jsx stesso per sicurezza
    # r"LitInvestorBlog-frontend\src\hooks\AuthProvider.jsx",
    r"LitInvestorBlog-frontend\src\pages\AboutPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\AdminAnalyticsPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\AdminPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\ArticleEditorPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\CommentModerationPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\CompleteProfilePage.jsx",
    r"LitInvestorBlog-frontend\src\pages\DonatePage.jsx",
    r"LitInvestorBlog-frontend\src\pages\FavoritesPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\LoginPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\MyArticlesPage.jsx",
    r"LitInvestorBlog-frontend\src\pages\ProfilePage.jsx",
    r"LitInvestorBlog-frontend\src\pages\RegisterPage.jsx",
]

# Definiamo le sostituzioni multiple e corrette da applicare
REPLACEMENTS = {
    # Corregge l'import del file
    "from '../hooks/AuthProvider.jsx'": "from '../hooks/AuthContext.js'",
    # Corregge il nome dell'hook importato
    "import { authProvider }": "import { useAuth }",
    # Corregge la chiamata all'hook
    "authProvider()": "useAuth()",
}


def apply_fixes(base_path, relative_paths):
    """
    Applica le sostituzioni a una lista di file.
    Crea un backup (.bak) per ogni file modificato.
    """
    print(f"Analizzando {len(relative_paths)} file...\n")
    modified_count = 0

    for rel_path in relative_paths:
        file_path = os.path.join(base_path, rel_path)

        if not os.path.exists(file_path):
            print(f"ATTENZIONE: File non trovato, saltato: {rel_path}")
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # Applica tutte le sostituzioni definite
            for old_str, new_str in REPLACEMENTS.items():
                content = content.replace(old_str, new_str)

            # Scrive il file solo se è stato effettivamente modificato
            if content != original_content:
                # Crea un backup prima di sovrascrivere
                backup_path = file_path + '.bak'
                shutil.copy2(file_path, backup_path)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"✅ Modificato: {rel_path}")
                modified_count += 1

        except Exception as e:
            print(f"❌ ERRORE durante l'elaborazione di {rel_path}: {e}")

    print(f"\n--- Operazione completata. {modified_count} file sono stati modificati. ---")
    if modified_count > 0:
        print("Sono stati creati file di backup (.bak) per sicurezza.")
        print("Dopo aver verificato che tutto funzioni, puoi cancellarli.")


if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT PER CORREGGERE GLI IMPORT E L'USO DELL'HOOK DI AUTENTICAZIONE")
    print("=" * 60)
    print("Questo script eseguirà le seguenti sostituzioni:")
    for old, new in REPLACEMENTS.items():
        print(f"  - '{old}' -> '{new}'")

    confirm = input("\nSei sicuro di voler procedere? (Digita 'si' per iniziare): ")
    if confirm.lower() == 'si':
        apply_fixes(BASE_DIR, FILES_TO_MODIFY)
    else:
        print("Operazione annullata.")