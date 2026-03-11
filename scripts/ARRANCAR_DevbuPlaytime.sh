#!/bin/bash
# DevbuPlaytime Launcher — macOS / Linux
# Doble clic en Mac para ejecutar (dar permisos: chmod +x ARRANCAR_DevbuPlaytime.sh)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detectar raíz del proyecto
if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    ROOT="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../backend/package.json" ]; then
    ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    osascript -e 'display alert "DevbuPlaytime" message "No se encuentra la carpeta del proyecto. Asegúrate de que el script está en la raíz del repositorio."' 2>/dev/null || echo "ERROR: No se encuentra el proyecto"
    exit 1
fi

# Función de terminal para macOS
open_terminal_mac() {
    local title="$1"
    local cmd="$2"
    osascript << EOF
tell application "Terminal"
    activate
    do script "echo '\033]0;$title\007' && $cmd"
end tell
EOF
}

# Función de terminal para Linux (gnome-terminal / xterm)
open_terminal_linux() {
    local title="$1"
    local cmd="$2"
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="$title" -- bash -c "$cmd; exec bash" &
    elif command -v xterm &> /dev/null; then
        xterm -title "$title" -e bash -c "$cmd; exec bash" &
    else
        bash -c "$cmd" &
    fi
}

# Detectar OS
OS="$(uname)"
echo "================================================"
echo " DEVBUPLAYTIME — Iniciando..."
echo "================================================"

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    MSG="Docker no está instalado. Descárgalo en https://www.docker.com/products/docker-desktop"
    [ "$OS" = "Darwin" ] && osascript -e "display alert \"Error\" message \"$MSG\"" || echo "ERROR: $MSG"
    exit 1
fi

# 2. Arrancar Docker
echo "[1/5] Arrancando PostgreSQL..."
cd "$ROOT"
docker-compose up -d postgres
sleep 5
echo "[OK] PostgreSQL listo"

# 3. Backend deps
echo "[2/5] Verificando dependencias backend..."
cd "$ROOT/backend"
[ ! -d "node_modules" ] && npm install
echo "[OK] Backend listo"

# 4. Migraciones
echo "[3/5] Aplicando migraciones..."
npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null || \
npx prisma migrate dev --name init --schema=prisma/schema.prisma
npx tsx src/prisma/seed.ts 2>/dev/null
echo "[OK] Base de datos lista"

# 5. Frontend deps
echo "[4/5] Verificando dependencias frontend..."
cd "$ROOT/frontend-web"
[ ! -d "node_modules" ] && npm install
echo "[OK] Frontend listo"

# 6. Arrancar servidores
echo "[5/5] Arrancando servidores..."
if [ "$OS" = "Darwin" ]; then
    open_terminal_mac "DevbuPlaytime BACKEND :3001" "cd '$ROOT/backend' && npm run dev"
    sleep 3
    open_terminal_mac "DevbuPlaytime FRONTEND :5173" "cd '$ROOT/frontend-web' && npm run dev"
else
    open_terminal_linux "DevbuPlaytime BACKEND :3001" "cd '$ROOT/backend' && npm run dev"
    sleep 3
    open_terminal_linux "DevbuPlaytime FRONTEND :5173" "cd '$ROOT/frontend-web' && npm run dev"
fi

# Esperar y abrir navegador
sleep 8
if [ "$OS" = "Darwin" ]; then
    open "http://localhost:5173"
else
    xdg-open "http://localhost:5173" 2>/dev/null || echo "Abre: http://localhost:5173"
fi

echo ""
echo "================================================"
echo " ✅ DEVBUPLAYTIME ARRANCADO"
echo " 🌐 App:     http://localhost:5173"
echo " 🔌 API:     http://localhost:3001"
echo " 📚 Swagger: http://localhost:3001/api-docs"
echo " 👤 Admin:   admin@devbuplaytime.com / Admin123!"
echo " 👤 Demo:    demo@devbuplaytime.com / User123!"
echo "================================================"
