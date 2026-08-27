# Diseno Del Expediente Tecnico De Maquina

Este documento define la Fase 22 del roadmap de evolucion. Es la especificacion funcional y de experiencia para convertir a cada maquina en el centro de consulta y operacion del sistema.

La implementacion del endpoint corresponde a la Fase 23 y la implementacion de la pantalla corresponde a la Fase 24. Este documento no agrega codigo ni cambia el modelo de datos actual.

## 1. Proposito

El expediente tecnico debe responder rapidamente estas preguntas:

- Que maquina estoy consultando?
- En que estado operativo se encuentra?
- Cuando fue su ultimo mantenimiento?
- Cuando le corresponde el siguiente?
- Tiene mantenimientos vencidos?
- Que fallas o alertas tiene abiertas?
- Que acciones puedo ejecutar con mis permisos?

La maquina es el equivalente al vehiculo dentro de un taller automotriz. `Machine` es el activo principal y `MaintenancePlan`, `MaintenanceLog`, `Notification` y `AuditEvent` son registros relacionados que deben presentarse juntos.

## 2. Usuarios Y Contexto

| Usuario               | Necesidad principal                                               |
| --------------------- | ----------------------------------------------------------------- |
| `Admin`               | Entender el estado completo y ejecutar cualquier accion permitida |
| `Maintenance Manager` | Detectar riesgo, pendientes y necesidades de programacion         |
| `Technician`          | Revisar contexto tecnico antes de ejecutar o registrar un trabajo |
| `Viewer`              | Consultar el estado sin modificar informacion                     |

La superficie es de tipo **Operate**: debe privilegiar escaneo, contexto y acciones claras sobre exploracion decorativa.

## 3. Ruta Y Entrada

La ruta propuesta es:

```text
/machines/:id
```

La entrada principal sera la lista de maquinas. Cada fila o tarjeta debe tener una accion explicita para abrir el expediente. No se debe depender solo de hacer clic en un area ambigua.

La ruta debe conservar el `id` de la maquina para permitir:

- Compartir o abrir directamente un expediente.
- Recargar sin perder contexto.
- Volver a la lista conservando la navegacion esperada.

## 4. Resultado Principal

Al abrir una maquina, el usuario debe ver primero un resumen operativo, no una tabla vacia ni una lista de historiales sin contexto.

La jerarquia de informacion es:

1. Identidad y estado de la maquina.
2. Riesgo y situacion de mantenimiento.
3. Siguiente accion recomendada.
4. Planes y pendientes.
5. Historial tecnico.
6. Alertas y trazabilidad.

## 5. Arquitectura De La Pantalla

### 5.1 Encabezado Del Activo

Debe mostrar:

- Nombre de la maquina.
- Categoria.
- Identificador interno o `id` corto.
- Numero de serie, si existe.
- Ubicacion.
- Estado operativo.
- Criticidad.
- Fecha de instalacion, si existe.
- Fecha de ultima actualizacion.

Acciones en el encabezado:

- `Editar maquina`, si existe `machines:update`.
- `Retirar maquina`, si existe `machines:retire`.
- `Registrar mantenimiento`, si existe `maintenance-logs:create`.
- Volver a `Maquinas`.

Las acciones se deben ocultar o deshabilitar segun las capacidades existentes, pero la API debe seguir validando permisos.

### 5.2 Franja De Salud Operativa

Mostrar tarjetas de lectura rapida con:

- Estado actual.
- Proximo mantenimiento.
- Preventivos vencidos.
- Alertas abiertas.
- Dias desde el ultimo mantenimiento.
- Fallas criticas recientes.

Cada tarjeta debe incluir el valor, una etiqueta comprensible y una indicacion de severidad cuando aplique. No usar color como unica forma de comunicar riesgo.

### 5.3 Siguiente Accion

Debe existir una zona de prioridad que explique que requiere atencion ahora.

Ejemplos:

```text
Mantenimiento preventivo vencido hace 12 dias.
Hay una alerta critica abierta.
El siguiente mantenimiento vence en 5 dias.
No hay pendientes inmediatos.
```

La zona debe mostrar una accion util cuando exista:

- Registrar mantenimiento.
- Abrir alerta.
- Revisar plan.
- Programar una intervencion, cuando exista `WorkOrder` en una fase futura.

No debe presentar recomendaciones de causa raiz en esta fase. Esas reglas corresponden a las Fases 35 y 36.

### 5.4 Planes Preventivos

Mostrar los planes asociados a la maquina con:

- Nombre del plan.
- Frecuencia.
- Fecha de inicio.
- Proxima fecha de vencimiento.
- Inicio de ventana de advertencia.
- Estado activo o inactivo.
- Indicador de vencido, proximo o en tiempo.

Acciones:

- Crear plan, con `maintenance-plans:create`.
- Editar plan, con `maintenance-plans:update`.
- Activar plan, con `maintenance-plans:activate`.
- Desactivar plan, con `maintenance-plans:deactivate`.

En esta fase no se agrega todavia una agenda independiente. La proxima fecha se presenta como dato calculado por los planes existentes.

### 5.5 Historial De Mantenimiento

Mostrar el historial mas reciente en orden descendente por `performedAt`.

Cada registro debe mostrar:

- Fecha y hora.
- Tipo: preventivo, correctivo o inspeccion.
- Resultado.
- Tecnico o responsable registrado.
- Plan relacionado, si existe.
- Resumen de notas.
- Indicador de falla critica.

Debe existir una accion para consultar el historial completo filtrado por esa maquina. No se deben agregar controles de edicion o eliminacion porque los logs son inmutables.

### 5.6 Alertas Abiertas

Mostrar notificaciones abiertas y, cuando sea relevante, reconocidas:

- Tipo.
- Severidad.
- Titulo.
- Mensaje.
- Fecha de vencimiento o creacion.
- Estado.

Acciones por permiso:

- Reconocer, con `notifications:acknowledge`.
- Resolver, con `notifications:resolve`.
- Descartar, con `notifications:dismiss`.

Las acciones deben actualizar la seccion sin perder la posicion del usuario en el expediente.

### 5.7 Actividad Y Auditoria

La Fase 22 define el espacio para actividad tecnica y auditoria, pero no requiere mostrar todos los eventos de auditoria en la primera version.

La primera entrega puede mostrar una actividad combinada basada en:

- Mantenimientos.
- Creacion y transiciones de notificaciones.
- Cambios de planes.
- Cambios de la maquina.

Si se muestran `AuditEvent`, deben presentarse como trazabilidad tecnica, no como un segundo historial duplicado. La consulta avanzada con filtros corresponde a la Fase 37.

## 6. Contrato De Datos Para Fase 23

La respuesta de `GET /api/machines/:id/profile` debe ser especifica para el expediente y evitar que el frontend tenga que coordinar varias llamadas para construir el resumen.

Contrato conceptual:

```ts
type MachineProfile = {
  machine: Machine;
  health: {
    lastMaintenanceAt: string | null;
    daysSinceLastMaintenance: number | null;
    nextMaintenanceAt: string | null;
    overduePreventiveCount: number;
    openNotificationCount: number;
    recentCriticalFailureCount: number;
  };
  maintenancePlans: MaintenancePlan[];
  recentMaintenanceLogs: MaintenanceLog[];
  openNotifications: Notification[];
  activity: MachineActivity[];
};
```

El tipo anterior es conceptual. La Fase 23 debe confirmar nombres, paginacion y limites de cada coleccion sin romper los endpoints existentes.

Reglas del contrato:

- `machine` siempre es obligatorio cuando la respuesta es exitosa.
- Las colecciones vacias deben devolverse como `[]`, nunca como `null`.
- Los datos no disponibles deben usar `null` de forma explicita.
- Las fechas deben conservar formato ISO.
- El backend calcula metricas y estados derivados.
- `recentCriticalFailureCount` considera fallas de los ultimos 180 dias.
- `openNotificationCount` cuenta solo notificaciones con estado `OPEN`.
- `openNotifications` puede incluir notificaciones `OPEN` y `ACKNOWLEDGED` para conservar contexto accionable.
- `recentMaintenanceLogs` y `openNotifications` deben tener limites para mantener estable la respuesta.
- El endpoint requiere `machines:read`.
- No incluir passwords, tokens, cookies ni datos internos de sesiones.

## 7. Estados De La Superficie

La pantalla debe diseñarse para estos estados:

### Cargando

- Mostrar una estructura estable de encabezado, tarjetas y secciones.
- Evitar saltos grandes de layout.
- No mostrar valores falsos como cero mientras se carga.

### Maquina No Encontrada

- Mostrar un mensaje claro.
- Ofrecer volver al registro de maquinas.
- No mostrar un expediente parcial como si fuera valido.

### Error De Carga

- Explicar que el expediente no pudo cargarse.
- Ofrecer reintentar.
- Conservar la posibilidad de regresar a la lista.

### Sin Historial

```text
Todavia no hay mantenimientos registrados para esta maquina.
```

La accion principal debe ser registrar un mantenimiento si el usuario tiene permiso.

### Sin Planes

```text
Esta maquina no tiene un plan preventivo activo.
```

Ofrecer crear un plan si el usuario tiene permiso.

### Sin Alertas

```text
No hay alertas abiertas para esta maquina.
```

Debe ser un estado positivo, no un error.

### Solo Lectura

El expediente completo sigue siendo visible para `Viewer`, pero no muestra acciones que no puede ejecutar.

## 8. Responsive Y Accesibilidad

### Desktop

- Mantener el encabezado y la siguiente accion visibles al inicio.
- Usar una composicion de resumen y detalle que permita escanear sin convertir cada seccion en una tabla extensa.
- Las secciones largas deben tener limites claros y acciones locales.

### Mobile

- Priorizar identidad, riesgo, proximo mantenimiento y alertas.
- Apilar tarjetas y secciones en una sola columna.
- Mantener las acciones principales accesibles sin depender de hover.
- Usar botones con texto o nombre accesible.
- Evitar tablas anchas; convertir registros a tarjetas o filas apiladas.

### Accesibilidad

- Usar un unico `h1` para el nombre de la maquina.
- Mantener jerarquia de headings por seccion.
- Anunciar estados de carga, error y actualizacion con regiones apropiadas.
- No comunicar criticidad solamente mediante rojo, amarillo o verde.
- Asegurar foco visible en modales y acciones despues de una mutacion.
- Mantener contraste y targets tactiles suficientes.

## 9. Limites De Fase

La Fase 22 no incluye:

- Ordenes de trabajo.
- Refacciones o inventario.
- Agenda o calendario.
- Costos acumulados.
- Recomendaciones predictivas.
- Administracion de usuarios.
- Consulta avanzada de auditoria.
- Permisos por planta o area.

Estas capacidades se incorporan en las fases posteriores del roadmap y no deben inventarse dentro del primer expediente.

## 10. Criterios De Aceptacion

- Existe una especificacion estable para `/machines/:id`.
- El expediente tiene una jerarquia clara entre identidad, riesgo, siguiente accion, planes, historial y alertas.
- Cada accion tiene permiso asociado.
- Se distinguen estados de carga, error, vacio, no encontrado y solo lectura.
- Se define el contrato conceptual de `MachineProfile` para la Fase 23.
- La informacion reutiliza `Machine`, `MaintenancePlan`, `MaintenanceLog`, `Notification` y `AuditEvent`.
- No se introducen ordenes de trabajo, refacciones ni recomendaciones antes de sus fases correspondientes.
- La superficie esta definida para desktop y mobile.
- La primera implementacion puede construirse sin modificar los endpoints existentes.

## 11. Secuencia De Implementacion

```text
Fase 22: aprobar esta especificacion.
Fase 23: implementar GET /api/machines/:id/profile.
Fase 24: implementar /machines/:id y sus estados.
Fase 25: extraer o completar GET /api/machines/:id/timeline.
```

La siguiente decision tecnica pendiente es si `activity` forma parte del endpoint de profile o si se carga mediante el endpoint separado de timeline. Para la primera entrega se recomienda incluir una actividad reciente limitada y reservar el historial completo para la Fase 25.
