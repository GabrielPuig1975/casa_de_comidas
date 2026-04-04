@echo off
title Casa de Comidas - Configuracion inicial
color 0A

cd /d "%~dp0"

echo ============================================================
echo     🍽️  CASA DE COMIDAS - Configuracion inicial
echo ============================================================
echo.
echo Esto tomara unos minutos. Por favor espera...
echo.

:: Verificar Node.js
echo [1/4] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

:: Instalar pnpm
echo.
echo [2/4] Instalando pnpm...
call npm install -g pnpm
echo ✅ pnpm instalado

:: Instalar dependencias
echo.
echo [3/4] Instalando dependencias...
echo (Esto puede tomar varios minutos)

echo Instalando dependencias raiz...
call pnpm install

echo Instalando frontend...
cd frontend
call pnpm install
cd ..

echo Instalando backend...
cd backend
call pnpm install
cd ..

echo ✅ Dependencias instaladas

:: Configurar base de datos
echo.
echo [4/4] Configurando base de datos...
echo.

set /p db_user="Usuario MySQL [root]: "
if "%db_user%"=="" set db_user=root
set /p db_password="Contrasena MySQL: "

:: Crear archivo .env
(
echo PORT=3000
echo DB_HOST=localhost
echo DB_USER=%db_user%
echo DB_PASSWORD=%db_password%
echo DB_NAME=casa_comidas
echo JWT_SECRET=clave_segura_%random%%random%%random%
echo MERCADOPAGO_ACCESS_TOKEN=
echo MERCADOPAGO_PUBLIC_KEY=
) > backend\.env

:: Crear base de datos
mysql -u %db_user% -p%db_password% < database.sql

echo.
echo ============================================================
echo              ✅ CONFIGURACION COMPLETADA
echo ============================================================
echo.
echo Ahora puedes hacer doble clic en "INICIAR.bat"
echo.
pause