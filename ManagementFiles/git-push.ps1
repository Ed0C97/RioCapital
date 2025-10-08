[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Imposta la directory root del progetto
$ProjectRoot = Split-Path -Path $PSScriptRoot -Parent

# Vai nella root del progetto
Set-Location $ProjectRoot

Write-Host "Directory progetto: $ProjectRoot"
Write-Host "Aggiungo tutte le modifiche..." -ForegroundColor Cyan
git add .

Write-Host "Commit in corso con messaggio: '$Message'" -ForegroundColor Yellow
git commit -m "$Message"

Write-Host "Push su origin/main..." -ForegroundColor Green
git push origin main

Write-Host "Operazione completata." -ForegroundColor Cyan
