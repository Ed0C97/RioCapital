# start-dev.ps1

[CmdletBinding()]
param (

    [switch]$Reset
)

$scriptPath = $PSScriptRoot
$backendPath = Join-Path $scriptPath "LitInvestorBlog-backend"
$frontendPath = Join-Path $scriptPath "LitInvestorBlog-frontend"
$dbPath = Join-Path $backendPath "src\LitInvestorBlog.db"
$flaskAppName = "src/main.py"

if ($Reset) {
    Write-Host "--- ESEGUO IL RESET DEL DATABASE ---" -ForegroundColor Yellow

    Write-Host "Cerco e termino eventuali processi server Flask precedenti..."

    $flaskProcesses = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' AND CommandLine LIKE '%flask%run%'"

    if ($flaskProcesses) {
        $flaskProcesses | ForEach-Object {
            Write-Host "Trovato e terminato processo Flask con PID: $($_.ProcessId)" -ForegroundColor Magenta
            Stop-Process -Id $_.ProcessId -Force
        }

        Start-Sleep -Seconds 2
    } else {
        Write-Host "Nessun processo Flask precedente trovato."
    }

    if (Test-Path $dbPath) {
        Write-Host "Elimino il database: $dbPath"
        Remove-Item -Path $dbPath -Force -ErrorAction SilentlyContinue

        if (Test-Path $dbPath) {
            Write-Host "ERRORE: Impossibile eliminare il database. Potrebbe essere ancora bloccato." -ForegroundColor Red
            return
        }
    } else {
        Write-Host "Database non trovato. Salto l'eliminazione."
    }

    Write-Host "Creo l'utente admin (admin / test@test.com / password)..."
    Set-Location $backendPath
    $env:FLASK_APP = "wsgi:app"

    "admin`ntest@test.com`npassword`npassword" | flask create-admin
    Set-Location $scriptPath
}

Write-Host "`n--- AVVIO DEI SERVER ---`n" -ForegroundColor Cyan

Write-Host "Avvio del server Backend (Flask)..."
$backendCommand = "Set-Location '$backendPath'; `$env:FLASK_APP = 'wsgi:app'; flask run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Write-Host "Avvio del server Frontend (Vite)..."
$frontendCommand = "Set-Location '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host "`nServer avviati. Controlla le nuove finestre PowerShell." -ForegroundColor Green
