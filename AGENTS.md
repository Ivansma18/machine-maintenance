# AGENTS.md

## Estado del repositorio

- Este repositorio esta en fase de planeacion: no hay codigo de backend, frontend ni Prisma aun.
- No implementes codigo de aplicacion hasta que el usuario apruebe la arquitectura o lo pida explicitamente.
- La fuente principal de arquitectura inicial es `bakery-maintenance-architecture.skill.md`.

## Producto objetivo

- Sistema de mantenimiento para maquinaria de panaderia, disenado para crecer luego hacia ERP/CRM.
- Alcance actual: maquinas, frecuencias de mantenimiento, historial de mantenimientos y notificaciones preventivas/urgentes.
- Stack aprobado: NestJS + TypeScript, Next.js App Router + Ant Design + Motion.dev + Tailwind, PostgreSQL local + Prisma ORM.

## Arquitectura esperada

- Monorepo TypeScript orientado a funcionalidad.
- Backend esperado en `apps/api` con modulos NestJS por dominio, no por capas globales genericas.
- Frontend esperado en `apps/web` con rutas/features de Next.js App Router por dominio.
- Prisma debe vivir como infraestructura compartida del backend y modelar PostgreSQL como fuente de verdad.
- Ant Design solo se consume mediante wrappers propios en `apps/web/components/ui`; las features no importan `antd` ni `@ant-design/icons` directamente.
- Motion.dev solo se consume mediante wrappers y presets reutilizables en `apps/web/components/motion` y `apps/web/lib/motion`.
- Impeccable es la skill responsable del criterio visual de cada nueva feature frontend; debe respetar los wrappers y el sistema existente.

## Convenciones de frontend

- Los archivos reservados por Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` y `not-found.tsx`) mantienen sus nombres obligatorios y funcionan como entrypoints del router.
- Un `page.tsx` solo compone una pagina descriptiva de feature; no contiene `fetch`, logica de negocio, estado complejo, helpers ni markup extenso.
- Cada feature frontend se organiza por responsabilidad: `components/` para UI, `hooks/` para estado y efectos, `api/` para acceso HTTP, `types.ts` para contratos y `utils/` para transformaciones puras.
- Las utilidades, componentes, hooks y contratos reutilizables entre features se declaran una sola vez en ubicaciones globales de `apps/web` (`lib/`, `components/`, `hooks/` o `types/`) y las features los consumen; no se duplican implementaciones compartidas dentro de cada feature.
- Las carpetas `features/<feature>/utils/` se reservan para transformaciones y reglas propias del dominio de esa feature.
- Las paginas descriptivas deben usar nombres semanticos, por ejemplo `OperationalDashboardPage`, `MachinesPage` o `MaintenancePlansPage`.
- Los componentes reciben datos por props y comunican acciones mediante callbacks; no conocen la infraestructura HTTP.
- Los hooks encapsulan carga, error, retry, refresh y acciones de la feature; no renderizan UI.
- Aplicar Clean Code y SOLID: responsabilidad unica, dependencias explicitas, bajo acoplamiento y funciones pequenas.
- Si un archivo mezcla layout, datos, estados y transformaciones, debe dividirse antes de crecer.
- Las features no importan directamente `antd`, `@ant-design/icons`, `motion/react` ni `motion/react-m`; usan wrappers propios.

## Restricciones para futuras sesiones

- Mantener cambios pequenos y verificables; no introducir ERP/CRM antes de cubrir el alcance actual.
- Preservar nombres de dominio en ingles para codigo (`Machine`, `MaintenancePlan`, `MaintenanceLog`, `Notification`) aunque la documentacion pueda estar en espanol.
- Comandos actuales: `npm install`, `npm run dev`, `npm run dev:web`, `npm run build:web`, `npm run start:api`, `npm run build:api`, `npm run test:api`, `npm run typecheck:api`, `npm run prisma:validate`, `npm run prisma:generate`, `npm run prisma:migrate:dev`, `npm run prisma:migrate:deploy`, `npm run prisma:seed`.
- API local: `http://localhost:3002`; frontend local: `http://localhost:5174`.
- Prisma API: copiar `apps/api/.env.example` a `apps/api/.env`, configurar `DATABASE_URL` y crear la base de datos manualmente antes de iniciar la API.
- Despues ejecutar `npm run prisma:generate` y `npm run prisma:validate`.
- Impeccable esta instalado a nivel de proyecto en `.opencode/skills/impeccable`; usar `/impeccable init` al iniciar el contexto visual.
- Para actualizar Impeccable usar `npx impeccable update`; para auditar UI usar `npx impeccable detect <ruta>`.
- No importar directamente `antd`, `@ant-design/icons`, `motion/react` o `motion/react-m` desde features de dominio.
