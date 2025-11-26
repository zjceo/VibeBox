# Script de limpieza completa para VibeBox
# Este script limpia todas las cachés posibles que pueden causar problemas

Write-Host "Iniciando limpieza completa de caches..." -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar caché de Metro
Write-Host "1. Limpiando cache de Metro..." -ForegroundColor Yellow
$metroFiles = Get-ChildItem -Path $env:TEMP -Filter "metro-*" -ErrorAction SilentlyContinue
if ($metroFiles) {
    $metroFiles | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK Cache de Metro eliminada" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro cache de Metro en TEMP" -ForegroundColor Gray
}

# 2. Limpiar caché de React Native
Write-Host "2. Limpiando cache de React Native..." -ForegroundColor Yellow
$reactFiles = Get-ChildItem -Path $env:TEMP -Filter "react-*" -ErrorAction SilentlyContinue
if ($reactFiles) {
    $reactFiles | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK Cache de React Native eliminada" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro cache de React Native" -ForegroundColor Gray
}

# 3. Limpiar node_modules/.cache
Write-Host "3. Limpiando node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK node_modules/.cache eliminado" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro node_modules/.cache" -ForegroundColor Gray
}

# 4. Limpiar caché de Gradle (local del proyecto)
Write-Host "4. Limpiando cache de Gradle (proyecto)..." -ForegroundColor Yellow
if (Test-Path "android\.gradle") {
    Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK android/.gradle eliminado" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro android/.gradle" -ForegroundColor Gray
}

# 5. Limpiar build de Android
Write-Host "5. Limpiando build de Android..." -ForegroundColor Yellow
if (Test-Path "android\app\build") {
    Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK android/app/build eliminado" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro android/app/build" -ForegroundColor Gray
}

if (Test-Path "android\build") {
    Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK android/build eliminado" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro android/build" -ForegroundColor Gray
}

# 6. Limpiar caché de Gradle (global del usuario)
Write-Host "6. Limpiando cache de Gradle (global)..." -ForegroundColor Yellow
$gradleCachePath = "$env:USERPROFILE\.gradle\caches"
if (Test-Path $gradleCachePath) {
    # Limpiar específicamente la caché de Kotlin DSL que suele causar problemas
    $kotlinDslPath = "$gradleCachePath\8.7\kotlin-dsl"
    if (Test-Path $kotlinDslPath) {
        Remove-Item -Path $kotlinDslPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   OK Cache de Kotlin DSL eliminada" -ForegroundColor Green
    }
    
    # También limpiar toda la caché de Gradle 8.7 si existe
    $gradle87Path = "$gradleCachePath\8.7"
    if (Test-Path $gradle87Path) {
        Remove-Item -Path $gradle87Path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   OK Cache de Gradle 8.7 eliminada" -ForegroundColor Green
    }
    
    Write-Host "   Info Cache global de Gradle limpiada" -ForegroundColor Gray
} else {
    Write-Host "   Info No se encontro cache global de Gradle" -ForegroundColor Gray
}

# 7. Limpiar watchman (si está instalado)
Write-Host "7. Verificando Watchman..." -ForegroundColor Yellow
$watchmanCheck = Get-Command watchman -ErrorAction SilentlyContinue
if ($watchmanCheck) {
    Write-Host "   Info Watchman esta instalado. Ejecuta 'watchman watch-del-all' si es necesario" -ForegroundColor Gray
} else {
    Write-Host "   Info Watchman no esta instalado" -ForegroundColor Gray
}

# 8. Limpiar caché de npm
Write-Host "8. Limpiando cache de npm..." -ForegroundColor Yellow
$npmResult = npm cache clean --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK Cache de npm limpiada" -ForegroundColor Green
} else {
    Write-Host "   Advertencia Error al limpiar cache de npm" -ForegroundColor Red
}

# 9. Verificar y limpiar archivos temporales de Metro
Write-Host "9. Buscando archivos temporales de Metro..." -ForegroundColor Yellow
$tempFiles = Get-ChildItem -Path $env:TEMP -Filter "*metro*" -ErrorAction SilentlyContinue
if ($tempFiles) {
    $tempFiles | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK Archivos temporales de Metro eliminados" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontraron archivos temporales de Metro" -ForegroundColor Gray
}

# 10. Limpiar caché de Watchman (si existe)
Write-Host "10. Verificando cache de Watchman..." -ForegroundColor Yellow
$watchmanCacheFiles = Get-ChildItem -Path $env:TEMP -Filter "watchman-*" -ErrorAction SilentlyContinue
if ($watchmanCacheFiles) {
    $watchmanCacheFiles | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK Cache de Watchman eliminada" -ForegroundColor Green
} else {
    Write-Host "   Info No se encontro cache de Watchman" -ForegroundColor Gray
}

Write-Host ""
Write-Host "OK Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "=== PROBLEMA CRITICO DETECTADO ===" -ForegroundColor Red
Write-Host "Si la cache se corrompe constantemente, el problema es del SISTEMA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUCIONES URGENTES:" -ForegroundColor Cyan
Write-Host "1. EXCLUIR del antivirus:" -ForegroundColor White
Write-Host "   C:\Users\$env:USERNAME\.gradle" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Ejecutar PowerShell como Administrador" -ForegroundColor White
Write-Host ""
Write-Host "3. Verificar permisos:" -ForegroundColor White
Write-Host "   icacls `"$env:USERPROFILE\.gradle`" /grant `"$env:USERNAME`":F /T" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos recomendados:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: npm start -- --reset-cache" -ForegroundColor White
Write-Host "   2. En otra terminal: npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Si el problema persiste, intenta:" -ForegroundColor Yellow
Write-Host "   - Eliminar node_modules y ejecutar: npm install" -ForegroundColor White
Write-Host "   - Eliminar TODA la carpeta .gradle: Remove-Item -Recurse -Force `$env:USERPROFILE\.gradle" -ForegroundColor White
Write-Host "   - Verificar android/settings.gradle no tenga resolutionStrategy con version null" -ForegroundColor White
Write-Host ""

