# Deployment Guide

## Topologia recomendada

Para un primer despliegue publico, separa las tres piezas:

```text
Frontend Next.js  -> Vercel
API NestJS        -> Render, Railway o Fly.io
PostgreSQL        -> Neon, Supabase, Render PostgreSQL o Railway PostgreSQL
```

Esta separacion facilita escalar cada proceso, rotar credenciales y diagnosticar
fallos sin mezclar el servidor web con la base de datos.

## Base de datos

1. Crea una instancia PostgreSQL administrada.
2. Copia su URL de conexion usando SSL si el proveedor lo requiere.
3. No uses la base local ni subas `apps/api/.env`.

Ejemplo:

```env
DATABASE_URL=postgresql://user:password@host:5432/machine_maintenance?sslmode=require
```

## API en Render

Configura un Web Service conectado al repositorio:

- Root directory: repositorio.
- Build command:

```bash
npm ci && npm run prisma:generate && npm run build:api
```

- Pre-deploy command:

```bash
npm run prisma:migrate:deploy
```

- Start command:

```bash
node apps/api/dist/main.js
```

Variables de entorno:

```env
DATABASE_URL=...
NODE_ENV=production
PORT=10000
WEB_ORIGIN=https://tu-frontend.vercel.app
AUTH_SESSION_COOKIE=mm_session
AUTH_SESSION_IDLE_DAYS=7
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_NAME=Administrador
ADMIN_PASSWORD=una-contrasena-segura
```

El puerto debe aceptar el valor que proporcione la plataforma. La aplicacion ya
lee `PORT` desde `ConfigService`.

## Seed de produccion

Ejecuta el seed una sola vez despues de crear la base y aplicar migraciones:

```bash
npm run prisma:seed
```

Usa una contrasena de administrador diferente a la local. El seed debe ejecutarse
como una tarea protegida y no en cada arranque de la API.

## Frontend en Vercel

Configura un proyecto conectado al mismo repositorio:

- Root directory: `apps/web`, o repositorio raiz con el build command del workspace.
- Build command desde la raiz:

```bash
npm run build:web
```

- Environment variable:

```env
NEXT_PUBLIC_API_URL=https://tu-api.onrender.com
```

No uses `localhost` en esta variable. Las variables `NEXT_PUBLIC_*` se incorporan
al bundle del navegador durante el build.

## Cookies, CORS y dominios

La API usa `credentials: true` y CORS restringido a `WEB_ORIGIN`. Configura el valor
con la URL exacta del frontend, incluyendo `https` y sin una ruta final:

```env
WEB_ORIGIN=https://app.tudominio.com
NEXT_PUBLIC_API_URL=https://api.tudominio.com
```

La opcion mas segura es usar subdominios del mismo dominio:

```text
app.tudominio.com
api.tudominio.com
```

Si frontend y API viven en dominios completamente diferentes, revisa la politica
`SameSite` de la cookie y la proteccion CSRF antes de cambiarla a `None`.

## Checklist de salida

- [ ] PostgreSQL administrado creado.
- [ ] `DATABASE_URL` configurada como secreto.
- [ ] Migraciones aplicadas con `prisma migrate deploy`.
- [ ] Seed ejecutado una sola vez con credenciales seguras.
- [ ] API accesible en `/api/health`.
- [ ] `WEB_ORIGIN` apunta al dominio real del frontend.
- [ ] `NEXT_PUBLIC_API_URL` apunta a la API real.
- [ ] Login, logout y renovacion de sesion verificados.
- [ ] Creacion de usuario y asignacion de scopes verificados.
- [ ] CORS probado desde el dominio del frontend.
- [ ] No hay secretos en Git ni en los logs de build.
- [ ] Backups y recuperacion de la base configurados.
- [ ] Dominio HTTPS configurado.

## Comandos de validacion antes del deploy

```bash
npm run prisma:validate
npm run build:api
npm run typecheck:api
npm run test:api
npm run build:web
```
