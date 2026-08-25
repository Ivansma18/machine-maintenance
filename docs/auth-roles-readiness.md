# Preparacion para Auth y Roles

Este documento define las decisiones y puntos de integracion necesarios para implementar autenticacion y autorizacion despues del MVP operativo. No implementa login, sesiones, JWT, guards, roles ni permisos ejecutables.

## Alcance futuro

La primera implementacion de Auth/Roles debe resolver dos problemas separados:

- **Autenticacion:** demostrar quien es la persona o servicio que realiza la solicitud.
- **Autorizacion:** decidir si esa identidad puede ejecutar una accion sobre el dominio.

El MVP actual continua funcionando sin control de acceso. Las features ya separan acceso HTTP, hooks y UI, por lo que la futura integracion debe concentrarse en la infraestructura y en las politicas de dominio, no en duplicar formularios o layouts.

## Roles candidatos

| Rol | Responsabilidad | Nivel de acceso esperado |
| --- | --- | --- |
| `Admin` | Configuracion global y operacion completa | Todas las acciones del MVP |
| `Maintenance Manager` | Coordinar activos, planes, historial y alertas | Gestion operativa, sin administracion de identidad |
| `Technician` | Ejecutar y documentar trabajos tecnicos | Lectura operativa, registro de logs y transiciones asignadas |
| `Viewer` | Consultar el estado operativo | Solo lectura |

Estos roles son candidatos iniciales, no valores que deban hardcodearse en componentes frontend. La implementacion debe autorizar permisos y usar roles como agrupaciones administrables de permisos.

## Permisos candidatos

Los permisos deben expresarse como acciones de dominio con el formato `resource:action`.

### Dashboard

| Permiso | Descripcion |
| --- | --- |
| `dashboard:read` | Consultar resumen operativo y metricas |

### Machines

| Permiso | Descripcion |
| --- | --- |
| `machines:read` | Consultar y filtrar maquinas |
| `machines:create` | Registrar una maquina |
| `machines:update` | Actualizar datos operativos |
| `machines:retire` | Retirar o desactivar una maquina |

### Maintenance Plans

| Permiso | Descripcion |
| --- | --- |
| `maintenance-plans:read` | Consultar planes y vencimientos |
| `maintenance-plans:create` | Crear un plan preventivo |
| `maintenance-plans:update` | Actualizar frecuencia, ventana y datos del plan |
| `maintenance-plans:activate` | Activar un plan |
| `maintenance-plans:deactivate` | Desactivar un plan |

### Maintenance Logs

| Permiso | Descripcion |
| --- | --- |
| `maintenance-logs:read` | Consultar el historial |
| `maintenance-logs:create` | Registrar un mantenimiento o incidente |

Los logs deben permanecer sin permisos de edicion o eliminacion. Si se necesita corregir un registro, la politica futura debe definir una correccion auditable o un nuevo registro relacionado.

### Notifications

| Permiso | Descripcion |
| --- | --- |
| `notifications:read` | Consultar la bandeja |
| `notifications:acknowledge` | Reconocer una alerta |
| `notifications:resolve` | Resolver una alerta |
| `notifications:dismiss` | Descartar una alerta |
| `notifications:process-preventive` | Ejecutar manualmente el motor preventivo |

## Matriz inicial de roles

| Permiso | Admin | Maintenance Manager | Technician | Viewer |
| --- | ---: | ---: | ---: | ---: |
| `dashboard:read` | Si | Si | Si | Si |
| `machines:read` | Si | Si | Si | Si |
| `machines:create` | Si | Si | No | No |
| `machines:update` | Si | Si | No | No |
| `machines:retire` | Si | Si | No | No |
| `maintenance-plans:read` | Si | Si | Si | Si |
| `maintenance-plans:create` | Si | Si | No | No |
| `maintenance-plans:update` | Si | Si | No | No |
| `maintenance-plans:activate` | Si | Si | No | No |
| `maintenance-plans:deactivate` | Si | Si | No | No |
| `maintenance-logs:read` | Si | Si | Si | Si |
| `maintenance-logs:create` | Si | Si | Si | No |
| `notifications:read` | Si | Si | Si | Si |
| `notifications:acknowledge` | Si | Si | Si | No |
| `notifications:resolve` | Si | Si | Si | No |
| `notifications:dismiss` | Si | Si | No | No |
| `notifications:process-preventive` | Si | Si | No | No |

La matriz requiere una decision adicional sobre asignacion de maquina, planta o ubicacion. Un tecnico no deberia poder operar alertas o registrar logs fuera de su alcance asignado solo por tener el permiso global.

## Puntos de integracion backend

### Contexto de identidad

La API debe construir un contexto de solicitud despues de autenticarla, por ejemplo:

```ts
type RequestIdentity = {
  userId: string;
  roles: string[];
  permissions: string[];
  siteIds?: string[];
};
```

La forma final depende del proveedor de identidad, pero los servicios de dominio no deben depender de claims sin normalizar. Un adaptador de autenticacion debe traducir el token externo a un contexto interno estable.

### Proteccion de endpoints

- Resolver identidad en un modulo de infraestructura de autenticacion.
- Aplicar autenticacion a las rutas protegidas mediante guards globales o por modulo.
- Aplicar permisos por accion en controllers o policies cercanas al dominio.
- Revalidar reglas de negocio en el service; ocultar un boton no es autorizacion.
- Mantener las transiciones de notificaciones como acciones separadas y autorizables.
- Mantener el endpoint `process-preventive` restringido a `notifications:process-preventive`.
- Permitir que jobs internos usen una identidad de servicio auditable, no un usuario simulado.

### Evolucion de datos

Los siguientes campos actuales son temporales y deben migrar cuando exista identidad:

| Ubicacion actual | Evolucion propuesta |
| --- | --- |
| `MaintenanceLog.performedBy` | Agregar `performedByUserId` y conservar un snapshot visible si se necesita historial |
| Creacion de `MaintenanceLog` | Derivar el actor del contexto, no aceptar el responsable como unica fuente del request |
| Transiciones de `Notification` | Agregar actor por transicion o resolverlo con auditoria |
| Cambios de `Machine` | Registrar actor y motivo en auditoria |
| Cambios de `MaintenancePlan` | Registrar actor y motivo en auditoria |

No se debe eliminar el texto historico de `performedBy` sin una migracion y una decision explicita de retencion.

## Puntos de integracion frontend

- Agregar un provider global de sesion cuando exista un proveedor elegido.
- Centralizar el usuario actual y el estado de autenticacion en infraestructura global, no en cada feature.
- Agregar el token o cookie al cliente HTTP global de forma segura.
- Convertir respuestas `401` y `403` en estados globales de sesion y permisos.
- Permitir que las features reciban capacidades derivadas, por ejemplo `canCreateMachine`, sin conocer la implementacion del proveedor.
- Ocultar o deshabilitar acciones solo como mejora de UX; el backend continua siendo la fuente de autorizacion.
- Mantener rutas y componentes descriptivos independientes del rol para evitar duplicar paginas.
- Definir una pantalla global para acceso denegado y una ruta de sesion expirada.

## Auditoria futura

La auditoria debe registrar cambios y transiciones, no solo errores. Una entidad o stream futuro puede usar esta forma minima:

| Campo | Proposito |
| --- | --- |
| `id` | Identificador UUID del evento |
| `actorId` | Usuario o identidad de servicio |
| `action` | Permiso o accion ejecutada |
| `entityType` | `Machine`, `MaintenancePlan`, `MaintenanceLog` o `Notification` |
| `entityId` | Registro afectado |
| `before` | Estado anterior sanitizado, cuando aplique |
| `after` | Estado nuevo sanitizado, cuando aplique |
| `reason` | Motivo operativo, si es requerido |
| `requestId` | Correlacion tecnica |
| `createdAt` | Fecha del evento |
| `ipAddress` y `userAgent` | Contexto de seguridad, sujeto a politica de privacidad |

### Eventos minimos

- `Machine`: create, update, retire.
- `MaintenancePlan`: create, update, activate, deactivate.
- `MaintenanceLog`: create; no update/delete desde la UI.
- `Notification`: acknowledge, resolve, dismiss.
- Motor preventivo: process, incluyendo identidad de usuario o servicio y resumen de resultados.
- Cambios de permisos y roles cuando exista administracion de identidad.

Los valores sensibles deben sanitizarse antes de persistir `before` y `after`. La auditoria no debe guardar tokens, contrasenas ni secretos.

## Decisiones pendientes para Auth/Roles

1. Elegir proveedor de identidad y estrategia: sesiones seguras, OIDC o JWT con rotacion y revocacion.
2. Definir donde viven usuarios, roles y permisos: base local, proveedor externo o modelo hibrido.
3. Confirmar si el alcance sera global o por planta/ubicacion.
4. Definir administracion de roles, invitaciones, baja y recuperacion de acceso.
5. Definir expiracion, renovacion y revocacion de sesiones.
6. Definir politica para cuentas de servicio y jobs programados.
7. Definir retencion, acceso y exportacion de auditoria.
8. Definir tratamiento de datos personales y cumplimiento aplicable.
9. Definir que acciones requieren motivo obligatorio o aprobacion adicional.
10. Definir estrategia de migracion de `performedBy` a identidad real.

## Siguiente bloque de trabajo

La siguiente fase despues de esta preparacion debe implementar, en este orden:

1. Modelo y proveedor de identidad.
2. Contexto interno de usuario y sesiones.
3. Roles y permisos persistidos.
4. Guards y policies en la API.
5. Auditoria de acciones criticas.
6. Provider de sesion y manejo global de `401`/`403` en frontend.
7. Aplicacion progresiva de capacidades en las features existentes.
8. Pruebas de matriz de permisos y pruebas de regresion del MVP.
