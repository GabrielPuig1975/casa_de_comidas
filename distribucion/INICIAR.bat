@echo off
title Casa de Comidas - Sistema de Gestion
color 0A

cd /d "%~dp0"

:: Abrir el navegador
start http://localhost:5173

:: Iniciar el sistema
echo.
echo ============================================================
echo     🍽️  CASA DE COMIDAS - Iniciando el sistema...
echo ============================================================
echo.
echo El navegador se abrira automaticamente
echo No cierres esta ventana mientras uses el sistema
echo.
echo ============================================================
echo.

pnpm run dev

pause