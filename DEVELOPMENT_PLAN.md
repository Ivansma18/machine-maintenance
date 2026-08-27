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

Las Fases 1 a 8 ya fueron implementadas y verificadas. El siguiente bloque corresponde al frontend operativo del MVP, seguido de una preparacion documental para Auth/Roles sin implementar autenticacion ni autorizacion.

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

La app Next.js base de la Fase 1 existe en `apps/web`. La Fase 2 ya incluye NestJS, Prisma 7, configuracion de PostgreSQL, validacion global, lifecycle de Prisma y `/api/health`; la conexion efectiva requiere credenciales locales validas en `apps/api/.env`. La Fase 3 agrega el modelo de datos inicial, la migracion y el seed repetible. La Fase 4 agrega el vertical backend de maquinas con CRUD, filtros y desactivacion segura. La Fase 5 agrega planes preventivos, calculo de vencimientos y activacion segura. La Fase 6 agrega el historial de mantenimientos y alertas urgentes para fallos criticos. La Fase 7 agrega el motor preventivo, bandeja de notificaciones, transiciones de estado y job horario. La Fase 8 agrega el dashboard operativo conectado al resumen de la API. Las Fases 9 a 13 completan el frontend operativo del MVP y la Fase 14 prepara el sistema para Auth/Roles sin implementarlo.

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

### Convenciones de composicion frontend

- Los entrypoints obligatorios de Next.js (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` y `not-found.tsx`) solo conectan el router con componentes descriptivos.
- Las paginas no contienen logica de negocio, acceso HTTP, estado complejo, helpers ni bloques extensos de UI.
- Cada feature debe separar `components/`, `hooks/`, `api/`, `types.ts` y `utils/` cuando tenga mas de una responsabilidad.
- Los componentes son presentacionales y reciben datos y callbacks mediante props.
- Los hooks contienen estado, efectos, carga, errores, reintentos y acciones de la feature.
- La capa `api/` contiene exclusivamente clientes HTTP y normalizacion de respuestas de la feature.
- `utils/` contiene funciones puras y testeables, sin React ni acceso a infraestructura.
- Las utilidades, componentes, hooks y contratos reutilizables entre features se declaran una sola vez en ubicaciones globales de `apps/web` (`lib/`, `components/`, `hooks/` o `types/`) y las features los consumen; no se duplican implementaciones compartidas dentro de cada feature.
- Las carpetas `features/<feature>/utils/` se reservan para transformaciones y reglas propias del dominio de esa feature.
- Usar nombres semanticos para componentes de pagina, como `OperationalDashboardPage`; conservar `page.tsx` solo por la convencion de Next.js.
- Aplicar Clean Code y SOLID: responsabilidad unica, cohesion alta, bajo acoplamiento y dependencias explicitas.

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

## 13. Fase 9: Frontend Machines

### Objetivo

Construir la primera pantalla operativa completa del frontend para administrar las maquinas del sistema.

### Entregables

- Crear la ruta `apps/web/app/machines/page.tsx` como entrypoint minimo de Next.js.
- Crear la pagina descriptiva `MachinesPage` dentro de `apps/web/features/machines`.
- Crear el cliente API para listar, crear, actualizar y desactivar maquinas.
- Crear hooks para carga, filtros, paginacion, creacion, edicion, desactivacion, retry y refresh.
- Crear listado o tabla responsive de maquinas.
- Agregar filtros por busqueda, estado y categoria.
- Agregar acciones para crear, editar y desactivar.
- Agregar confirmacion para la desactivacion.
- Cubrir estados loading, empty, error, success y acciones en progreso.

### Reglas de negocio

- Una maquina desactivada no se elimina fisicamente.
- Las maquinas retiradas deben seguir siendo visibles cuando el usuario filtre por ese estado.
- Los formularios deben respetar las validaciones existentes del backend.
- La UI debe mostrar claramente maquinas activas, inactivas, retiradas y bajo mantenimiento.

### Criterios de aceptacion

- La feature consume exclusivamente los endpoints existentes de `apps/api/src/machines`.
- `page.tsx` solo compone `MachinesPage`.
- La feature no importa directamente `antd`, `@ant-design/icons`, `motion/react` ni `motion/react-m`.
- Las acciones actualizan el listado sin requerir una recarga manual de la pagina.
- `npm run build:web` y las pruebas focalizadas pasan.
- La auditoria de Impeccable no reporta problemas relevantes.

## 14. Fase 10: Frontend Maintenance Plans

### Objetivo

Permitir administrar las frecuencias preventivas asociadas a las maquinas.

### Entregables

- Crear la ruta `apps/web/app/maintenance-plans/page.tsx`.
- Crear la pagina descriptiva `MaintenancePlansPage` dentro de `apps/web/features/maintenance-plans`.
- Crear el cliente API para listar, crear, actualizar, activar y desactivar planes.
- Crear hooks para listado, filtros, formularios, retry y refresh.
- Mostrar los planes preventivos con su maquina asociada, frecuencia, proxima fecha y estado.
- Agregar filtros por maquina, estado activo/inactivo y situacion de vencimiento.
- Crear formulario para frecuencia, ventana preventiva, proxima fecha y maquina.
- Mostrar indicadores `dueSoon` y `overdue`.
- Cubrir estados loading, empty, error, success, warning y critical.

### Reglas de negocio

- Activar o desactivar un plan no elimina el historial de mantenimientos.
- Las fechas calculadas por el backend son la fuente de verdad para `dueSoon` y `overdue`.
- Un plan inactivo no debe presentarse como trabajo preventivo pendiente.
- Los formularios deben respetar las validaciones y limites existentes del backend.

### Criterios de aceptacion

- La pantalla permite identificar rapidamente los planes que requieren atencion.
- Las acciones actualizan la vista sin recarga manual.
- `page.tsx` solo compone `MaintenancePlansPage`.
- No existen imports prohibidos dentro de la feature.
- `npm run build:web` y las pruebas focalizadas pasan.
- La auditoria de Impeccable no reporta problemas relevantes.

## 15. Fase 11: Frontend Maintenance Logs

### Objetivo

Registrar mantenimientos desde la UI y consultar el historial operativo sin permitir modificaciones posteriores.

### Entregables

- Crear la ruta `apps/web/app/maintenance-logs/page.tsx`.
- Crear la pagina descriptiva `MaintenanceLogsPage` dentro de `apps/web/features/maintenance-logs`.
- Crear el cliente API para listar y registrar mantenimientos.
- Crear hooks para listado, filtros, registro, retry y refresh.
- Crear formulario para mantenimiento preventivo, correctivo e inspeccion.
- Crear historial filtrable por maquina, tipo, resultado y fecha.
- Mostrar `OK`, `NEEDS_FOLLOW_UP`, `FAILED` y `CRITICAL_FAILURE` con jerarquia visual clara.
- Cubrir estados loading, empty, error, success, warning y critical.

### Reglas de negocio

- Los logs son inmutables desde la UI: no se editan ni eliminan.
- Un resultado `CRITICAL_FAILURE` debe comunicar que existe una consecuencia urgente en el sistema de notificaciones.
- El historial debe mostrar maquina, plan cuando exista, fecha, responsable, tipo y resultado.
- La UI no debe duplicar reglas de calculo que pertenecen al backend.

### Criterios de aceptacion

- El usuario puede registrar un mantenimiento valido desde el frontend.
- El usuario puede consultar el historial de forma comprensible.
- Los errores de validacion se muestran junto al campo correspondiente.
- `page.tsx` solo compone `MaintenanceLogsPage`.
- `npm run build:web` y las pruebas focalizadas pasan.
- La auditoria de Impeccable no reporta problemas relevantes.

## 16. Fase 12: Frontend Notifications

### Objetivo

Construir la bandeja operativa de alertas y permitir gestionar sus transiciones de estado.

### Entregables

- Crear la ruta `apps/web/app/notifications/page.tsx`.
- Crear la pagina descriptiva `NotificationsPage` dentro de `apps/web/features/notifications`.
- Crear el cliente API para listar, reconocer, resolver, descartar y procesar notificaciones preventivas.
- Crear hooks para listado, filtros, acciones, retry y refresh.
- Agregar filtros por severidad, estado, tipo y maquina.
- Agregar acciones `acknowledge`, `resolve`, `dismiss` y `process preventive notifications`.
- Diferenciar visualmente warning, urgent y critical.
- Cubrir estados loading, empty, error, success, warning y critical.

### Reglas de negocio

- Las alertas criticas no deben quedar ocultas dentro de componentes secundarios.
- Las transiciones de estado deben respetar las reglas del backend.
- Ejecutar manualmente el motor preventivo debe refrescar la bandeja.
- La UI debe diferenciar alertas preventivas de alertas generadas por fallos criticos.

### Criterios de aceptacion

- El usuario puede localizar rapidamente las alertas abiertas mas importantes.
- Las acciones reflejan su resultado y actualizan el estado visible.
- `page.tsx` solo compone `NotificationsPage`.
- No existen imports prohibidos dentro de la feature.
- `npm run build:web` y las pruebas focalizadas pasan.
- La auditoria de Impeccable no reporta problemas relevantes.

## 17. Fase 13: Navigation y App Shell operativo

### Objetivo

Consolidar la navegacion entre las pantallas principales del MVP antes de iniciar Auth/Roles.

### Entregables

- Crear o consolidar un app shell compartido para dashboard y features operativas.
- Agregar navegacion entre Dashboard, Machines, Maintenance Plans, Maintenance Logs y Notifications.
- Mostrar estado activo de la ruta actual.
- Mantener una experiencia responsive para desktop y mobile.
- Unificar headers, breadcrumbs, acciones principales, botones, tags y feedback.
- Unificar manejo de loading, empty, error, success, warning y critical.
- Revisar accesibilidad de navegacion, formularios, tablas, drawers y confirmaciones.

### Criterios de aceptacion

- Todas las rutas principales son navegables sin introducir URLs manualmente.
- La navegacion mantiene contexto suficiente para el usuario operativo.
- El app shell no duplica layout entre features.
- La experiencia funciona en desktop y mobile.
- Las features siguen usando exclusivamente wrappers propios.
- `npm run build:web` y las pruebas focalizadas pasan.
- La auditoria de Impeccable cubre las rutas principales.

## 18. Fase 14: Preparacion pre-Auth/Roles

### Objetivo

Dejar documentados los puntos de integracion y permisos necesarios para una futura fase de autenticacion y autorizacion, sin implementar Auth/Roles.

### Entregables

- Revisar donde impactaran permisos en maquinas, planes, logs y notificaciones.
- Documentar roles candidatos: `Admin`, `Maintenance Manager`, `Technician` y `Viewer`.
- Documentar permisos candidatos por feature y accion.
- Identificar operaciones que requeriran identidad real del usuario.
- Identificar auditoria adicional necesaria para cambios y transiciones de estado.
- Actualizar documentacion de arquitectura con las decisiones de Auth/Roles y sus puntos de evolucion.

### Restricciones

- No implementar login.
- No implementar sesiones, guards, JWT, roles ni permisos.
- No agregar usuarios simulados como solucion temporal.
- No condicionar acciones mediante roles hardcodeados.

### Criterios de aceptacion

- El MVP operativo funciona localmente sin control de acceso.
- Las decisiones necesarias para Auth/Roles quedan documentadas.
- Los futuros puntos de integracion no requieren reestructurar las features existentes.
- El siguiente bloque de trabajo queda definido como diseno e implementacion de Auth/Roles.

### Documento de decisiones

- Las decisiones de roles, permisos, identidad, auditoria y puntos de integracion estan documentadas en `docs/auth-roles-readiness.md`.
- El MVP permanece sin control de acceso ejecutable hasta aprobar la arquitectura de Auth/Roles.

## 19. Fase 15: Diseno tecnico final de Auth/Roles

### Objetivo

Convertir las decisiones de preparacion en un contrato tecnico implementable sin introducir todavia codigo de autenticacion.

### Entregables

- Documentar el contrato tecnico completo en `docs/auth-roles-technical-design.md`.
- Confirmar login con `email` o `username` mas password.
- Confirmar permisos globales y usuarios con multiples roles.
- Definir modelos `User`, `Role`, `Permission`, `UserRole`, `RolePermission` y `Session`.
- Definir cookie `HttpOnly`, `SameSite=Lax`, `Secure` en produccion y `Path=/`.
- Definir expiracion por inactividad de siete dias usando `lastSeenAt` y `expiresAt`.
- Definir sesiones multiples y revocacion individual por sesion.
- Definir contratos `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`.
- Definir variables de seed del admin inicial y reglas de idempotencia.
- Definir limites entre `auth`, `authorization`, dominios y frontend global.
- Definir errores HTTP y pruebas de contrato para las fases de implementacion.

### Criterios de aceptacion

- El contrato no depende de un proveedor externo concreto.
- El diseño permite agregar OIDC, scopes por planta y cuentas de servicio despues.
- No se implementan login, sesiones ni permisos ejecutables en esta fase.
- Fases 16 a 21 tienen una secuencia de implementacion y verificacion clara.

## 20. Fase 16: Prisma Auth Schema y Seed

### Objetivo

Crear la persistencia de usuarios, roles, permisos y sesiones.

### Entregables

- Agregar modelos Prisma de Auth/Roles y relaciones muchos-a-muchos.
- Agregar `Session` con hash de token, `lastSeenAt`, `expiresAt` y `revokedAt`.
- Crear migracion e indices para email, username, sesiones y relaciones.
- Crear seed repetible de permisos y roles base.
- Crear admin inicial desde `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD`.
- Actualizar `.env.example` sin versionar credenciales reales.

### Criterios de aceptacion

- Passwords almacenadas unicamente como hashes.
- El seed falla explicitamente si faltan variables obligatorias del admin.
- `prisma:generate`, `prisma:validate` y las pruebas existentes pasan.

## 21. Fase 17: Backend Auth

### Objetivo

Implementar autenticacion local y sesiones seguras por cookie.

### Entregables

- Crear modulo `auth` con hashing, login, logout y consulta de sesion.
- Aceptar email o username como `identifier` en login.
- Crear una sesion nueva por login y permitir multiples sesiones por usuario.
- Guardar solo el hash del token en la base de datos.
- Renovar `lastSeenAt` y `expiresAt` en cada request autenticado.
- Expirar sesiones sin actividad durante siete dias.
- Revocar solo la sesion actual en logout.
- Crear `GET /api/auth/me` con usuario, roles y permisos efectivos.
- Crear tests de login, logout, expiracion, revocacion, usuario inactivo y multiples sesiones.

### Criterios de aceptacion

- La cookie no expone password, roles, permisos ni datos sensibles.
- Una sesion revocada no puede volver a autenticarse.
- El MVP puede permanecer abierto hasta completar la autorizacion de la Fase 18.

## 22. Fase 18: Backend Authorization

### Objetivo

Proteger la API mediante sesion autenticada y permisos globales.

### Entregables

- Crear guard de sesion.
- Crear decorator y guard de permisos.
- Resolver permisos efectivos a partir de multiples roles.
- Proteger endpoints de dashboard, maquinas, planes, logs y notificaciones.
- Respetar las transiciones de negocio existentes despues de validar permisos.
- Agregar tests de `401`, `403` y matriz de roles.

### Matriz minima

- `Admin`: todos los permisos.
- `Maintenance Manager`: gestion completa del dominio operativo.
- `Technician`: lectura, creacion de logs y transiciones operativas asignadas por la politica global.
- `Viewer`: lectura.

### Criterios de aceptacion

- La seguridad no depende de la UI.
- No existe endpoint operativo sensible sin permiso asignado.
- Un usuario puede acumular permisos mediante multiples roles.

## 23. Fase 19: Frontend Auth

### Objetivo

Conectar el frontend con la sesion real y reflejar capacidades sin duplicar features.

### Entregables

- Crear ruta y formulario de login.
- Crear provider global de sesion.
- Configurar cliente HTTP con `credentials: 'include'`.
- Consultar `/api/auth/me` al cargar la app.
- Manejar globalmente `401`, `403`, sesion expirada y acceso denegado.
- Crear logout.
- Exponer capacidades por permiso a las features.
- Ocultar o deshabilitar acciones sin permiso solo como mejora de UX.

### Criterios de aceptacion

- Refresh conserva una sesion valida.
- Logout invalida la sesion actual.
- `Viewer` no ve acciones de escritura.
- Una llamada manual sin permiso sigue bloqueada por la API.

## 24. Fase 20: Hardening Auth/Roles

### Objetivo

Validar seguridad basica, regresion y operacion local antes de auditar acciones.

### Entregables

- Revisar cookies, expiracion, renovacion y logout.
- Validar multiples sesiones y revocacion individual.
- Validar usuario inactivo y errores sin filtracion de informacion.
- Completar tests de regresion y matriz de permisos.
- Verificar que todas las rutas protegidas tengan permiso asignado.
- Documentar seed del admin, reset local y flujo de desarrollo.
- Preparar backlog de auditoria.

### Criterios de aceptacion

- El MVP completo funciona con los cuatro roles.
- No hay credenciales reales versionadas.
- No hay endpoint sensible sin proteccion.

## 25. Fase 21: Auditoria

### Objetivo

Registrar acciones criticas despues de contar con identidad real.

### Entregables

- Crear `AuditEvent` con actor, accion, entidad, estado anterior/posterior, `requestId` y fecha.
- Auditar maquinas, planes, logs, notificaciones y ejecucion del motor preventivo.
- Registrar identidad de servicio para jobs internos.
- Sanitizar estados antes de persistirlos.
- Agregar tests y, si el alcance lo requiere, una consulta interna para `Admin`.

### Restricciones

- No guardar passwords, tokens ni secretos.
- Los logs de mantenimiento siguen siendo inmutables.

## 26. Orden de trabajo por feature

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

## 27. Verificacion global

Comandos actualmente disponibles:

```text
npm install
npm run dev
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

Puertos locales definidos para evitar conflictos con otros proyectos:

- API: `http://localhost:3002`.
- Frontend: `http://localhost:5174`.

Los comandos de tests unitarios y de integracion se agregaran junto con los modulos de dominio de las siguientes fases.

Orden recomendado de CI una vez exista codigo:

1. Instalar dependencias.
2. Validar formato y lint.
3. Ejecutar typecheck.
4. Ejecutar tests unitarios.
5. Ejecutar tests de integracion con PostgreSQL.
6. Ejecutar build.
7. Ejecutar auditoria de Impeccable sobre las rutas frontend.

## 28. Fuera del alcance Auth/Roles inicial

- Auditoria permanece fuera del primer bloque Auth/Roles y se implementara en la Fase 21.
- Multiempresa o multitenancy.
- Clientes y CRM.
- Ventas, cotizaciones y facturacion.
- Inventario y repuestos.
- Compras y proveedores.
- Aplicacion movil.
- Integraciones externas de mensajeria.

Estos temas pueden planificarse despues de que las Fases 15 a 21 sean funcionales, estables y verificadas.

## 29. Definicion de terminado

Una fase se considera terminada solo cuando:

- Sus entregables estan implementados.
- Sus reglas de negocio tienen pruebas.
- La UI usa exclusivamente las capas de abstraccion definidas.
- No existen imports prohibidos en features.
- Se verificaron los estados de interfaz relevantes.
- El build correspondiente pasa.
- La documentacion refleja cualquier cambio de arquitectura.
