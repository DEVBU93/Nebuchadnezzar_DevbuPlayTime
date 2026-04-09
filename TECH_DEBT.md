# TECH_DEBT.md — DPN-Game v1.0

> Deuda técnica documentada al cierre de v1.0.0. Cada ítem debe ser resuelto antes de v1.1.

---

## 🔴 CRÍTICO (Bloquea v1.1)

### TD-001: PrismaClient instanciado múltiples veces
- **Archivos**: `auth.service.ts`, `auth.middleware.ts`, `quiz.controller.ts`, `socketHandler.ts`
- **Problema**: Cada módulo crea `new PrismaClient()` → múltiples conexiones DB en producción
- **Solución**: Crear `backend/src/lib/prisma.ts` con singleton y exportar instancia única
- **Impacto**: Agota el connection pool de PostgreSQL en Render (max 5 en plan gratuito)

```ts
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
export default prisma;
```

### TD-002: Sin tests unitarios ni de integración
- **Problema**: CI pasa con `--passWithNoTests` — no hay cobertura real
- **Solución**: Implementar tests con Jest + Supertest para endpoints críticos:
  - `POST /api/auth/register`
  - `POST /api/quiz/session/start`
  - `POST /api/quiz/session/complete`
- **Prioridad**: Alta — sin tests no hay garantía de regresión

---

## 🟡 IMPORTANTE (Antes de escalar)

### TD-003: JWT_REFRESH_SECRET no obligatorio
- **Archivo**: `auth.service.ts` línea: `JWT_REFRESH_SECRET || JWT_SECRET`
- **Problema**: Si solo se define `JWT_SECRET`, el refresh token usa el mismo secreto que el access token
- **Solución**: Hacer `JWT_REFRESH_SECRET` obligatorio en validación de env vars al arrancar

### TD-004: Socket arena:join no verifica roomCode válido
- **Archivo**: `socketHandler.ts`
- **Problema**: Cualquier string puede ser roomCode — no hay validación ni límite de jugadores
- **Solución**: Validar roomCode contra DB, limitar sala a N jugadores, emitir error si sala llena

### TD-005: Quiz timer solo en frontend
- **Archivo**: `QuizPage.tsx` — `timeLimit` se recibe pero no se valida en backend
- **Problema**: Un cliente malicioso puede ignorar el tiempo y enviar respuestas tardías
- **Solución**: Backend debe registrar `startedAt` por pregunta y rechazar respuestas fuera de tiempo

### TD-006: Prisma seed.ts excluido de tsconfig pero sin script npm dedicado
- **Archivo**: `backend/tsconfig.json` excluye `src/prisma/seed.ts`
- **Problema**: El seed se ejecuta con `ts-node` directamente, sin control de entorno
- **Solución**: Añadir `"seed": "ts-node prisma/seed.ts"` en `package.json` scripts

---

## 🟢 MEJORAS UX / v1.1

### TD-007: Panel de administración (.net subdomain) no implementado
- **Estado**: Documentado en `docs/domains.md` pero no existe código
- **Necesita**: Dashboard React con autenticación ROLE=ADMIN, gestión de misiones/preguntas/usuarios
- **Dominio objetivo**: dpn-game.net

### TD-008: Frontend sin error boundaries
- **Problema**: Un componente que falla en render puede tumbar toda la app sin mensaje al usuario
- **Solución**: Añadir `<ErrorBoundary>` global en `main.tsx` y por sección crítica

### TD-009: Imágenes y assets sin optimizar
- **Problema**: No hay lazy loading de imágenes ni CDN configurado
- **Solución**: Usar `loading="lazy"` en imágenes y configurar Cloudflare CDN para assets estáticos

### TD-010: Falta página de expansión VR (.online)
- **Estado**: Reservado en arquitectura de dominios
- **Necesita**: Landing page con concepto VR, formulario de interés, ruta `/vr` en frontend

---

## Historial

| Versión | Fecha | Autor | Notas |
|---------|-------|-------|-------|
| v1.0.0 | 2025 | DEVBU93 | Documento inicial de deuda técnica |
