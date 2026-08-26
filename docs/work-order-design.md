# Diseno De Ordenes De Trabajo

Este documento define la Fase 26 del roadmap de evolucion. Es la especificacion funcional y tecnica para representar trabajo pendiente, programado, en ejecucion o cancelado sin confundirlo con el historial de mantenimientos realizados.

La Fase 27 implementara persistencia y API. La Fase 28 implementara las pantallas y acciones operativas. Este documento no agrega codigo ni cambia el modelo de datos actual.

## 1. Proposito

Una orden de trabajo (`WorkOrder`) representa una intervencion que debe gestionarse hasta su cierre. Debe responder rapidamente estas preguntas:

- Que trabajo debe hacerse?
- Sobre que maquina?
- Con que prioridad?
- Cuando debe programarse o completarse?
- Quien es responsable?
- En que estado se encuentra?
- Como se convierte en historial cuando termina?

Un `MaintenanceLog` representa trabajo ya realizado e inmutable. Una `WorkOrder` representa trabajo gestionable antes de convertirse en historial.

## 2. Usuarios Y Capacidades

| Usuario               | Necesidad principal                | Capacidades esperadas                                            |
| --------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `Admin`               | Controlar la operacion completa    | Crear, editar, asignar, iniciar, completar y cancelar            |
| `Maintenance Manager` | Coordinar pendientes y prioridades | Crear, editar, asignar, programar, iniciar, completar y cancelar |
| `Technician`          | Ejecutar trabajo asignado          | Consultar, iniciar y completar sus ordenes                       |
| `Viewer`              | Consultar carga operativa          | Consultar sin mutar                                              |

El backend sigue siendo la autoridad para permisos, transiciones y auditoria. El frontend solo oculta o deshabilita acciones que no corresponden al usuario.

## 3. Modelo Conceptual

```text
WorkOrder
- id
- machineId
- maintenancePlanId?
- title
- description
- type
- priority
- status
- scheduledAt?
- dueAt?
- assignedToUserId?
- completedAt?
- cancelledAt?
- cancellationReason?
- createdByUserId
- createdAt
- updatedAt
```

Relaciones:

- `machineId` es obligatorio y referencia `Machine`.
- `maintenancePlanId` es opcional y, si existe, debe pertenecer a la misma maquina.
- `assignedToUserId` es opcional hasta que la orden sea asignada.
- `createdByUserId` identifica al usuario que origino la orden.
- Una orden completada puede originar un `MaintenanceLog` en la Fase 29.

No se debe duplicar en `WorkOrder` informacion que ya pertenece a `Machine`, `MaintenancePlan` o `User`.

## 4. Tipos Y Prioridades

### Tipos

Los tipos iniciales reutilizan el vocabulario existente de mantenimiento:

```text
PREVENTIVE
CORRECTIVE
INSPECTION
```

### Prioridades

```text
LOW
MEDIUM
HIGH
URGENT
```

La prioridad expresa urgencia operativa, no criticidad permanente de la maquina. Una maquina `CRITICAL` puede tener una orden `LOW`, y una orden `URGENT` puede existir sobre una maquina de criticidad `MEDIUM`.

## 5. Ciclo De Vida

Estados validos:

```text
OPEN
SCHEDULED
IN_PROGRESS
COMPLETED
CANCELLED
```

Transiciones permitidas:

| Estado actual | Accion    | Estado siguiente | Regla                                           |
| ------------- | --------- | ---------------- | ----------------------------------------------- |
| `OPEN`        | Programar | `SCHEDULED`      | Requiere `scheduledAt` o `dueAt`                |
| `OPEN`        | Iniciar   | `IN_PROGRESS`    | Puede iniciar sin fecha programada              |
| `SCHEDULED`   | Iniciar   | `IN_PROGRESS`    | La orden debe estar activa                      |
| `IN_PROGRESS` | Completar | `COMPLETED`      | Requiere resultado y datos de cierre en Fase 29 |
| `OPEN`        | Cancelar  | `CANCELLED`      | Requiere motivo                                 |
| `SCHEDULED`   | Cancelar  | `CANCELLED`      | Requiere motivo                                 |
| `IN_PROGRESS` | Cancelar  | `CANCELLED`      | Requiere motivo y auditoria                     |

No se permiten estas transiciones:

- `COMPLETED` a cualquier otro estado.
- `CANCELLED` a cualquier otro estado.
- `SCHEDULED` a `OPEN` en la primera version.
- `OPEN` directamente a `COMPLETED`.
- Cualquier transicion implicita producida por una edicion general.

La Fase 27 puede exponer solo las transiciones necesarias para el primer flujo. Si se agrega `reopen` en una fase posterior, debe definirse como una capacidad separada, con permiso y auditoria propios.

## 6. Reglas De Negocio

- `title` es obligatorio y debe describir una accion concreta.
- `machineId` debe referenciar una maquina existente.
- Una orden no puede asociar un plan de otra maquina.
- `dueAt` no puede ser anterior a `createdAt` al crear la orden.
- `scheduledAt` no puede ser posterior a `dueAt` cuando ambas fechas existen.
- `assignedToUserId` solo puede referenciar un usuario activo.
- El tecnico asignado puede iniciar y completar su orden; no puede reasignarla sin el permiso correspondiente.
- `completedAt` solo existe en `COMPLETED`.
- `cancelledAt` y `cancellationReason` solo existen en `CANCELLED`.
- Completar una orden no debe crear un `MaintenanceLog` hasta la Fase 29.
- Cancelar una orden no elimina registros ni cambia el historial previo.
- La maquina puede estar `RETIRED`, pero no se deben crear nuevas ordenes para ella.
- Las ediciones generales no deben modificar el estado; las transiciones usan acciones especificas.
- Todas las mutaciones deben ejecutarse en el backend y registrar `AuditEvent`.

## 7. Permisos Iniciales

Permisos sugeridos:

```text
work-orders:read
work-orders:create
work-orders:update
work-orders:assign
work-orders:start
work-orders:complete
work-orders:cancel
```

Reglas:

- `work-orders:read` permite consultar listas, detalle y ordenes del expediente.
- `work-orders:create` permite crear una orden.
- `work-orders:update` permite modificar datos editables antes del cierre.
- `work-orders:assign` permite asignar o cambiar responsable.
- `work-orders:start` permite pasar a `IN_PROGRESS`.
- `work-orders:complete` permite cerrar como `COMPLETED`.
- `work-orders:cancel` permite cerrar como `CANCELLED`.

La autorizacion por usuario asignado es una regla adicional, no reemplaza los permisos globales.

## 8. API Para Fase 27

Endpoints iniciales:

```text
GET   /api/work-orders
POST  /api/work-orders
GET   /api/work-orders/:id
PATCH /api/work-orders/:id
PATCH /api/work-orders/:id/start
PATCH /api/work-orders/:id/complete
PATCH /api/work-orders/:id/cancel
```

Filtros minimos para `GET /api/work-orders`:

- `machineId`
- `maintenancePlanId`
- `assignedToUserId`
- `type`
- `priority`
- `status`
- `dueFrom`
- `dueTo`
- `page`
- `limit`

Respuesta conceptual de lista:

```ts
type WorkOrdersResponse = {
  data: WorkOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
```

Las acciones de transicion deben validar el estado actual y devolver un error de conflicto cuando la orden ya cambio de estado.

## 9. Auditoria

Acciones minimas auditables:

```text
work-order.created
work-order.updated
work-order.assigned
work-order.scheduled
work-order.started
work-order.completed
work-order.cancelled
```

Cada evento debe conservar:

- Actor y tipo de actor.
- `entityType = WorkOrder`.
- `entityId` de la orden.
- Snapshot `before` y `after` cuando aplique.
- Motivo de cancelacion o cierre cuando exista.
- `requestId` de la solicitud.

No guardar passwords, tokens, cookies ni snapshots de sesion.

## 10. Pantallas Para Fase 28

La UI inicial debe incluir:

- Lista paginada de ordenes.
- Filtros por maquina, estado, prioridad, tipo y responsable.
- Detalle de una orden.
- Formulario de creacion.
- Edicion antes de completar o cancelar.
- Asignacion de tecnico.
- Acciones de iniciar, completar y cancelar.

La pantalla debe distinguir claramente:

- Trabajo pendiente: `OPEN`, `SCHEDULED`.
- Trabajo activo: `IN_PROGRESS`.
- Trabajo terminado: `COMPLETED`.
- Trabajo cancelado: `CANCELLED`.

El expediente de maquina incorporara ordenes abiertas, vencidas y completadas recientemente en la Fase 28. No adelantar esas secciones al primer backend si la UI no tiene acciones consistentes.

## 11. Estados De UI

- Cargando: skeleton de lista y detalle, sin valores inventados.
- Sin ordenes: explicar como crear la primera orden.
- Sin resultados: conservar filtros visibles y ofrecer limpiarlos.
- Error: mostrar recuperacion y no perder los filtros.
- Conflicto de transicion: informar que otro usuario modifico la orden y ofrecer recargar.
- Solo lectura: mostrar el expediente y estado, ocultando acciones no permitidas.
- Orden completada: mostrarla como historial operativo pendiente de integracion con log en Fase 29.

## 12. No Alcanzado En Fase 26

- Persistencia o migraciones Prisma.
- API funcional.
- Pantallas frontend.
- Generacion automatica desde planes preventivos.
- Creacion automatica de `MaintenanceLog`.
- Refacciones, costos o inventario.
- Calendario avanzado.
- Asignacion por planta, area o turno.
- SLA, pausas o reprogramaciones complejas.
- Recomendaciones predictivas.

## 13. Criterios De Aceptacion

- Se distingue formalmente trabajo pendiente de trabajo realizado.
- El modelo conceptual define relaciones, fechas y responsables.
- Los estados y transiciones invalidas estan documentados.
- Las prioridades y tipos tienen significado operativo separado de la criticidad de la maquina.
- Cada accion tiene permiso asociado.
- Las mutaciones requieren auditoria.
- Se definen reglas para maquinas retiradas, planes relacionados y usuarios inactivos.
- Se define el contrato inicial de API para Fase 27.
- Se definen los estados y pantallas minimas para Fase 28.
- No se introducen inventario, costos, calendario ni generacion de logs antes de sus fases correspondientes.
