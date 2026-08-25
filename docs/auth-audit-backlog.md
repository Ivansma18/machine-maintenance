# Backlog de auditoria Auth/Roles

La auditoria de negocio queda preparada para la Fase 21. No se persisten eventos en esta fase.

## Eventos prioritarios

| Prioridad | Evento                               | Entidad           | Permiso relacionado                                                           |
| --------- | ------------------------------------ | ----------------- | ----------------------------------------------------------------------------- |
| P0        | Crear, actualizar y retirar maquina  | `Machine`         | `machines:create`, `machines:update`, `machines:retire`                       |
| P0        | Crear y editar plan                  | `MaintenancePlan` | `maintenance-plans:create`, `maintenance-plans:update`                        |
| P0        | Activar y desactivar plan            | `MaintenancePlan` | `maintenance-plans:activate`, `maintenance-plans:deactivate`                  |
| P0        | Registrar mantenimiento              | `MaintenanceLog`  | `maintenance-logs:create`                                                     |
| P0        | Cambiar estado de notificacion       | `Notification`    | `notifications:acknowledge`, `notifications:resolve`, `notifications:dismiss` |
| P1        | Ejecutar procesamiento preventivo    | `Notification`    | `notifications:process-preventive`                                            |
| P1        | Login, logout y revocacion de sesion | `Session`         | Operacion de identidad                                                        |

## Contrato minimo del evento

Cada evento debe incluir:

- `actorType`: `USER` o `SERVICE`.
- `actorId`: usuario o identidad de servicio, sin tokens.
- `action` estable y versionable.
- `entityType` y `entityId`.
- `before` y `after` sanitizados cuando aplique.
- `reason` cuando la accion requiera motivo.
- `requestId` y `createdAt`.

## Reglas de implementacion

- Crear `AuditEvent` en una migracion separada.
- Registrar el evento en la misma transaccion que la mutacion de negocio cuando sea posible.
- No guardar passwords, hashes de password, tokens, cookies ni secretos.
- Mantener los `MaintenanceLog` inmutables; una correccion debe ser un nuevo registro relacionado.
- Representar el job preventivo como identidad de servicio explicita, no como el usuario admin.
- Definir retencion y acceso de consulta para `Admin` antes de exponer una UI.

## Pruebas requeridas

- Un evento por mutacion exitosa.
- Ningun evento cuando la validacion o autorizacion falla antes de mutar.
- Estados anterior y posterior sin datos sensibles.
- Actor correcto para usuario humano y job preventivo.
- `requestId` conservado en errores y reintentos.
