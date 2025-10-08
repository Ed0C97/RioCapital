# ManagementFiles\start-dev.ps1

[CmdletBinding()]
param (
    [switch]$Reset
)

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
$BackendPath = Join-Path $ProjectRoot "LitInvestorBlog-backend"
$FrontendPath = Join-Path $ProjectRoot "LitInvestorBlog-frontend"
$DbPath = Join-Path $BackendPath "src\LitInvestorBlog.db"

$VenvName = "litinvestorblog"
$VenvActivateScript = Join-Path $BackendPath "$VenvName\Scripts\activate.ps1"

if ($Reset) {
    Write-Host "--- ESEGUO IL RESET DEL DATABASE ---" -ForegroundColor Yellow
    Write-Host "Cerco e termino eventuali processi server Flask precedenti..."
    $flaskProcesses = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' AND CommandLine LIKE '%flask%run%'"
    if ($flaskProcesses) {
        $flaskProcesses | ForEach-Object {
            Write-Host ("Trovato e terminato processo Flask con PID: {0}" -f $_.ProcessId) -ForegroundColor Magenta
            Stop-Process -Id $_.ProcessId -Force
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Nessun processo Flask precedente trovato."
    }

    if (Test-Path $DbPath) {
        Write-Host "Elimino il database: $DbPath"
        Remove-Item -Path $DbPath -Force -ErrorAction SilentlyContinue
        if (Test-Path $DbPath) {
            Write-Host "ERRORE: Impossibile eliminare il database. Potrebbe essere ancora bloccato." -ForegroundColor Red
            return
        }
    } else {
        Write-Host "Database non trovato. Salto l'eliminazione."
    }

    Write-Host "Creo l'utente admin (admin / test@test.com / password)..."
    $createAdminCommand = "& `"$VenvActivateScript`"; Set-Location '$BackendPath'; `$env:FLASK_APP = 'wsgi:app'; 'admin`ntest@test.com`npassword`npassword' | flask create-admin"
    Start-Process powershell -ArgumentList "-Command", $createAdminCommand -Wait
    Write-Host "Creazione utente admin completata."
}

Write-Host "`n--- AVVIO DEI SERVER ---`n" -ForegroundColor Cyan

Write-Host "Avvio del server Backend (Flask)..."
$backendCommand = "& `"$VenvActivateScript`"; Set-Location '$BackendPath'; `$env:FLASK_APP = 'wsgi:app'; flask run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Write-Host "Avvio del server Frontend (Vite)..."
$frontendCommand = "Set-Location '$FrontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host "`nServer avviati. Controlla le nuove finestre PowerShell." -ForegroundColor Green
