@echo off
title 🛑 La Manada — Parando todo...
color 0C
cls
echo.
echo  ████████████████████████████████████████████████
echo   LA MANADA — Parando todos los proyectos
echo  ████████████████████████████████████████████████
echo.

echo  [1/4] Cerrando ventanas de servidores...
taskkill /F /FI "WINDOWTITLE eq *DevbuPlaytime*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *AguaFlow*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq *World-MOS*" >nul 2>&1
echo  [OK] Servidores cerrados

echo  [2/4] Matando procesos Node.js...
taskkill /F /IM "node.exe" >nul 2>&1
echo  [OK] Node.js terminado

echo  [3/4] Parando contenedores Docker...
docker stop $(docker ps -q) >nul 2>&1
for /f "tokens=*" %%i in ('docker ps -q') do docker stop %%i >nul 2>&1
echo  [OK] Contenedores Docker parados

echo  [4/4] Limpieza completada
echo.
echo  ✅ Todo el ecosistema parado correctamente.
echo.
echo  Puedes cerrar esta ventana o ejecutar ARRANCAR_TODO.bat
echo  para volver a arrancarlo.
echo.
timeout /t 5 /nobreak >nul
exit
