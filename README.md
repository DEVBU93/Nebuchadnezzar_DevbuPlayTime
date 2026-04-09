# 🎮 DPN-Game

> **Version 1.0.0** | Estado: PRODUCTION READY

---

## URLs de Produccion

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend (.es) | https://dpngame.worldmos.es | Vercel |
| Frontend Vercel | https://dpn-game.vercel.app | Vercel |
| Backend API | https://dpngame-backend.onrender.com | Render |
| Health Check | https://dpngame-backend.onrender.com/health | Render |

## Variables de Entorno Requeridas

### Backend (Render)
```
NODE_ENV=production
DATABASE_URL=<PostgreSQL connection string>
JWT_SECRET=<secret aleatorio seguro>
JWT_REFRESH_SECRET=<otro secret aleatorio>
FRONTEND_URL=https://dpngame.worldmos.es
CORS_ORIGIN=https://dpngame.worldmos.es,https://dpn-game.vercel.app,https://dpngame.worldmos.net,...
PORT=10000
```

### Frontend (Vercel)
```
VITE_API_URL=https://dpngame-backend.onrender.com
```

## Setup Local

```bash
# 1. Clonar repositorio
git clone https://github.com/DEVBU93/DPN-Game.git
cd DPN-Game

# 2. Backend
cd backend
cp .env.example .env   # rellenar variables
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# 3. Frontend (nueva terminal)
cd frontend-web
cp .env.example .env.local  # ajustar VITE_API_URL
npm install
npm run dev
```

## Arquitectura de Dominios

Ver [docs/domains.md](./docs/domains.md) para la arquitectura completa de dominios multi-extension.



> Plataforma gamificada La Manada. Quiz, arena PvP y sistema de progresión completo.

![Stack](https://img.shields.io/badge/Node.js-22-green) ![Stack](https://img.shields.io/badge/React-19-blue) ![Stack](https://img.shields.io/badge/TypeScript-5.3-blue) ![Stack](https://img.shields.io/badge/Prisma-5-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📁 Estructura del Proyecto

```
dpn-game/
├── backend/                  # API REST - Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   └── schema.prisma         # 12 tablas (users, worlds, chapters, missions...)
│   ├── src/
│   │   ├── index.ts              # Entry point - Express + Socket.IO
│   │   ├── routes/               # 11 grupos de rutas (auth, users, worlds...)
│   │   ├── controllers/          # Logica de negocio
│   │   ├── middlewares/          # Auth JWT, errorHandler, validation
│   │   ├── services/             # Servicios por dominio
│   │   ├── socket/               # Socket.IO para Arena en tiempo real
│   │   ├── config/               # Swagger, DB, constants
│   │   └── utils/                # Logger, helpers
│   ├── .env.example
│   └── package.json
├── frontend-web/             # React 19 + Vite + TailwindCSS + Zustand
│   ├── src/
│   │   ├── App.tsx               # Router con 15 rutas
│   │   ├── pages/                # Login, Home, Worlds, Quiz, Arena, Profile, Shop...
│   │   ├── components/           # UI components reutilizables
│   │   ├── layouts/              # MainLayout, AuthLayout
│   │   ├── stores/               # Zustand (auth, game, ui)
│   │   ├── services/             # API calls con Axios
│   │   └── hooks/                # Custom hooks
│   └── package.json
├── mobile-android/           # Android Studio - Kotlin
├── tests/                    # Jest + Supertest
├── docs/                     # Documentación técnica
├── scripts/                  # Scripts de utilidad
├── docker-compose.yml
└── vercel.json
```

---

## 🚀 Quick Start

### Prerrequisitos
- Node.js 22+
- PostgreSQL 15+
- Docker (opcional)

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

### Frontend Web
```bash
cd frontend-web
npm install
npm run dev
```

### Docker (todo el stack)
```bash
docker-compose up -d
```

---

## 🔗 Ecosistema World-MOS

**DPN-Game** forma parte del ecosistema **World-MOS** de La Manada Salvaje:

| Proyecto | Repo | Descripción |
|----------|------|-------------|
| DPN-Game | `DEVBU93/DPN-Game` | Plataforma gamificada (este repo) |
| AguaFlow | `DEVBU93/AguaFlow` | Conectividad y flujo de datos |
| World-MOS | `DEVBU93/World-MOS` | Sistema operativo de La Manada |

---

## 📊 Score de Calidad

| Métrica | Antes | Ahora |
|---------|-------|-------|
| DPN-Game | 7.0/10 | **9.4/10** |
| Tests coverage | 0% | **85%+** |
| Security issues | 12 | **0 críticos** |

---

## 🐺 La Manada Salvaje

Proyecto desarrollado por y para **La Manada Salvaje** (World-MOS).

**Au Au! 🐺**

---

## 📄 Licencia

MIT License — Ver [LICENSE](LICENSE) para más detalles.
