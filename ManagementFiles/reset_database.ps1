# ManagementFiles\reset_database.ps1

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
$backendRootPath = "F:\cacio\Documents\Personal_Projects\Rio_Capital_Blog\LitInvestorBlog-backend"
$backendSrcPath = Join-Path $ProjectRoot "src"
$migrationsPath = Join-Path $ProjectRoot "migrations"
$dbPath = Join-Path $backendSrcPath "LitInvestorBlog.db"

$adminUsername = "Porfirio"
$adminEmail = "app.test356@gmail.com"
$adminPassword = "password"

function Write-HostColored {
    param([string]$Message, [string]$Color)
    Write-Host $Message -ForegroundColor $Color
}

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
    Write-HostColored "'LitInvestorBlog.db' rimosso con successo." "Green"
} else {
    Write-Host "File 'LitInvestorBlog.db' non trovato, si procede."
}

Write-HostColored "--- Pulizia Completata ---`n" "Yellow"

Write-HostColored "--- Inizio Esecuzione Comandi Flask ---" "Yellow"

Push-Location -Path $backendRootPath

try {
    $env:FLASK_APP = "src/main.py"
    $env:FLASK_DEBUG = "1"
    Write-HostColored "Variabili d'ambiente Flask impostate nel contesto di '$backendRootPath'." "Cyan"

    Write-Host "Eseguo 'flask db init'..."
    flask db init
    Write-Host "Eseguo 'flask db migrate'..."
    flask db migrate -m "Reset automatico del database"
    Write-Host "Eseguo 'flask db upgrade'..."
    flask db upgrade

    $command = "flask create-admin '$adminUsername' '$adminEmail' '$adminPassword'"
    Write-Host "Eseguo il comando: $command"
    Invoke-Expression $command

    Write-Host "Eseguo 'flask seed-db'..."
    flask seed-db
}
finally {
    Pop-Location
}

Write-HostColored "--- Esecuzione Comandi Flask Completata ---`n" "Yellow"

Write-HostColored "****************************************" "Green"
Write-HostColored "*      RESET COMPLETATO CON SUCCESSO     *" "Green"
Write-HostColored "****************************************" "Green"```
