# Plan de Desarrollo

## 1. Objetivo del producto

Construir un sistema de mantenimiento para maquinaria de panaderia, preparado para crecer posteriormente hacia un ERP/CRM.

El alcance inicial incluye:

- CRUD y listado de maquinas: hornos, batidoras, amasadoras y futuras categorias.
- Configuracion de frecuencias de mantenimiento, por ejemplo cada 30 dias.
- Registro de mantenimientos ejecutados e historial tecnico.
- Notificaciones preventivas por proximidad o vencimiento.
- Notificaciones urgentes por fallos criticos.

No se implementaran ventas, clientes, facturacion, inventario ni otros modulos ERP/CRM hasta completar y estabilizar este alcance.

## 2. Estado actual

El repositorio se encuentra en preparacion de las siguientes fases; la Fase 1 frontend y la base de la Fase 2 backend ya fueron implementadas y verificadas.

Ya esta definido:

- `AGENTS.md` con las reglas para futuras sesiones.
- `bakery-maintenance-architecture.skill.md` con el modelo de dominio y la arquitectura propuesta.
- Monorepo npm inicial con workspaces para `apps/*` y `packages/*`.
- Dependencias frontend instaladas en `apps/web`.
- Impeccable instalado en `.opencode/skills/impeccable`.

Dependencias frontend base:

- Next.js.
- React.
- TypeScript.
- Ant Design.
- `@ant-design/icons`.
- `@ant-design/nextjs-registry`.
- Motion.dev mediante el paquete `motion`.

La app Next.js base de la Fase 1 existe en `apps/web`. La Fase 2 ya incluye NestJS, Prisma 7, configuracion de PostgreSQL, validacion global, lifecycle de Prisma y `/api/health`; la conexion efectiva requiere credenciales locales validas en `apps/api/.env`. La Fase 3 agrega el modelo de datos inicial, la migracion y el seed repetible. La Fase 4 agrega el vertical backend de maquinas con CRUD, filtros y desactivacion segura. La Fase 5 agrega planes preventivos, calculo de vencimientos y activacion segura. La Fase 6 agrega el historial de mantenimientos y alertas urgentes para fallos criticos. La Fase 7 agrega el motor preventivo, bandeja de notificaciones, transiciones de estado y job horario.

## 3. Stack y reglas no negociables

- Backend: NestJS con TypeScript.
- Frontend: Next.js App Router con TypeScript.
- UI: Ant Design, consumido unicamente mediante wrappers propios.
- Animaciones: Motion.dev, consumido unicamente mediante wrappers y presets propios.
- Layout y utilidades: Tailwind.
- Base de datos: PostgreSQL local.
- ORM: Prisma.
- Arquitectura: monorepo orientado a funcionalidad.
- Nombres de dominio en codigo: `Machine`, `MaintenancePlan`, `MaintenanceLog`, `Notification`.

Reglas de aislamiento:

- Las features no importan directamente `antd` ni `@ant-design/icons`.
- Las features no importan directamente `motion/react` ni `motion/react-m`.
- `packages/shared` no debe depender de librerias visuales.
- `components/ui` contiene wrappers genericos sobre Ant Design, no componentes de dominio.
- `components/motion` contiene wrappers y componentes genericos de animacion, no reglas de negocio.
- Tailwind no debe usarse para reconstruir componentes que ya proporciona Ant Design.
- Toda nueva feature frontend debe seguir el criterio visual de Impeccable.

## 4. Arquitectura de carpetas objetivo

```text
apps/
  api/
    src/
      main.ts
      app.module.ts
      prisma/
      health/
      machines/
      maintenance-plans/
      maintenance-logs/
      notifications/
    prisma/
      schema.prisma
      seed.ts
  web/
    app/
      layout.tsx
      page.tsx
      (dashboard)/
        machines/
        maintenance-plans/
        maintenance-history/
        notifications/
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
      api/
      motion/
        presets.ts
        transitions.ts
        variants.ts
      ui/
        theme.ts
  packages/
    shared/
      src/
```

Cada modulo backend y cada feature frontend debe mantener sus componentes, servicios, tipos y pruebas cerca de su dominio. Evitar capas globales genericas como `controllers/`, `services/` o `repositories/`.

## 5. Fase 1: Base frontend

### Objetivo

Crear una aplicacion Next.js minima y validar la integracion entre Next.js, Ant Design, Motion.dev, Tailwind e Impeccable antes de construir funcionalidades de negocio.

### Trabajo

- Crear la estructura real de Next.js en `apps/web`.
- Configurar App Router, TypeScript y Tailwind.
- Crear `app/layout.tsx` y `app/page.tsx`.
- Crear `AntdProvider` con `ConfigProvider`, locale y tokens globales.
- Integrar `AntdRegistry` en el layout raiz para SSR de estilos.
- Crear `MotionProvider` con `MotionConfig` y `reducedMotion = user`.
- Preferir `LazyMotion` para reducir el bundle inicial.
- Crear `AppProviders` como composicion unica de providers.
- Crear wrappers iniciales: `AppButton`, `AppCard` o `AppAlert`.
- Crear wrappers de movimiento: `AnimatedPage`, `AnimatedSection` y `AnimatedCard`.
- Crear presets iniciales de entrada, salida, hover y listas.
- Crear un dashboard inicial de validacion, sin logica de negocio.

### Criterios de aceptacion

- La app inicia con `npm run dev:web`.
- Ant Design renderiza sin parpadeo de estilos en App Router.
- Motion.dev funciona desde wrappers client-side.
- La preferencia de movimiento reducido es respetada.
- No hay imports directos de Ant Design o Motion.dev fuera de providers/wrappers.
- La pantalla inicial es responsive en desktop y mobile.
- La UI no contiene componentes genericos sin proposito ni patrones visuales repetitivos.

### Verificacion

```text
npm install
npm run build:web
npx impeccable detect apps/web
```

## 6. Fase 2: Base backend

### Objetivo

Crear una API NestJS minima, preparada para Prisma y los modulos de dominio.

### Trabajo

- Crear `apps/api` como workspace NestJS.
- Configurar `main.ts` y `app.module.ts`.
- Configurar validacion global de DTOs.
- Configurar manejo consistente de errores HTTP.
- Crear `health` module con endpoint de salud.
- Crear `prisma` module con `PrismaService` y lifecycle hooks.
- Agregar `.env.example` con `DATABASE_URL`.
- Documentar el comando real de desarrollo y build de la API.

### Criterios de aceptacion

- La API inicia localmente.
- El endpoint de salud responde correctamente.
- La configuracion no contiene secretos versionados.
- Prisma se puede inyectar en un modulo NestJS.
- Los errores de validacion tienen una respuesta consistente.

## 7. Fase 3: Modelo de datos y Prisma

### Entidades iniciales

- `MachineCategory`: categoria de maquina.
- `Machine`: maquina fisica mantenible.
- `MaintenancePlan`: frecuencia y regla preventiva.
- `MaintenanceLog`: mantenimiento ejecutado o incidente.
- `Notification`: alerta preventiva o urgente.

### Enums iniciales

- `MachineStatus`: `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `RETIRED`.
- `MachineCriticality`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `MaintenanceType`: `PREVENTIVE`, `CORRECTIVE`, `INSPECTION`.
- `MaintenanceResult`: `OK`, `NEEDS_FOLLOW_UP`, `FAILED`, `CRITICAL_FAILURE`.
- `NotificationType`: `PREVENTIVE_DUE_SOON`, `PREVENTIVE_OVERDUE`, `URGENT_CRITICAL_FAILURE`.
- `NotificationSeverity`: `INFO`, `WARNING`, `URGENT`, `CRITICAL`.
- `NotificationStatus`: `OPEN`, `ACKNOWLEDGED`, `RESOLVED`, `DISMISSED`.

### Trabajo

- Implementar `schema.prisma` siguiendo `bakery-maintenance-architecture.skill.md`.
- Usar UUID como identificadores.
- Agregar timestamps consistentes.
- Definir relaciones y reglas de borrado conscientemente.
- Agregar indices para relaciones, estado y fechas de vencimiento.
- Crear migracion inicial.
- Crear `seed.ts` con `Oven`, `Mixer` y `DoughKneader`.

### Criterios de aceptacion

- La migracion se aplica sobre PostgreSQL local.
- Prisma Client se genera correctamente.
- El seed es repetible o falla de forma explicita sin duplicar datos.
- Las relaciones soportan maquinas, planes, logs y notificaciones.
- Las fechas se almacenan con una estrategia de zona horaria definida.

## 8. Fase 4: Vertical Machines

### Backend

- Crear modulo `machines`.
- Implementar crear, listar, consultar, actualizar y desactivar maquinas.
- Agregar filtros por categoria, estado, criticidad y ubicacion.
- Validar nombre, categoria y datos operativos.
- No borrar fisicamente registros que puedan tener historial; preferir estado `RETIRED`.

### Frontend

- Crear listado responsive.
- Crear formulario de alta y edicion con wrappers propios.
- Crear vista de detalle.
- Mostrar estado y criticidad con `AppTag` o wrapper equivalente.
- Cubrir loading, empty, error, success y confirmacion de acciones.
- Aplicar animaciones funcionales mediante wrappers Motion.dev.
- Ejecutar revision de Impeccable antes de cerrar la feature.

### Criterios de aceptacion

- Un usuario puede gestionar maquinas sin acceder directamente a la base de datos.
- Los errores de validacion se muestran en la UI.
- La informacion principal se entiende rapidamente.
- La feature no importa directamente Ant Design ni Motion.dev.
- API y UI tienen pruebas para los flujos principales.

## 9. Fase 5: Maintenance Plans

### Trabajo

- Crear planes asociados a una maquina.
- Configurar `frequencyDays`, `warningDaysBefore`, `startsAt` e `isActive`.
- Validar que las frecuencias sean enteros positivos.
- Mostrar el proximo vencimiento calculado.
- Permitir activar y desactivar planes.
- Evitar duplicar reglas preventivas equivalentes para la misma maquina sin una justificacion explicita.

### Criterios de aceptacion

- Cada plan activo tiene una fecha de vencimiento determinable.
- La UI identifica claramente planes activos, proximos y vencidos.
- Cambiar un plan no altera el historial ya registrado.
- Los calculos de fechas tienen pruebas con casos limite.

## 10. Fase 6: Maintenance Logs

### Trabajo

- Crear modulo de logs.
- Registrar mantenimientos preventivos, correctivos e inspecciones.
- Registrar fecha, resultado, notas y responsable.
- Permitir asociar un log a un plan o dejarlo como correctivo independiente.
- Mostrar historial por maquina y por plan.
- Tratar `CRITICAL_FAILURE` como evento urgente.

### Criterios de aceptacion

- Un log no puede registrarse sin maquina, fecha, tipo y resultado.
- El historial es inmutable en sus datos esenciales una vez creado, salvo correccion autorizada.
- El ultimo mantenimiento preventivo valido puede ser usado por el motor de vencimientos.
- Un fallo critico genera una alerta urgente.

## 11. Fase 7: Motor de notificaciones

### Calculo preventivo

Para cada `MaintenancePlan` activo:

1. Buscar el ultimo log preventivo valido.
2. Usar `performedAt` como base; si no existe, usar `startsAt`.
3. Calcular `nextDueAt = baseDate + frequencyDays`.
4. Calcular `warningStartsAt = nextDueAt - warningDaysBefore`.
5. Crear alerta preventiva si se entra en la ventana de aviso.
6. Crear alerta urgente si se supera la fecha de vencimiento.

### Eventos urgentes

- Un log con `CRITICAL_FAILURE` crea `URGENT_CRITICAL_FAILURE` inmediatamente.
- La alerta urgente no depende de la frecuencia preventiva.
- La maquina puede pasar a `UNDER_MAINTENANCE` mediante una regla explicita de aplicacion.

### Deduplicacion y resolucion

- No crear otra alerta abierta para la misma maquina, plan y tipo.
- Actualizar severidad y fechas si el estado calculado cambia.
- Resolver alertas preventivas abiertas cuando se registra un mantenimiento preventivo valido.
- Mantener trazabilidad de resolucion y fecha de cierre.

### Ejecucion

- Usar un job programado de NestJS con `@nestjs/schedule`.
- Ejecutar inicialmente una vez por hora o con la frecuencia que se defina para produccion.
- Mantener el calculo en un servicio testeable sin depender del cron.
- Exponer un comando o endpoint interno para ejecucion manual durante pruebas.

### Criterios de aceptacion

- El job es idempotente.
- No genera duplicados al ejecutarse repetidamente.
- Detecta proximidad, vencimiento y fallo critico.
- Tiene pruebas para fechas exactas, limites de ventana y zonas horarias.
- La UI diferencia claramente warning, urgente y critical.

## 12. Fase 8: Dashboard operativo

### Indicadores iniciales

- Total de maquinas activas.
- Maquinas bajo mantenimiento.
- Mantenimientos proximos.
- Mantenimientos vencidos.
- Notificaciones urgentes abiertas.
- Ultimos mantenimientos registrados.

### Reglas de UI

- Priorizar lectura rapida y tareas operativas.
- No ocultar alertas criticas dentro de componentes decorativos.
- Usar Ant Design solo mediante wrappers.
- Usar Motion.dev para transiciones de secciones, listas y estados, no para distraer.
- Aplicar Impeccable a la composicion, jerarquia, densidad y consistencia visual.

## 13. Orden de trabajo por feature

Cada nueva feature debe seguir este orden:

1. Confirmar alcance y reglas de negocio.
2. Revisar el modelo de dominio y contratos compartidos.
3. Implementar backend y pruebas de dominio.
4. Implementar acceso frontend a la API.
5. Construir UI usando wrappers de Ant Design.
6. Aplicar movimiento usando wrappers y presets de Motion.dev.
7. Cubrir loading, empty, error, success, warning y critical.
8. Ejecutar auditoria de Impeccable.
9. Ejecutar build y pruebas focalizadas.
10. Actualizar documentacion si cambia una convencion.

## 14. Verificacion global

Comandos actualmente disponibles:

```text
npm install
npm run dev:web
npm run build:web
npm run start:api
npm run build:api
npm run test:api
npm run typecheck:api
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:seed
npx impeccable update
npx impeccable detect <ruta>
```

Los comandos de tests unitarios y de integracion se agregaran junto con los modulos de dominio de las siguientes fases.

Orden recomendado de CI una vez exista codigo:

1. Instalar dependencias.
2. Validar formato y lint.
3. Ejecutar typecheck.
4. Ejecutar tests unitarios.
5. Ejecutar tests de integracion con PostgreSQL.
6. Ejecutar build.
7. Ejecutar auditoria de Impeccable sobre las rutas frontend.

## 15. Fuera de alcance inicial

- Autenticacion y autorizacion avanzada, salvo que sea necesaria para operar el MVP.
- Multiempresa o multitenancy.
- Clientes y CRM.
- Ventas, cotizaciones y facturacion.
- Inventario y repuestos.
- Compras y proveedores.
- Aplicacion movil.
- Integraciones externas de mensajeria.

Estos temas pueden planificarse despues de que maquinas, planes, logs y notificaciones sean funcionales y estables.

## 16. Definicion de terminado

Una fase se considera terminada solo cuando:

- Sus entregables estan implementados.
- Sus reglas de negocio tienen pruebas.
- La UI usa exclusivamente las capas de abstraccion definidas.
- No existen imports prohibidos en features.
- Se verificaron los estados de interfaz relevantes.
- El build correspondiente pasa.
- La documentacion refleja cualquier cambio de arquitectura.
