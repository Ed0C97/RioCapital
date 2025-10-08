# check_project.ps1

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent
$OriginalLocation = Get-Location

try {
    Write-Host "`n"
    Write-Host "--- Inizio controlli sul Backend ---" -ForegroundColor Green

    $BackendPath = Join-Path -Path $ProjectRoot -ChildPath "LitInvestorBlog-backend"
    Set-Location -Path $BackendPath
    Write-Host "Posizione corrente: $(Get-Location)"

    Write-Host "Esecuzione di 'ruff check --ignore E501 src'..."
    ruff check --ignore E501 src

    Write-Host "--- Controlli Backend completati ---" -ForegroundColor Green

    Write-Host "`n"
    Write-Host "--- Inizio controlli sul Frontend ---" -ForegroundColor Cyan

    $FrontendPath = Join-Path -Path $ProjectRoot -ChildPath "LitInvestorBlog-frontend"
    Set-Location -Path $FrontendPath
    Write-Host "Posizione corrente: $(Get-Location)"

    Write-Host "Esecuzione di 'npm run lint'..."
    npm run lint -- --no-fix

    Write-Host "--- Controlli Frontend completati ---" -ForegroundColor Cyan

}
catch {
    Write-Host "`nERRORE: Uno dei comandi è fallito." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
finally {
    Set-Location -Path $OriginalLocation
    Write-Host "`nScript completato. Riportato alla directory originale: $(Get-Location)"
}
