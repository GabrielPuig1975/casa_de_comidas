@echo off
title Casa de Comidas - Desinstalador
color 0C

cd /d "%~dp0"

echo ============================================================
echo     🍽️  CASA DE COMIDAS - Desinstalacion
echo ============================================================
echo.
echo Esto eliminara el sistema y todos sus datos.
echo.
set /p confirm="¿Estas seguro? (s/n): "

if /i "%confirm%" neq "s" (
    echo Desinstalacion cancelada.
    pause
    exit /b
)

echo.
echo Eliminando archivos...

rmdir /s /q frontend\node_modules 2>nul
rmdir /s /q backend\node_modules 2>nul
rmdir /s /q node_modules 2>nul
del /q backend\.env 2>nul

echo.
echo ============================================================
echo              ✅ DESINSTALACION COMPLETADA
echo ============================================================
echo.
echo Puedes eliminar esta carpeta manualmente.
echo.
pause