# DPNGAME — Arquitectura de Dominios v1.0

## Estructura de Dominios (FIJA)

La arquitectura de dominios de DPNGAME sigue una logica clara por extension:

| Dominio | Rol | Destino | Tipo DNS | Registro DNS |
|---------|-----|---------|----------|--------------|
| dpngame.worldmos.es | Juego Frontend Publico | Vercel | CNAME | `cname.vercel-dns.com` |
| dpngame.worldmos.net | Backend Config + Soporte / Paneles Admin | Render (API) | CNAME | `<backend>.onrender.com` |
| dpngame.worldmos.shop | Tienda / Marketing / Merchandising | Vercel | CNAME | `cname.vercel-dns.com` |
| dpngame.worldmos.info | Informacion del juego / Docs / FAQ | Vercel Static | A | `76.76.21.21` |
| dpngame.worldmos.online | Expansion modos avanzados (VR, metaverso) | Vercel/Render | CNAME | `cname.vercel-dns.com` |
| dpngame.worldmos.world | Orquestadores Mundiales / Rankings globales | Vercel | CNAME | `cname.vercel-dns.com` |

## Detalles por Dominio

### .es — Juego Frontend Principal
- **URL**: https://dpngame.worldmos.es
- **Destino**: Vercel (proyecto `dpn-game`)
- **Descripcion**: Experiencia publica de juego — quiz, arena, XP/coins, ranking, login/registro
- **VITE_API_URL**: `https://dpngame-backend.onrender.com` (o dominio .net cuando este activo)
- **Configuracion Vercel**:
  - Anadir `dpngame.worldmos.es` en Settings > Domains del proyecto
  - El `vercel.json` ya tiene SPA rewrites y HTTPS
- **DNS GoDaddy**:
  ```
  Tipo: CNAME
  Host: @ (o dpngame)
  Valor: cname.vercel-dns.com
  TTL: 600
  ```

### .net — Backend Config / Paneles Admin
- **URL**: https://dpngame.worldmos.net (o api.dpngame.worldmos.net)
- **Destino**: Render (servicio `dpngame-backend`)
- **Descripcion**: API REST, pestanas de configuracion, dashboards de administracion, visualizaciones de datos
- **DNS GoDaddy**:
  ```
  Tipo: CNAME
  Host: api (o @)
  Valor: dpngame-backend-XXXX.onrender.com
  TTL: 600
  ```
- **CORS**: El backend acepta peticiones desde .es, .shop, .online, .world

### .shop — Tienda / Marketing
- **URL**: https://dpngame.worldmos.shop
- **Destino**: Vercel (proyecto separado)
- **Descripcion**: Tienda in-game (cosmeticos, runes), landing de marketing, merchandising
- **Estado**: Pendiente de crear proyecto Vercel para landing basico
- **DNS GoDaddy**:
  ```
  Tipo: CNAME
  Host: @ (o dpngame)
  Valor: cname.vercel-dns.com
  TTL: 600
  ```

### .info — Informacion Completa
- **URL**: https://dpngame.worldmos.info
- **Destino**: Vercel Static
- **Descripcion**: Documentacion del juego, GDD, tutoriales, FAQ, changelog
- **Estado**: Pendiente de crear proyecto Vercel para docs estaticos
- **DNS GoDaddy**:
  ```
  Tipo: A
  Host: @
  Valor: 76.76.21.21
  TTL: 600
  ```

### .online — Expansion Modos Avanzados
- **URL**: https://dpngame.worldmos.online
- **Destino**: Vercel/Render (segun servicio)
- **Descripcion**: Modos de juego avanzados — VR, metaverso, Nebuchadnezzar, expansiones futuras
- **Estado**: Pendiente de definir arquitectura especifica
- **DNS GoDaddy**:
  ```
  Tipo: CNAME
  Host: @ (o dpngame)
  Valor: cname.vercel-dns.com
  TTL: 600
  ```

### .world — Orquestadores Mundiales
- **URL**: https://dpngame.worldmos.world
- **Destino**: Vercel Dashboard
- **Descripcion**: Dashboard global, rankings mundiales, eventos internacionales, orquestacion multi-region
- **Estado**: Pendiente de crear proyecto Vercel para dashboard global
- **DNS GoDaddy**:
  ```
  Tipo: CNAME
  Host: @ (o dpngame)
  Valor: cname.vercel-dns.com
  TTL: 600
  ```

## Configuracion CORS Backend

El backend en `backend/src/index.ts` acepta peticiones de los siguientes origenes (configurados via variable de entorno `CORS_ORIGIN`):

```
https://dpngame.worldmos.es
https://dpngame.worldmos.net
https://dpngame.worldmos.shop
https://dpngame.worldmos.info
https://dpngame.worldmos.online
https://dpngame.worldmos.world
https://dpn-game.vercel.app
http://localhost:5173
```

## Variables de Entorno por Dominio

### Backend (Render — render.yaml)
```
NODE_ENV=production
DATABASE_URL=<desde Render PostgreSQL>
JWT_SECRET=<generado por Render>
FRONTEND_URL=https://dpngame.worldmos.es
CORS_ORIGIN=https://dpngame.worldmos.es,https://dpngame.worldmos.net,...
```

### Frontend .es (Vercel)
```
VITE_API_URL=https://dpngame-backend.onrender.com
```

## Pasos para Anadir un Nuevo Subdominio

1. **GoDaddy**: Anadir registro CNAME con host = subdominio y valor = destino Vercel/Render
2. **Vercel**: Ir a Settings > Domains > Add Domain en el proyecto correspondiente
3. **CORS**: Actualizar la variable `CORS_ORIGIN` en Render para incluir el nuevo origen
4. **Documentar**: Actualizar esta tabla con el nuevo dominio

## Diagrama de Arquitectura

```
[GoDaddy DNS]
     |
     |-- dpngame.worldmos.es -------> [Vercel: frontend-web] (Juego)
     |-- dpngame.worldmos.net ------> [Render: dpngame-backend] (API)
     |-- dpngame.worldmos.shop -----> [Vercel: shop] (Tienda)
     |-- dpngame.worldmos.info -----> [Vercel: docs] (Info)
     |-- dpngame.worldmos.online ---> [Vercel/Render: online] (Expansion)
     |-- dpngame.worldmos.world ----> [Vercel: world] (Global)

[Backend Render] <----> [PostgreSQL Render]
[Frontend .es] ---------> API calls --------> [Backend .net]
```
