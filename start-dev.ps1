# Script SEMPLICE per avviare l'ambiente di sviluppo FinBlog
# ESEGUI QUESTO SCRIPT SOLO DOPO AVER ATTIVATO L'AMBIENTE VIRTUALE (rcblog-venv)

[CmdletBinding()]
param (
    # Esegue un reset completo del database, eliminando quello vecchio e creando un nuovo admin.
    [switch]$Reset
)

# --- CONFIGURAZIONE ---
# Usa il percorso dello script come base per trovare le cartelle backend e frontend.
# Questo rende lo script più portabile.
$scriptPath = $PSScriptRoot
$backendPath = Join-Path $scriptPath "finblog-backend"
$frontendPath = Join-Path $scriptPath "finblog-frontend"
$dbPath = Join-Path $backendPath "src\finblog.db"
$flaskAppName = "src/main.py"

# --- LOGICA DI RESET ---
if ($Reset) {
    Write-Host "--- ESEGUO IL RESET DEL DATABASE ---" -ForegroundColor Yellow

    # PRIMA: Cerca di terminare vecchi processi Flask per sbloccare il DB.
    Write-Host "Cerco e termino eventuali processi server Flask precedenti..."
    # Cerca processi Python che eseguono il tuo specifico script Flask
    $flaskProcesses = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' AND CommandLine LIKE '%flask%run%'"

    if ($flaskProcesses) {
        $flaskProcesses | ForEach-Object {
            Write-Host "Trovato e terminato processo Flask con PID: $($_.ProcessId)" -ForegroundColor Magenta
            Stop-Process -Id $_.ProcessId -Force
        }
        # Attendi un istante per dare tempo al sistema di rilasciare il file
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Nessun processo Flask precedente trovato."
    }

    # SECONDO: Ora prova a eliminare il database
    if (Test-Path $dbPath) {
        Write-Host "Elimino il database: $dbPath"
        Remove-Item -Path $dbPath -Force -ErrorAction SilentlyContinue # Continua anche se fallisce
        # Verifica se l'eliminazione è riuscita
        if (Test-Path $dbPath) {
            Write-Host "ERRORE: Impossibile eliminare il database. Potrebbe essere ancora bloccato." -ForegroundColor Red
            return # Interrompi lo script se non si può eliminare il DB
        }
    } else {
        Write-Host "Database non trovato. Salto l'eliminazione."
    }

    # TERZO: Crea l'utente admin
    Write-Host "Creo l'utente admin (admin / test@test.com / password)..."
    Set-Location $backendPath
    $env:FLASK_APP = $flaskAppName
    # L'input pipe funziona, ma è meglio essere espliciti
    "admin`ntest@test.com`npassword`npassword" | flask create-admin
    Set-Location $scriptPath
}

# --- AVVIO DEI SERVER ---
Write-Host "`n--- AVVIO DEI SERVER ---`n" -ForegroundColor Cyan

# Avvia il Backend in una nuova finestra
Write-Host "Avvio del server Backend (Flask)..."
$backendCommand = "Set-Location '$backendPath'; `$env:FLASK_APP = '$flaskAppName'; flask run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Avvia il Frontend in un'altra nuova finestra
Write-Host "Avvio del server Frontend (Vite)..."
$frontendCommand = "Set-Location '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host "`nServer avviati. Controlla le nuove finestre PowerShell." -ForegroundColor Green