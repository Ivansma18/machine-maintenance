# Arquitectura: Sistema de Mantenimiento para Maquinaria de Panaderia

## Objetivo
Disenar un monorepo TypeScript para un sistema de mantenimiento de maquinaria de panaderia que pueda evolucionar hacia un ERP/CRM. El alcance inicial cubre CRUD/listado de maquinas, configuracion de frecuencias, historial de mantenimientos y notificaciones preventivas/urgentes.

## Stack objetivo
- Backend: NestJS con TypeScript.
- Frontend: Next.js App Router con Ant Design, Motion.dev y Tailwind.
- Base de datos: PostgreSQL local.
- ORM: Prisma.
- Arquitectura: monorepo orientado a funcionalidad.

## Monorepo propuesto
```text
apps/
  api/
    src/
      app.module.ts
      main.ts
      prisma/
      machines/
      maintenance-plans/
      maintenance-logs/
      notifications/
      health/
    prisma/
      schema.prisma
  web/
    app/
      (dashboard)/
        machines/
        maintenance-plans/
        maintenance-history/
        notifications/
        page.tsx
    components/
      providers/
        AppProviders.tsx
        AntdProvider.tsx
        MotionProvider.tsx
      ui/
        AppButton.tsx
        AppInput.tsx
        AppSelect.tsx
        AppDatePicker.tsx
        AppTable.tsx
        AppForm.tsx
        AppModal.tsx
        AppAlert.tsx
        AppTag.tsx
        AppPagination.tsx
      motion/
        AnimatedPage.tsx
        AnimatedSection.tsx
        AnimatedCard.tsx
        AnimatedList.tsx
        AnimatedListItem.tsx
        Presence.tsx
    features/
      machines/
      maintenance-plans/
      maintenance-logs/
      notifications/
    lib/
      motion/
        presets.ts
        transitions.ts
        variants.ts
      ui/
        theme.ts
packages/
  shared/
    src/
      maintenance-status.ts
      notification-types.ts
      date-utils.ts
```

## Backend NestJS por funcionalidad
- `prisma`: `PrismaService`, conexion, lifecycle hooks y acceso a transacciones.
- `machines`: CRUD de maquinaria, filtros por categoria/estado y datos de identificacion operativa.
- `maintenance-plans`: reglas de frecuencia por maquina, calculo de proximo vencimiento y activacion/desactivacion de planes.
- `maintenance-logs`: registro de mantenimientos ejecutados, resultado tecnico, observaciones, responsable y fallos criticos.
- `notifications`: generacion, deduplicacion, listado y cambio de estado de alertas preventivas/urgentes.
- `health`: endpoint de salud para validar API y conexion a base de datos.

Cada modulo de dominio debe contener sus propios `controller`, `service`, DTOs y pruebas cuando se implementen. Evitar carpetas globales tipo `controllers/`, `services/` o `repositories/` fuera del dominio.

## Frontend Next.js por funcionalidad
- `app/(dashboard)/machines`: listado, alta, edicion y detalle de maquinas.
- `app/(dashboard)/maintenance-plans`: administracion de frecuencias por maquina.
- `app/(dashboard)/maintenance-history`: historial de mantenimientos ejecutados.
- `app/(dashboard)/notifications`: bandeja de alertas preventivas y urgentes.
- `features/*`: componentes de dominio, acciones de datos, formularios y tablas asociados a cada ruta.
- `components/ui`: wrappers propios y genericos sobre Ant Design.
- `components/motion`: wrappers propios para animaciones reutilizables sobre Motion.dev.
- `components/providers`: proveedores globales de Ant Design, Motion.dev y composicion de la aplicacion.
- `lib`: cliente HTTP, utilidades compartidas del frontend y helpers de formato.

No mezclar componentes especificos de dominio dentro de `components/ui` o `components/motion`; esas carpetas deben reservarse para primitivas reutilizables.

## Estandares de UI y animacion

### Ant Design mediante wrappers
- Ant Design es el proveedor visual base; Tailwind queda reservado para layout, spacing y utilidades.
- Las features no pueden importar directamente `antd`, `@ant-design/icons` ni componentes internos de Ant Design.
- Los wrappers exponen una API propia, tipada y pequena, y traducen sus props hacia Ant Design.
- No replicar toda la API de Ant Design; exponer solo capacidades usadas por el producto.
- El tema, locale, tokens y configuracion global viven en `AntdProvider` y `lib/ui/theme.ts`.
- En Next.js App Router, integrar `@ant-design/nextjs-registry` en el layout raiz para SSR de estilos.

### Motion.dev mediante wrappers
- Motion.dev es el proveedor de movimiento; las features no importan directamente `motion/react` ni `motion/react-m`.
- Usar wrappers como `AnimatedPage`, `AnimatedSection`, `AnimatedCard` y `AnimatedList`.
- Centralizar presets, variantes y transiciones en `lib/motion`.
- Configurar `MotionConfig` global con `reducedMotion = user` y preferir `LazyMotion` para reducir el bundle.
- No animar profundamente componentes complejos de Ant Design (`Table`, `Modal`, `Select`); animar el contenedor o usar la animacion nativa del componente.
- Las animaciones de alertas criticas deben ser sobrias y funcionales, no decorativas.

### Impeccable como skill de diseno
- Impeccable es responsable del criterio visual de toda nueva pantalla, feature o iteracion frontend.
- Debe preservar el sistema existente y trabajar con los wrappers propios de Ant Design y Motion.dev.
- Debe priorizar interfaces operativas: lectura rapida, jerarquia clara, estados visibles y baja friccion.
- Cada feature debe revisar estados `loading`, `empty`, `error`, `success`, `warning` y `critical`.
- No crear componentes visuales directos en features ni saltarse la capa de wrappers.
- Impeccable se instala a nivel de proyecto en `.opencode/skills/impeccable` con `npx impeccable install --yes --providers=opencode --project`.
- El primer uso de contexto visual es `/impeccable init`; actualizar con `npx impeccable update` y auditar con `npx impeccable detect <ruta>`.

## Diseno entidad-relacion para `schema.prisma`

### `MachineCategory`
Representa tipos de maquinaria de panaderia.

Campos sugeridos:
- `id`: UUID primary key.
- `name`: nombre unico, por ejemplo `Oven`, `Mixer`, `DoughKneader`.
- `description`: texto opcional.
- `createdAt`, `updatedAt`.

Relaciones:
- Una categoria tiene muchas `Machine`.

### `Machine`
Representa una maquina fisica mantenible.

Campos sugeridos:
- `id`: UUID primary key.
- `categoryId`: FK a `MachineCategory`.
- `name`: nombre operativo visible.
- `serialNumber`: identificador opcional, unico si existe.
- `location`: ubicacion fisica dentro de la panaderia/planta.
- `manufacturer`: fabricante opcional.
- `model`: modelo opcional.
- `status`: enum `MachineStatus` (`ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`).
- `criticality`: enum `MachineCriticality` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `installedAt`: fecha opcional de instalacion.
- `createdAt`, `updatedAt`.

Relaciones:
- Pertenece a una `MachineCategory`.
- Tiene muchos `MaintenancePlan`.
- Tiene muchos `MaintenanceLog`.
- Tiene muchas `Notification`.

### `MaintenancePlan`
Define la frecuencia preventiva de una maquina.

Campos sugeridos:
- `id`: UUID primary key.
- `machineId`: FK a `Machine`.
- `name`: nombre del plan, por ejemplo `Revision general mensual`.
- `description`: instrucciones o alcance del mantenimiento.
- `frequencyDays`: numero entero positivo, por ejemplo 30.
- `warningDaysBefore`: ventana preventiva, por ejemplo 7.
- `isActive`: boolean.
- `startsAt`: fecha desde la que aplica la regla.
- `lastComputedDueAt`: fecha cacheada opcional del proximo vencimiento calculado.
- `createdAt`, `updatedAt`.

Relaciones:
- Pertenece a una `Machine`.
- Tiene muchos `MaintenanceLog`.
- Tiene muchas `Notification`.

Regla:
- Debe existir al menos un plan activo por maquina cuando se quiera generar alertas preventivas.
- `frequencyDays` y `warningDaysBefore` deben validarse en aplicacion como enteros positivos.

### `MaintenanceLog`
Registra una ejecucion real de mantenimiento o incidente.

Campos sugeridos:
- `id`: UUID primary key.
- `machineId`: FK a `Machine`.
- `maintenancePlanId`: FK opcional a `MaintenancePlan`; permite logs correctivos fuera de plan.
- `performedAt`: fecha de ejecucion.
- `type`: enum `MaintenanceType` (`PREVENTIVE`, `CORRECTIVE`, `INSPECTION`).
- `result`: enum `MaintenanceResult` (`OK`, `NEEDS_FOLLOW_UP`, `FAILED`, `CRITICAL_FAILURE`).
- `notes`: observaciones tecnicas.
- `performedBy`: texto temporal con responsable; puede evolucionar a relacion con `User`.
- `createdAt`, `updatedAt`.

Relaciones:
- Pertenece a una `Machine`.
- Puede pertenecer a un `MaintenancePlan`.

Regla:
- Un `CRITICAL_FAILURE` debe disparar una notificacion urgente.
- El ultimo log preventivo exitoso es la base para calcular el siguiente vencimiento de un plan.

### `Notification`
Representa alertas preventivas y urgentes.

Campos sugeridos:
- `id`: UUID primary key.
- `machineId`: FK a `Machine`.
- `maintenancePlanId`: FK opcional a `MaintenancePlan`.
- `type`: enum `NotificationType` (`PREVENTIVE_DUE_SOON`, `PREVENTIVE_OVERDUE`, `URGENT_CRITICAL_FAILURE`).
- `severity`: enum `NotificationSeverity` (`INFO`, `WARNING`, `URGENT`, `CRITICAL`).
- `status`: enum `NotificationStatus` (`OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED`).
- `title`: resumen visible.
- `message`: detalle legible.
- `dueAt`: fecha objetivo del mantenimiento o incidente.
- `resolvedAt`: fecha opcional.
- `createdAt`, `updatedAt`.

Relaciones:
- Pertenece a una `Machine`.
- Puede pertenecer a un `MaintenancePlan`.

Regla:
- Evitar duplicados con una restriccion logica: no debe existir mas de una notificacion `OPEN` para la misma combinacion `machineId`, `maintenancePlanId` y `type`.
- Si Prisma/PostgreSQL no permite expresar exactamente esta unicidad parcial de forma portable, aplicarla en servicio y considerar indice parcial SQL en una migracion manual.

### `User` futuro-minimo
No es obligatorio para el primer CRUD, pero conviene reservar el concepto para ERP/CRM.

Campos sugeridos cuando se implemente:
- `id`: UUID primary key.
- `name`, `email`, `role`, `isActive`.
- `createdAt`, `updatedAt`.

Uso futuro:
- Reemplazar `MaintenanceLog.performedBy` por `performedByUserId`.
- Asignar responsables a notificaciones o planes.

## Enums Prisma sugeridos
- `MachineStatus`: `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`.
- `MachineCriticality`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `MaintenanceType`: `PREVENTIVE`, `CORRECTIVE`, `INSPECTION`.
- `MaintenanceResult`: `OK`, `NEEDS_FOLLOW_UP`, `FAILED`, `CRITICAL_FAILURE`.
- `NotificationType`: `PREVENTIVE_DUE_SOON`, `PREVENTIVE_OVERDUE`, `URGENT_CRITICAL_FAILURE`.
- `NotificationSeverity`: `INFO`, `WARNING`, `URGENT`, `CRITICAL`.
- `NotificationStatus`: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED`.

## Estrategia para notificaciones preventivas

### Calculo de vencimiento
Para cada `MaintenancePlan` activo:
- Buscar el ultimo `MaintenanceLog` del plan con `type = PREVENTIVE` y `result` en `OK` o `NEEDS_FOLLOW_UP`.
- Si existe log previo, usar `performedAt` como base.
- Si no existe log previo, usar `startsAt` como base.
- Calcular `nextDueAt = baseDate + frequencyDays`.
- Calcular `warningStartsAt = nextDueAt - warningDaysBefore`.

### Generacion de alerta preventiva
- Si `now >= warningStartsAt` y `now < nextDueAt`, crear o mantener `PREVENTIVE_DUE_SOON` con severidad `WARNING`.
- Si `now >= nextDueAt`, crear o mantener `PREVENTIVE_OVERDUE` con severidad `URGENT`.
- Si la maquina tiene `criticality = CRITICAL`, elevar vencimientos vencidos a severidad `CRITICAL`.

### Generacion de alerta urgente
- Al crear un `MaintenanceLog` con `result = CRITICAL_FAILURE`, crear inmediatamente `URGENT_CRITICAL_FAILURE`.
- La alerta urgente no depende de la frecuencia preventiva.
- Cambiar la maquina a `UNDER_MAINTENANCE` puede ser una regla de aplicacion posterior si el usuario lo confirma.

### Deduplicacion
- Antes de crear una notificacion, buscar una notificacion `OPEN` con la misma `machineId`, `maintenancePlanId` y `type`.
- Si existe, actualizar `dueAt`, `title`, `message` o `severity` solo si cambiaron.
- Resolver o cerrar alertas preventivas abiertas cuando se registre un mantenimiento preventivo exitoso posterior al `dueAt`.

### Ejecucion del motor
- Implementacion inicial recomendada: job programado en NestJS con `@nestjs/schedule`.
- Frecuencia sugerida: una vez por hora en desarrollo o una vez al dia si solo interesan fechas calendario.
- Exponer un endpoint/admin command interno para ejecutar el calculo manualmente durante pruebas.
- Mantener la logica principal en un servicio puro para poder probarla sin depender del cron.

## Reglas de evolucion hacia ERP/CRM
- No introducir ventas, clientes, facturacion o inventario hasta estabilizar el dominio de mantenimiento.
- Mantener entidades actuales desacopladas para permitir futuros modulos: clientes, sucursales, tecnicos, repuestos, ordenes de trabajo y contratos.
- Preferir IDs UUID desde el inicio para facilitar integraciones futuras.
- Evitar hardcodear tipos de maquinas en codigo; usar `MachineCategory` sembrada por datos iniciales.

## Primeros hitos recomendados cuando se apruebe implementar
1. Inicializar monorepo y scripts base.
2. Crear API NestJS con Prisma y health check.
3. Crear `schema.prisma`, migracion inicial y seed de categorias (`Oven`, `Mixer`, `DoughKneader`).
4. Implementar CRUD de maquinas.
5. Implementar planes de mantenimiento.
6. Implementar logs de mantenimiento.
7. Implementar motor de notificaciones y endpoint/listado.
8. Crear UI dashboard con wrappers propios sobre Ant Design y Motion.dev para maquinas, planes, historial y alertas.
