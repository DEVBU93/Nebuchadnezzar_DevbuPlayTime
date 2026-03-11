@echo off
title 🎮 DevbuPlaytime — Iniciando...
color 0D
cls

echo.
echo  ██████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗
echo  ██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║
echo  ██║  ██║█████╗  ██║   ██║██████╔╝██║   ██║
echo  ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██╗██║   ██║
echo  ██████╔╝███████╗ ╚████╔╝ ██████╔╝╚██████╔╝
echo  ╚═════╝ ╚══════╝  ╚═══╝  ╚═════╝  ╚═════╝
echo.
echo  ████████████████████████████████████████████
echo   DEVBUPLAYTIME — Plataforma Educativa
echo   by DEVBU93 - rubenrodriguez.f.93@gmail.com
echo  ████████████████████████████████████████████
echo.

:: ─── Detectar donde está el proyecto ───────────────────────
set "PROJECT_DIR=%~dp0"
:: Subir un nivel si el script está en la carpeta raíz
if exist "%PROJECT_DIR%backend\package.json" (
    set "ROOT=%PROJECT_DIR%"
) else if exist "%PROJECT_DIR%..\backend\package.json" (
    set "ROOT=%PROJECT_DIR%.."
) else (
    echo [ERROR] No se encuentra la carpeta del proyecto.
    echo Asegurate de que este script esta en la raiz de Nebuchadnezzar_DevbuPlayTime
    echo.
    pause
    exit /b 1
)

echo  [1/6] Comprobando requisitos...

:: Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo  [!] Docker no esta instalado o no esta arrancado.
    echo      Descargalo en: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo  [OK] Docker detectado

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [!] Node.js no esta instalado.
    echo      Descargalo en: https://nodejs.org (version 22 LTS)
    echo.
    pause
    exit /b 1
)
echo  [OK] Node.js detectado

:: Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo  [!] npm no esta disponible.
    pause
    exit /b 1
)
echo  [OK] npm detectado

echo.
echo  [2/6] Arrancando base de datos PostgreSQL (Docker)...
cd /d "%ROOT%"
docker-compose up -d postgres >nul 2>&1
if errorlevel 1 (
    echo  [!] Error arrancando Docker. Asegurate de que Docker Desktop esta abierto.
    pause
    exit /b 1
)
echo  [OK] PostgreSQL arrancado en puerto 5432

:: Esperar a que PostgreSQL esté listo
echo  [..] Esperando 5 segundos a que PostgreSQL inicialice...
timeout /t 5 /nobreak >nul

echo.
echo  [3/6] Instalando dependencias backend (si es necesario)...
cd /d "%ROOT%\backend"
if not exist "node_modules" (
    echo  [..] Primera vez - instalando packages (puede tardar 1-2 min)...
    call npm install --silent
    echo  [OK] Dependencias instaladas
) else (
    echo  [OK] Dependencias ya instaladas
)

echo.
echo  [4/6] Aplicando migraciones de base de datos...
call npx prisma migrate deploy --schema=prisma/schema.prisma >nul 2>&1
if errorlevel 1 (
    call npx prisma migrate dev --name init --schema=prisma/schema.prisma >nul 2>&1
)
echo  [OK] Base de datos lista

:: Seed solo si la tabla está vacía
echo  [..] Verificando datos de ejemplo...
call npx tsx src/prisma/seed.ts >nul 2>&1
echo  [OK] Datos de ejemplo cargados

echo.
echo  [5/6] Instalando dependencias frontend (si es necesario)...
cd /d "%ROOT%\frontend-web"
if not exist "node_modules" (
    echo  [..] Primera vez - instalando packages frontend...
    call npm install --silent
    echo  [OK] Dependencias frontend instaladas
) else (
    echo  [OK] Dependencias frontend ya instaladas
)

echo.
echo  [6/6] Arrancando servidores...
echo.

:: Abrir ventana Backend
start "🎮 DevbuPlaytime — BACKEND (API)" cmd /k "color 0A && echo DEVBUPLAYTIME BACKEND && echo Puerto: 3001 && echo Docs API: http://localhost:3001/api-docs && echo. && cd /d "%ROOT%\backend" && npm run dev"

:: Esperar 3 segundos
timeout /t 3 /nobreak >nul

:: Abrir ventana Frontend
start "🎮 DevbuPlaytime — FRONTEND (Web)" cmd /k "color 0B && echo DEVBUPLAYTIME FRONTEND && echo Puerto: 5173 && echo. && cd /d "%ROOT%\frontend-web" && npm run dev"

:: Esperar a que los servidores arranquen
echo  [..] Esperando 8 segundos a que los servidores arranquen...
timeout /t 8 /nobreak >nul

:: Abrir navegador
echo  [OK] Abriendo navegador...
start "" "http://localhost:5173"

echo.
echo  ████████████████████████████████████████████
echo   ✅ DEVBUPLAYTIME ARRANCADO CORRECTAMENTE
echo  ████████████████████████████████████████████
echo.
echo   🌐 App Web:     http://localhost:5173
echo   🔌 API REST:    http://localhost:3001
echo   📚 Swagger:     http://localhost:3001/api-docs
echo   🗄  PostgreSQL:  localhost:5432
echo.
echo   👤 Admin:  admin@devbuplaytime.com / Admin123!
echo   👤 Demo:   demo@devbuplaytime.com / User123!
echo.
echo   Para PARAR todo: cierra las ventanas de Backend
echo   y Frontend, y ejecuta PARAR_DevbuPlaytime.bat
echo.
timeout /t 10 /nobreak >nul
exit
