# reset_database.ps1 - VERSIONE FINALE E CORRETTA

# --- INIZIO CONFIGURAZIONE ---
$backendRootPath = "F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\RioCapitalBlog-backend"
$backendSrcPath = Join-Path $backendRootPath "src"
$migrationsPath = Join-Path $backendRootPath "migrations"
$dbPath = Join-Path $backendSrcPath "RioCapitalBlog.db"

$adminUsername = "Porfirio"
$adminEmail = "app.test356@gmail.com"
$adminPassword = "password"
# --- FINE CONFIGURAZIONE ---

function Write-HostColored {
    param([string]$Message, [string]$Color)
    Write-Host $Message -ForegroundColor $Color
}

# --- 1. Pulizia ---
Write-HostColored "--- Inizio Pulizia ---" "Yellow"

if (Test-Path -Path $migrationsPath) {
    Write-Host "Rimozione cartella '$migrationsPath'..."
    Remove-Item -Path $migrationsPath -Recurse -Force
    Write-HostColored "'migrations' rimossa con successo." "Green"
} else {
    Write-Host "Cartella 'migrations' non trovata, si procede."
}

if (Test-Path -Path $dbPath) {
    Write-Host "Rimozione file '$dbPath'..."
    Remove-Item -Path $dbPath -Force
    Write-HostColored "'RioCapitalBlog.db' rimosso con successo." "Green"
} else {
    Write-Host "File 'RioCapitalBlog.db' non trovato, si procede."
}

Write-HostColored "--- Pulizia Completata ---`n" "Yellow"

# --- 2. Esecuzione Comandi dalla Root del Backend ---
Write-HostColored "--- Inizio Esecuzione Comandi Flask ---" "Yellow"

Push-Location -Path $backendRootPath

try {
    # Imposta le variabili d'ambiente necessarie per Flask
    $env:FLASK_APP = "src/main.py"
    $env:FLASK_DEBUG = "1"
    Write-HostColored "Variabili d'ambiente Flask impostate nel contesto di '$backendRootPath'." "Cyan"

    # Esegue i comandi di Flask-Migrate
    Write-Host "Eseguo 'flask db init'..."
    flask db init
    Write-Host "Eseguo 'flask db migrate'..."
    flask db migrate -m "Reset automatico del database"
    Write-Host "Eseguo 'flask db upgrade'..."
    flask db upgrade

    # --- BLOCCO MODIFICATO ---
    # Costruiamo la stringa del comando completa
    $command = "flask create-admin '$adminUsername' '$adminEmail' '$adminPassword'"
    Write-Host "Eseguo il comando: $command"
    # Usiamo Invoke-Expression per eseguire la stringa come un comando
    Invoke-Expression $command
    # -------------------------

    # Esegue il comando per popolare le categorie
    Write-Host "Eseguo 'flask seed-db'..."
    flask seed-db
}
finally {
    # Torna alla directory originale, anche se si verificano errori
    Pop-Location
}

Write-HostColored "--- Esecuzione Comandi Flask Completata ---`n" "Yellow"

Write-HostColored "****************************************" "Green"
Write-HostColored "*      RESET COMPLETATO CON SUCCESSO     *" "Green"
Write-HostColored "****************************************" "Green"```