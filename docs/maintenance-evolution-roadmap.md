# Roadmap de Evolucion del Sistema de Mantenimiento

Este documento define la evolucion posterior al primer alcance funcional del sistema. El objetivo es pasar de un CMMS/GMAO operativo por modulos a un sistema centrado en el expediente tecnico de cada maquina, las ordenes de trabajo, las refacciones y el analisis operativo.

La especificacion detallada de la Fase 22 esta en `docs/machine-profile-design.md`.
La especificacion detallada de la Fase 26 esta en `docs/work-order-design.md`.
La especificacion detallada de la Fase 30 esta en `docs/parts-design.md`.

## Alcance Ya Completado

Las Fases 1 a 21 cubren:

- Gestion de maquinas.
- Planes de mantenimiento preventivo.
- Historial de mantenimientos.
- Notificaciones preventivas y urgentes.
- Dashboard operativo.
- Autenticacion, sesiones y logout.
- Roles y permisos efectivos.
- Hardening de Auth/Roles.
- Auditoria base de acciones criticas.

La siguiente etapa no reemplaza estas capacidades. Las concentra alrededor de la maquina como activo principal.

## Principios De Evolucion

- La maquina es el equivalente al vehiculo dentro de un taller automotriz.
- El expediente tecnico es la vista central de la informacion operativa.
- Un `MaintenanceLog` representa trabajo realizado.
- Una `WorkOrder` representa trabajo pendiente, programado o en ejecucion.
- El backend continua siendo la autoridad de negocio, permisos y auditoria.
- Cada nueva mutacion debe conservar trazabilidad mediante `AuditEvent`.
- Las nuevas capacidades deben reutilizar los modelos existentes antes de crear duplicados.
- La expansion a ERP/CRM se mantiene fuera de alcance hasta consolidar mantenimiento.

## Bloque 2: Expediente Tecnico De Maquina

### Fase 22: Diseno Del Expediente Tecnico

**Objetivo:** definir la estructura funcional y visual de la ficha central de una maquina.

**Entregables:**

- Definir la ruta `/machines/:id`.
- Definir resumen tecnico y estado actual.
- Definir metricas: ultimo mantenimiento, proximo mantenimiento, vencidos, alertas y fallas recientes.
- Definir timeline cronologico.
- Definir acciones rapidas segun permisos.

**Resultado:** especificacion de la pantalla `Expediente de Maquina`.

### Fase 23: Backend De Resumen Por Maquina

**Objetivo:** concentrar la informacion relevante en un endpoint de expediente.

**Endpoint sugerido:**

```text
GET /api/machines/:id/profile
```

**Debe incluir:**

- Datos generales de la maquina.
- Planes activos.
- Ultimos mantenimientos.
- Alertas abiertas.
- Proximo mantenimiento.
- Preventivos vencidos.
- Conteo de fallas por periodo.
- Metricas de salud operativa.

**Permiso:** `machines:read`.

### Fase 24: Frontend Del Expediente De Maquina

**Objetivo:** implementar la pantalla central del expediente.

**Secciones:**

- Encabezado con estado, criticidad y ubicacion.
- Resumen operativo.
- Proximo mantenimiento.
- Mantenimientos vencidos.
- Alertas abiertas.
- Planes activos.
- Timeline tecnico.
- Acciones para registrar mantenimiento, editar o retirar maquina.

### Fase 25: Timeline Tecnico Unificado

**Objetivo:** presentar la historia completa de la maquina en orden cronologico.

**Eventos:**

- Creacion, edicion y retiro de maquina.
- Creacion y transiciones de planes.
- Mantenimientos registrados.
- Fallas criticas.
- Notificaciones y sus transiciones.
- Eventos de auditoria relevantes.

**Endpoint sugerido:**

```text
GET /api/machines/:id/timeline
```

## Bloque 3: Ordenes De Trabajo

### Fase 26: Diseno De Ordenes De Trabajo

**Objetivo:** separar el trabajo pendiente del historial ya realizado.

**Especificacion detallada:** `docs/work-order-design.md`.

Una orden de trabajo representa una actividad que debe ejecutarse, asignarse, programarse y cerrarse.

**Estados sugeridos:**

```text
OPEN
SCHEDULED
IN_PROGRESS
COMPLETED
CANCELLED
```

### Fase 27: Backend De Work Orders

**Objetivo:** agregar persistencia y API para ordenes de trabajo.

**Modelo sugerido:**

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
- createdAt
- updatedAt
```

**Endpoints sugeridos:**

```text
GET /api/work-orders
POST /api/work-orders
GET /api/work-orders/:id
PATCH /api/work-orders/:id
PATCH /api/work-orders/:id/start
PATCH /api/work-orders/:id/complete
PATCH /api/work-orders/:id/cancel
```

### Fase 28: UI De Ordenes De Trabajo

**Objetivo:** administrar el trabajo tecnico diario.

**Pantallas:**

- Lista de ordenes.
- Detalle de orden.
- Crear orden.
- Asignar tecnico.
- Cambiar estado.
- Completar o cancelar orden.

El expediente de maquina debe mostrar ordenes abiertas, vencidas y completadas recientemente.

**Estado:** implementada en `apps/web/features/work-orders`, con lista paginada, filtros, detalle,
creacion, acciones operativas y resumen por maquina.

### Fase 29: Completar Orden Y Generar Log

**Objetivo:** conectar la planificacion con el historial real.

**Flujo:**

```text
WorkOrder abierta
-> tecnico ejecuta el trabajo
-> registra resultado, notas y evidencias
-> se crea MaintenanceLog
-> se cierra WorkOrder
-> se generan eventos de auditoria
```

**Estado:** implementada con cierre transaccional, captura de resultado/notas y generación del
`MaintenanceLog` desde la orden completada.

## Bloque 4: Refacciones Y Piezas

### Fase 30: Diseno De Refacciones

**Objetivo:** definir catalogo, inventario y consumo de piezas.

**Conceptos:**

- Refaccion.
- Existencia de inventario.
- Consumo de refaccion.
- Pieza reemplazada durante mantenimiento.

**Modelos sugeridos:** `Part`, `InventoryItem` y `MaintenanceLogPart`.

**Estado:** especificada en `docs/parts-design.md`, sin adelantar persistencia, API ni UI.

### Fase 31: Backend De Refacciones

**Objetivo:** gestionar catalogo y consumo de piezas.

**Endpoints sugeridos:**

```text
GET /api/parts
POST /api/parts
PATCH /api/parts/:id
POST /api/maintenance-logs/:id/parts
```

**Estado:** implementada en `apps/api/src/parts`, con catalogo, inventario, ajustes auditados y
consumo transaccional desde `MaintenanceLog`.

### Fase 32: UI De Refacciones En Expediente

**Objetivo:** mostrar el historial de piezas por maquina.

**Informacion sugerida:**

- Ultimas piezas cambiadas.
- Frecuencia de reemplazo.
- Piezas criticas.
- Costo acumulado, si se incorpora costo.
- Alertas por consumo repetido.

## Bloque 5: Programacion Y Calendario

### Fase 33: Agenda De Mantenimiento

**Objetivo:** visualizar trabajos proximos y vencidos en un calendario.

**Vistas:**

- Calendario semanal y mensual.
- Preventivos proximos.
- Ordenes agendadas.
- Trabajos vencidos.
- Carga por tecnico.

### Fase 34: Programacion Desde Expediente

**Objetivo:** crear la siguiente intervencion directamente desde una maquina.

Ejemplos:

```text
Programar cambio de aceite en 4 meses.
Programar revision electrica en 2 semanas.
Programar cambio de banda el proximo viernes.
```

## Bloque 6: Deteccion De Patrones

### Fase 35: Metricas De Reincidencia

**Objetivo:** detectar comportamientos repetitivos.

**Indicadores:**

- Muchas fallas en poco tiempo.
- Misma categoria de falla repetida.
- Preventivos omitidos varias veces.
- Misma pieza reemplazada con demasiada frecuencia.
- Alto costo de mantenimiento por maquina.

### Fase 36: Reglas De Recomendacion

**Objetivo:** generar recomendaciones operativas explicables mediante reglas.

**Ejemplos:**

```text
Esta maquina tiene 3 fallas electricas en 6 meses. Revisar tablero electrico.
Tiene 2 preventivos vencidos. Programar mantenimiento urgente.
La misma pieza fue reemplazada 4 veces este ano. Revisar causa raiz.
```

La primera version debe ser deterministica y basada en datos existentes, no depender de inteligencia artificial.

## Bloque 7: Administracion Avanzada

### Fase 37: Consulta De Auditoria

**Objetivo:** permitir que `Admin` consulte los eventos auditados.

**Ruta sugerida:** `/audit`.

**Filtros:**

- Actor.
- Accion.
- Maquina o entidad.
- Fecha.
- `requestId`.

### Fase 38: Administracion De Usuarios Y Roles

**Objetivo:** eliminar la dependencia exclusiva del seed para gestionar identidad.

**Funciones:**

- Crear usuario.
- Activar y desactivar usuario.
- Asignar roles.
- Consultar permisos efectivos.
- Ejecutar reset manual de password temporal.

Todas las acciones deben auditarse y mantenerse protegidas para `Admin`.

## Bloque 8: Multi-Planta Y Escalabilidad

### Fase 39: Plantas, Areas Y Lineas

**Objetivo:** modelar ubicaciones operativas reales.

**Modelos sugeridos:**

```text
Site
Area
ProductionLine
```

**Relacion:**

```text
Site -> Area -> ProductionLine -> Machine
```

### Fase 40: Permisos Por Alcance

**Objetivo:** evolucionar de permisos globales a permisos limitados por planta o area.

Ejemplos:

```text
Usuario A administra Planta Norte.
Usuario B solo consulta Planta Sur.
```

Esta fase debe conservar la posibilidad de permisos globales para administradores y cuentas de servicio.

## Orden Recomendado

La secuencia recomendada es:

```text
22. Diseno del expediente tecnico
23. Backend del resumen por maquina
24. Frontend del expediente
25. Timeline tecnico
26. Diseno de ordenes de trabajo
27. Backend de ordenes
28. UI de ordenes
29. Completar orden y generar log
30. Diseno de refacciones
31. Backend de refacciones
32. UI de refacciones
33. Agenda y calendario
34. Programacion desde expediente
35. Metricas de reincidencia
36. Reglas de recomendacion
37. Consulta de auditoria
38. Administracion de usuarios y roles
39. Plantas, areas y lineas
40. Permisos por alcance
```

## Siguiente Paso

El siguiente incremento recomendado es la Fase 32: mostrar el historial de piezas y alertas de
inventario dentro del expediente tecnico de maquina.
