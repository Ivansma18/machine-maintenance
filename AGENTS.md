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

## Restricciones para futuras sesiones
- Mantener cambios pequenos y verificables; no introducir ERP/CRM antes de cubrir el alcance actual.
- Preservar nombres de dominio en ingles para codigo (`Machine`, `MaintenancePlan`, `MaintenanceLog`, `Notification`) aunque la documentacion pueda estar en espanol.
- Comandos actuales: `npm install`, `npm run dev:web`, `npm run build:web`.
- Impeccable esta instalado a nivel de proyecto en `.opencode/skills/impeccable`; usar `/impeccable init` al iniciar el contexto visual.
- Para actualizar Impeccable usar `npx impeccable update`; para auditar UI usar `npx impeccable detect <ruta>`.
- No importar directamente `antd`, `@ant-design/icons`, `motion/react` o `motion/react-m` desde features de dominio.
