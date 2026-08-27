# Diseno tecnico de Auth/Roles

Este documento implementa documentalmente la Fase 15 del `DEVELOPMENT_PLAN.md`. Define el contrato tecnico para la autenticacion local y la autorizacion global del MVP. No agrega codigo, migraciones ni dependencias ejecutables.

## 1. Alcance de la Fase 15

La primera entrega de Auth/Roles debe permitir que una persona:

- Inicie sesion con email o username y password.
- Mantenga multiples sesiones simultaneas.
- Sea identificada por la API mediante una sesion persistida.
- Reciba permisos efectivos derivados de uno o varios roles.
- Cierre solamente la sesion actual.
- Pierda acceso despues de siete dias sin actividad.

Quedan fuera de esta entrega:

- OIDC, SSO y proveedores externos.
- Recuperacion de password, MFA e invitaciones.
- Scopes por planta, ubicacion o maquina.
- Administracion de usuarios desde la UI.
- Auditoria de acciones de negocio.

Estas exclusiones no deben impedir agregar esos mecanismos despues.

## 2. Decisiones de arquitectura

### Identidad

- La base local es la fuente de verdad para usuarios, credenciales, roles, permisos y sesiones.
- `username` y `email` son unicos; ambos son obligatorios en el modelo inicial.
- El login recibe un unico campo `identifier`, que se busca como email o username.
- La comparacion de credenciales no debe revelar si el identificador existe.
- Un usuario con `isActive = false` no puede iniciar sesion ni usar sesiones existentes.

### Sesiones

- La sesion es server-side y se persiste en PostgreSQL.
- El navegador recibe una cookie con un token opaco aleatorio.
- La API no usa JWT en esta fase.
- La base de datos guarda `tokenHash`, nunca el token plano.
- Cada login crea una sesion nueva, aunque el usuario ya tenga otras activas.
- Logout revoca solo la sesion cuyo token fue presentado.
- Las sesiones revocadas se conservan para permitir limpieza y diagnostico posterior.

### Expiracion hibrida por inactividad

La politica aprobada es sliding expiration con limite de inactividad:

```text
SESSION_IDLE_TIMEOUT = 7 days
expiresAt = lastSeenAt + SESSION_IDLE_TIMEOUT
```

En cada request autenticado:

1. Se extrae la cookie.
2. Se calcula el hash del token recibido.
3. Se busca una sesion no revocada.
4. Se rechaza si `expiresAt <= now` o el usuario esta inactivo.
5. Se actualiza `lastSeenAt` y se recalcula `expiresAt`.

No existe una fecha maxima absoluta en el primer alcance. La sesion puede mantenerse activa indefinidamente mientras el usuario genere actividad valida al menos una vez cada siete dias.

La actualizacion de actividad debe ser tolerante a concurrencia: dos requests simultaneos no deben revocar ni extender incorrectamente una sesion valida. La Fase 17 definira si se actualiza siempre o con una ventana minima para reducir escrituras, sin cambiar la politica observable.

### Cookie

Configuracion prevista:

| Atributo | Valor                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| HttpOnly | `true`                                                                           |
| SameSite | `Lax`                                                                            |
| Secure   | `true` en produccion, configurable en local                                      |
| Path     | `/`                                                                              |
| Max-Age  | No sustituye la expiracion server-side; puede reflejar el timeout de inactividad |
| Nombre   | Configurable por entorno                                                         |

La cookie no debe incluir roles, permisos, email, username ni ningun secreto adicional.

## 3. Modelo logico

La Fase 16 debe materializar estas entidades en Prisma:

### User

- `id`: UUID.
- `username`: unico, normalizado para busqueda.
- `email`: unico, normalizado para busqueda.
- `name`: nombre visible.
- `passwordHash`: hash generado por un algoritmo adaptativo aprobado por el backend.
- `isActive`: permite baja logica.
- `createdAt`, `updatedAt`.

### Role

- `id`: UUID.
- `name`: unico y administrable.
- `description`.
- `createdAt`, `updatedAt`.

### Permission

- `id`: UUID.
- `key`: unica, formato `resource:action`.
- `description`.
- `createdAt`, `updatedAt`.

### UserRole

- `userId`.
- `roleId`.
- Clave primaria compuesta y relaciones con borrado controlado.

### RolePermission

- `roleId`.
- `permissionId`.
- Clave primaria compuesta.

### Session

- `id`: UUID.
- `userId`.
- `tokenHash`: unico.
- `lastSeenAt`.
- `expiresAt`.
- `revokedAt`: nullable.
- `createdAt`.

Indices minimos:

- `User.username` unico.
- `User.email` unico.
- `Session.tokenHash` unico.
- `Session.userId`.
- `Session.expiresAt`.
- Relaciones compuestas de `UserRole` y `RolePermission`.

## 4. Seed y configuracion

El seed crea en este orden:

1. Permisos globales del documento `docs/auth-roles-readiness.md`.
2. Roles `Admin`, `Maintenance Manager`, `Technician` y `Viewer`.
3. Relaciones iniciales role-permission de la matriz aprobada.
4. Usuario admin inicial.
5. Relacion del usuario admin con `Admin`.

Variables requeridas:

```text
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.local
ADMIN_NAME=Local Administrator
ADMIN_PASSWORD=<secret>
```

Reglas del seed:

- Debe ser idempotente.
- Debe actualizar de forma segura los datos administrables del seed sin resetear passwords existentes de forma inesperada.
- Debe fallar si falta una variable obligatoria.
- No debe contener una password de fallback.
- No debe imprimir passwords, hashes ni tokens.

## 5. Contrato HTTP

Los contratos son internos del MVP y deben ubicarse en el modulo `auth` del API.

### `POST /api/auth/login`

Request:

```json
{
  "identifier": "admin",
  "password": "secret"
}
```

Reglas:

- `identifier` acepta email o username.
- Se aplican trim y normalizacion de email/username, pero no se modifica la password.
- Usuario inexistente, password incorrecta o usuario inactivo devuelven el mismo error publico.
- Una autenticacion exitosa crea una sesion y establece la cookie.
- No se devuelven tokens en JSON.

Respuesta exitosa conceptual:

```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@example.local",
    "name": "Local Administrator"
  },
  "roles": ["Admin"],
  "permissions": ["dashboard:read"]
}
```

### `POST /api/auth/logout`

- Requiere una sesion valida para revocar la sesion actual.
- Debe limpiar la cookie aunque la sesion ya haya expirado.
- No revoca otras sesiones del mismo usuario.
- La respuesta publica debe ser segura para repetir la operacion.

### `GET /api/auth/me`

- Requiere una sesion valida.
- Devuelve usuario, roles y permisos efectivos.
- No devuelve `passwordHash`, `tokenHash` ni datos internos de sesiones.

## 6. Errores y estados HTTP

| Situacion                  | Estado | Comportamiento publico           |
| -------------------------- | -----: | -------------------------------- |
| Credenciales invalidas     |  `401` | Mensaje generico                 |
| Cookie ausente             |  `401` | Sesion no autenticada            |
| Sesion expirada o revocada |  `401` | Sesion no autenticada            |
| Usuario inactivo           |  `401` | No revelar si existe             |
| Sesion valida sin permiso  |  `403` | Acceso denegado                  |
| Payload invalido           |  `400` | Error de validacion sin secretos |

La API no debe diferenciar publicamente entre email inexistente, username inexistente y password incorrecta. Los logs tecnicos tampoco deben incluir passwords ni tokens.

## 7. Contexto interno de request

Despues de validar la sesion, el backend debe entregar a controllers y servicios un contexto normalizado:

```ts
type RequestIdentity = {
  userId: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
};
```

Reglas:

- Los servicios no leen cookies directamente.
- Los servicios no consultan roles por su cuenta para cada regla.
- Los permisos se comparan por clave estable.
- El `sessionId` permite revocacion y futura auditoria sin exponer el token.
- La identidad de jobs internos debe ser explicita y no simular un usuario humano.

## 8. Limites de modulos

La implementacion posterior debe respetar estos limites:

### `apps/api/src/auth`

- Login, logout, `me`.
- Hashing y comparacion de passwords.
- Generacion y hash de tokens de sesion.
- Validacion y renovacion de sesiones.
- Mapeo de usuario a identidad interna.

### `apps/api/src/authorization`

- Decorator de permiso.
- Guard de permisos.
- Resolucion de permisos efectivos desde multiples roles.

### Modulos de dominio

- Declaran el permiso requerido por endpoint.
- Mantienen sus reglas de negocio.
- No conocen detalles de cookies, hashing o sesiones.

### `apps/web/features/auth`

- Formulario de login.
- Tipos y acceso HTTP especifico de Auth.
- Hook de estado de autenticacion.

### Infraestructura global de `apps/web`

- Provider de sesion.
- Cliente HTTP con `credentials: 'include'`.
- Manejo comun de `401` y `403`.

Las features existentes no deben importar directamente infraestructura de autenticacion para decidir permisos; deben recibir capacidades derivadas mediante props o hooks globales definidos por la arquitectura frontend.

## 9. Secuencia de implementacion posterior

### Fase 16

- Materializar schema, indices, migracion y seed.
- Verificar que el seed pueda ejecutarse en una base PostgreSQL local limpia.

### Fase 17

- Implementar hashing, endpoints y cookie.
- Implementar validacion, renovacion y revocacion de sesiones.
- Cubrir login por email y username.

### Fase 18

- Implementar guards.
- Aplicar la matriz de permisos a endpoints existentes.
- Probar combinaciones de multiples roles.

### Fase 19

- Implementar login y provider de sesion.
- Aplicar capacidades a las acciones de las features.

### Fase 20

- Ejecutar hardening, regresion y validacion operativa.

### Fase 21

- Implementar auditoria de acciones criticas.

## 10. Pruebas de contrato requeridas

Antes de cerrar la Fase 15, estas expectativas deben quedar cubiertas por el plan de pruebas de las fases de codigo:

- Login exitoso por username.
- Login exitoso por email.
- Login fallido con mensaje indistinguible.
- Usuario inactivo rechazado.
- Dos sesiones activas para el mismo usuario.
- Logout de una sesion sin afectar otra.
- Sesion renovada con actividad antes de siete dias.
- Sesion rechazada despues de siete dias sin actividad.
- Cookie ausente, expirada y revocada.
- Usuario con varios roles y permisos combinados.
- Usuario autenticado sin permiso recibe `403`.
- Usuario no autenticado recibe `401`.

## 11. Criterio de salida de Fase 15

La Fase 15 queda terminada cuando:

- Este documento y `docs/auth-roles-readiness.md` no contienen decisiones contradictorias.
- El schema logico, los contratos HTTP y los limites de modulos estan definidos.
- La politica de cookie, expiracion, renovacion y revocacion esta definida.
- El seed del admin y sus variables estan definidos.
- Las Fases 16 a 21 tienen una secuencia de implementacion verificable.
- No se requiere reestructurar las features existentes para iniciar la Fase 16.
