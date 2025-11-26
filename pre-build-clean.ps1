# Limpiar cache de transforms antes de build
Write-Host "Limpiando cache de transforms..." -ForegroundColor Yellow
$transformsPath = "$env:USERPROFILE\.gradle\caches\transforms-4"
if (Test-Path $transformsPath) {
    Remove-Item -Path $transformsPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "OK Cache limpiada" -ForegroundColor Green
}
