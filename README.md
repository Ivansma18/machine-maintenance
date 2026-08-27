# Pantry Maintenance

Sistema full-stack de mantenimiento preventivo para maquinaria de panaderia.
Permite registrar maquinaria, planificar mantenimientos, documentar intervenciones
tecnicas y coordinar alertas operativas desde una sola interfaz.

El proyecto fue construido como una pieza de portafolio con una arquitectura modular
y preparada para crecer hacia capacidades de ERP/CRM sin adelantar dominios que aun
no forman parte del alcance de mantenimiento.

## Que resuelve

En una operacion de panaderia, una falla critica o un mantenimiento vencido puede
interrumpir la produccion. Pantry Maintenance centraliza la informacion necesaria
para anticipar esas situaciones y mantener trazabilidad sobre cada intervencion.

## Funcionalidades

- Dashboard operativo con estado de maquinaria, mantenimientos proximos y alertas.
- Alta, edicion, consulta y desactivacion segura de maquinas.
- Categorias de maquinaria como hornos, batidoras y amasadoras.
- Expediente tecnico por maquina con historial, planes, alertas, refacciones y timeline.
- Planes preventivos con frecuencias configurables y calculo de vencimientos.
- Historial de mantenimientos con resultado tecnico, notas y fallos criticos.
- Ordenes de trabajo correctivas y preventivas con asignacion y ciclo de vida.
- Agenda mensual y semanal de mantenimientos programados.
- Bandeja de notificaciones preventivas y urgentes.
- Metricas de reincidencia y recomendaciones operativas.
- Catalogo de refacciones, inventario y movimientos auditados.
- Usuarios, roles, permisos efectivos y activacion/desactivacion.
- Alcances por planta y area para limitar la visibilidad operativa.
- Auditoria de acciones administrativas y de mantenimiento.
- Layout responsive para escritorio, tablet y pantallas pequenas.

## Stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS.
- **UI:** Ant Design mediante wrappers propios.
- **Motion:** Motion.dev mediante wrappers y presets reutilizables.
- **Backend:** NestJS, TypeScript y Express.
- **Persistencia:** PostgreSQL y Prisma ORM.
- **Monorepo:** npm workspaces.
- **Calidad:** Jest, TypeScript, Prisma validation, Prettier e Impeccable.

## Arquitectura

El repositorio esta organizado por aplicaciones y por dominio:

```text
apps/
  api/
    src/
      auth/                 # Sesiones y autenticacion
      authorization/        # Guards, permisos y scopes
      audit/                # Trazabilidad de acciones
      dashboard/            # Resumen operativo
      health/               # Salud de API y base de datos
      locations/            # Plantas, areas y lineas
      machines/             # Maquinaria y expediente tecnico
      maintenance-plans/    # Mantenimiento preventivo
      maintenance-logs/     # Historial tecnico
      notifications/        # Alertas preventivas y urgentes
      parts/                # Refacciones e inventario
      users/                # Usuarios y roles
      work-orders/          # Ordenes de trabajo
    prisma/
      schema.prisma
      migrations/
      seed.ts
  web/
    app/                    # Entry points del App Router
    components/             # Shell, UI wrappers y providers
    features/               # UI, hooks, API y tipos por dominio
    lib/                    # Cliente HTTP, formato y motion
```

### Decisiones tecnicas destacadas

- Prisma es la fuente de verdad para el modelo de datos y las migraciones.
- Cada dominio mantiene cerca sus controllers, services, DTOs, reglas y pruebas.
- El backend concentra autenticacion y autorizacion; el frontend solo refleja permisos.
- Los roles definen permisos y los scopes limitan los datos por planta o area.
- Las features no importan directamente `antd`, `@ant-design/icons` ni `motion/react`.
- Los entry points `page.tsx` solo conectan rutas con paginas descriptivas.
- Las operaciones importantes se registran mediante auditoria.

## Inicio local

### Requisitos

- Node.js 20 o superior.
- PostgreSQL 15 o superior.
- npm.

### Instalacion

```bash
npm install
```

Copia `apps/api/.env.example` como `apps/api/.env` y configura una base PostgreSQL
local. Para el frontend, copia `apps/web/.env.example` como `apps/web/.env.local`.

Variables minimas del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

Variables importantes del backend:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/machine_maintenance?schema=public
PORT=3002
NODE_ENV=development
WEB_ORIGIN=http://localhost:5174
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.local
ADMIN_NAME=Local Administrator
ADMIN_PASSWORD=define-una-contrasena-local
```

Aplica el esquema y carga datos demo:

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
```

Inicia API y frontend juntos:

```bash
npm run dev
```

URLs locales:

- Web: `http://localhost:5174`
- API: `http://localhost:3002`
- Health check: `http://localhost:3002/api/health`

## Comandos

```bash
npm run dev
npm run dev:web
npm run build:api
npm run build:web
npm run typecheck:api
npm run test:api
npm run prisma:validate
npm run prisma:migrate:deploy
npm run prisma:seed
```

## Verificacion

El estado actual fue verificado con:

```text
14 test suites passed
57 tests passed
API build passed
API typecheck passed
Web production build passed
Prisma validation passed
```

## Despliegue

La guia completa esta en [`docs/deployment.md`](docs/deployment.md). La topologia
recomendada es:

```text
Vercel             -> apps/web
Render/Railway     -> apps/api
Neon/Supabase      -> PostgreSQL
```

Antes de publicar, configura `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL` y `DATABASE_URL`
con URLs reales. Nunca subas archivos `.env` ni credenciales al repositorio.

## Documentacion adicional

- [Technical overview](docs/technical-overview.md)
- [Deployment guide](docs/deployment.md)
- [Portfolio copy](docs/portfolio-copy.md)
- [Evolution roadmap](docs/maintenance-evolution-roadmap.md)
- [Work order design](docs/work-order-design.md)
- [Auth and roles technical design](docs/auth-roles-technical-design.md)

## Estado del proyecto

El MVP operativo esta implementado. El siguiente crecimiento natural es endurecer
la preparacion de produccion, completar despliegue, agregar observabilidad y ampliar
los dominios hacia ERP/CRM solo cuando el flujo de mantenimiento este estabilizado.

## Licencia

Proyecto de portafolio. Agrega una licencia antes de distribuirlo como software
reutilizable.
