# Preparacion para Auth y Roles

Este documento fija el primer alcance de Auth/Roles y sus puntos de evolucion. No implementa login, sesiones, JWT, guards, roles ni permisos ejecutables.

## Decisiones aprobadas

- Autenticacion local con `email` o `username` mas password.
- El `username` es unico y obligatorio; el admin inicial usa `admin`.
- El admin inicial se crea mediante seed y variables de entorno.
- Las sesiones se persisten en PostgreSQL y se representan en el navegador con una cookie segura.
- Se permiten multiples sesiones simultaneas por usuario.
- La sesion expira por inactividad: siete dias desde `lastSeenAt`.
- Los permisos son globales en el primer alcance, sin scopes por planta o ubicacion.
- Un usuario puede tener multiples roles.
- La auditoria se implementara despues de Auth/Roles.

El diseño debe permitir agregar despues OIDC, scopes por planta, cuentas de servicio y auditoria sin acoplar esas decisiones a las features.

El contrato tecnico detallado de esta preparacion esta en `docs/auth-roles-technical-design.md`. Ese documento es la referencia de implementacion para la Fase 16 y las fases posteriores.

## Roles candidatos

| Rol                   | Responsabilidad                                | Acceso esperado                                     |
| --------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `Admin`               | Configuracion global y operacion completa      | Todas las acciones del MVP                          |
| `Maintenance Manager` | Coordinar activos, planes, historial y alertas | Gestion operativa, sin administrar identidad        |
| `Technician`          | Ejecutar y documentar trabajos tecnicos        | Lectura, registro de logs y transiciones operativas |
| `Viewer`              | Consultar el estado operativo                  | Solo lectura                                        |

Los roles son agrupaciones de permisos. No deben hardcodearse en componentes frontend.

## Permisos globales

Los permisos usan el formato `resource:action`.

| Recurso           | Permisos                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard         | `dashboard:read`                                                                                                                               |
| Machines          | `machines:read`, `machines:create`, `machines:update`, `machines:retire`                                                                       |
| Maintenance Plans | `maintenance-plans:read`, `maintenance-plans:create`, `maintenance-plans:update`, `maintenance-plans:activate`, `maintenance-plans:deactivate` |
| Maintenance Logs  | `maintenance-logs:read`, `maintenance-logs:create`                                                                                             |
| Notifications     | `notifications:read`, `notifications:acknowledge`, `notifications:resolve`, `notifications:dismiss`, `notifications:process-preventive`        |

Los logs no tendran permisos de edicion o eliminacion desde la UI. Una correccion futura debe ser un nuevo registro relacionado o una operacion auditable.

## Matriz inicial

| Permiso                            | Admin | Maintenance Manager | Technician | Viewer |
| ---------------------------------- | ----: | ------------------: | ---------: | -----: |
| `dashboard:read`                   |    Si |                  Si |         Si |     Si |
| `machines:read`                    |    Si |                  Si |         Si |     Si |
| `machines:create`                  |    Si |                  Si |         No |     No |
| `machines:update`                  |    Si |                  Si |         No |     No |
| `machines:retire`                  |    Si |                  Si |         No |     No |
| `maintenance-plans:read`           |    Si |                  Si |         Si |     Si |
| `maintenance-plans:create`         |    Si |                  Si |         No |     No |
| `maintenance-plans:update`         |    Si |                  Si |         No |     No |
| `maintenance-plans:activate`       |    Si |                  Si |         No |     No |
| `maintenance-plans:deactivate`     |    Si |                  Si |         No |     No |
| `maintenance-logs:read`            |    Si |                  Si |         Si |     Si |
| `maintenance-logs:create`          |    Si |                  Si |         Si |     No |
| `notifications:read`               |    Si |                  Si |         Si |     Si |
| `notifications:acknowledge`        |    Si |                  Si |         Si |     No |
| `notifications:resolve`            |    Si |                  Si |         Si |     No |
| `notifications:dismiss`            |    Si |                  Si |         No |     No |
| `notifications:process-preventive` |    Si |                  Si |         No |     No |

## Modelo de sesion aprobado

Modelos previstos:

- `User`: `username`, `email`, `name`, `passwordHash`, `isActive`.
- `Role`: nombre y descripcion.
- `Permission`: clave y descripcion.
- `UserRole`: relacion muchos-a-muchos entre usuarios y roles.
- `RolePermission`: relacion muchos-a-muchos entre roles y permisos.
- `Session`: usuario, hash del token, `lastSeenAt`, `expiresAt`, `revokedAt` y timestamps.

Flujo de expiracion:

1. Login crea una sesion independiente.
2. La cookie contiene un token opaco; nunca contiene password, roles o permisos.
3. La base de datos guarda solo el hash del token.
4. Cada request autenticado valida `revokedAt` y `expiresAt`.
5. Si la sesion sigue activa, actualiza `lastSeenAt` y calcula `expiresAt = now + 7 dias`.
6. Una sesion sin actividad durante siete dias deja de ser valida.
7. Logout revoca solo la sesion actual; las demas sesiones permanecen activas.

Cookie prevista:

- `HttpOnly`.
- `SameSite=Lax`.
- `Secure` en produccion.
- `Path=/`.
- Nombre y dominio configurables por entorno.

## Seed inicial

El seed debe ser repetible y crear permisos, roles y el admin inicial sin versionar secretos:

```text
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.local
ADMIN_NAME=Local Administrator
ADMIN_PASSWORD=<solo-entorno-local>
```

El seed debe fallar de forma explicita si faltan variables obligatorias para crear el admin. Nunca debe generar una password conocida por defecto.

## Integracion backend

- Crear un modulo `auth` responsable de login, logout, `me`, hashing y sesiones.
- Normalizar la identidad autenticada en un contexto interno:

```ts
type RequestIdentity = {
  userId: string;
  roles: string[];
  permissions: string[];
};
```

- Agregar guard de sesion y guard/decorator de permisos en fases separadas.
- Proteger cada endpoint segun `resource:action`.
- Revalidar permisos en backend; ocultar botones nunca sustituye autorizacion.
- Permitir una identidad de servicio auditable para el job preventivo.

Endpoints iniciales:

- `POST /api/auth/login`: recibe `identifier` y `password`; `identifier` acepta email o username.
- `POST /api/auth/logout`: revoca la sesion actual.
- `GET /api/auth/me`: devuelve usuario, roles y permisos efectivos.

## Integracion frontend

- Crear provider global de sesion.
- Usar un cliente HTTP global con `credentials: 'include'`.
- Centralizar estados `401`, `403`, sesion expirada y acceso denegado.
- Entregar capacidades derivadas a las features, como `canCreateMachine`.
- Usar permisos efectivos, no nombres de roles, para mostrar u ocultar acciones.
- Mantener la autorizacion real en el backend.

## Evolucion de datos

- Migrar `MaintenanceLog.performedBy` hacia `performedByUserId`, conservando snapshot si el historial lo requiere.
- Derivar el responsable del contexto autenticado y no confiar exclusivamente en texto enviado por el cliente.
- Reservar actor por transicion de notificaciones para la fase de auditoria.
- Mantener globales los permisos ahora, pero no bloquear una futura columna de scope.

## Auditoria posterior

La auditoria queda fuera del primer alcance Auth/Roles. Cuando se implemente, debera registrar como minimo:

- Actor real o identidad de servicio.
- Accion ejecutada.
- Tipo e identificador de entidad.
- Estado anterior y posterior sanitizados.
- Motivo cuando corresponda.
- `requestId` y fecha.

Eventos iniciales: cambios de maquinas, cambios y transiciones de planes, creacion de logs, transiciones de notificaciones y ejecucion del motor preventivo. Nunca guardar passwords, tokens ni secretos.
