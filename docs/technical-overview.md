# Technical Overview

## Contexto

Pantry Maintenance es una aplicacion para equipos que necesitan controlar el estado
de maquinaria de panaderia y reducir mantenimientos vencidos o fallas criticas.
El foco es la operacion diaria: consultar el estado, planificar trabajo, ejecutar
intervenciones y conservar evidencia tecnica.

## Arquitectura de alto nivel

```text
Browser
  |
  | HTTPS + httpOnly session cookie
  v
Next.js web  ---- HTTP/JSON + credentials ---->  NestJS API
                                                    |
                                                    v
                                               Prisma ORM
                                                    |
                                                    v
                                               PostgreSQL
```

El frontend consume la API mediante un cliente HTTP compartido. La API es responsable
de validar la sesion, permisos, alcance de datos y reglas de negocio. PostgreSQL
almacena el estado transaccional y Prisma administra el esquema mediante migraciones.

## Backend

NestJS esta organizado por funcionalidad, no por capas globales:

- `auth`: login, logout, sesion y renovacion de sesiones.
- `authorization`: guards, decoradores de permisos y filtros por scope.
- `users`: administracion de usuarios, roles y alcances.
- `machines`: CRUD, filtros, expediente y timeline tecnico.
- `maintenance-plans`: frecuencias y fechas de vencimiento.
- `maintenance-logs`: ejecuciones, resultados y fallos criticos.
- `work-orders`: programacion, asignacion y transiciones de estado.
- `notifications`: alertas urgentes, preventivas y procesamiento horario.
- `parts`: catalogo, inventario y consumos.
- `locations`: plantas, areas y lineas de produccion.
- `audit`: registro y consulta de eventos administrativos y operativos.
- `dashboard`: resumen agregado para la operacion.

Cada modulo contiene sus propios DTOs y pruebas cuando la responsabilidad lo requiere.
Esto mantiene alta cohesion y hace mas sencillo evolucionar un dominio sin crear una
capa de servicios global dificil de mantener.

## Autenticacion y autorizacion

La autenticacion usa sesiones persistidas en PostgreSQL. El token se entrega mediante
una cookie `httpOnly`; el servidor guarda un hash del token, no el token en claro.
Cada request autenticado obtiene una identidad con:

- Usuario.
- Roles.
- Permisos efectivos.
- Alcances por planta o area.

La autorizacion tiene dos dimensiones:

1. **Permiso:** determina si el usuario puede leer o ejecutar una accion.
2. **Scope:** determina sobre que plantas o areas puede operar.

Los usuarios administradores conservan acceso global. La API aplica el alcance al
construir las consultas, evitando depender de filtros enviados por el navegador.

## Modelo operativo

```text
Site -> Area -> ProductionLine -> Machine
                                |
              +-----------------+-----------------+
              v                 v                 v
       MaintenancePlan   MaintenanceLog      WorkOrder
              |                 |                 |
              +-----------------+-----------------+
                                v
                         Notification
```

Las refacciones se relacionan con mantenimientos e inventario. La auditoria conserva
quien ejecuto una accion, sobre que entidad y con que contexto de request.

## Frontend

Next.js App Router contiene rutas pequenas que componen paginas de feature. La logica
de carga, estados y acciones vive en hooks; las llamadas HTTP viven en `api/`; las
transformaciones puras viven en `utils/`.

La UI usa wrappers propios para Ant Design y Motion.dev. Esto evita acoplar las
features de dominio a APIs visuales de terceros y deja un punto unico para tema,
accesibilidad y comportamiento responsive.

## Calidad y mantenibilidad

- DTOs con validacion y transformacion en la frontera HTTP.
- Transacciones para cambios que deben ser atomicos.
- Pruebas unitarias sobre servicios y reglas de dominio.
- Migraciones versionadas y seed repetible.
- TypeScript en frontend y backend.
- Builds de produccion separados por aplicacion.
- Estados de loading, error, empty y success en las pantallas operativas.
- Responsive mobile con navegacion horizontal que mantiene visible la seccion activa.

## Decisiones y trade-offs

### Sesiones en vez de JWT

Las sesiones persistidas permiten revocacion inmediata y mantienen el control de
autenticacion en el servidor. El costo es consultar la base en requests autenticados,
un intercambio adecuado para un sistema operativo interno.

### Monorepo sin paquete compartido obligatorio

El monorepo coordina frontend y API con npm workspaces. Los dominios permanecen
independientes para evitar un paquete compartido que se convierta en un acoplamiento
prematuro.

### Scopes en la capa de consulta

Aplicar los scopes en backend reduce el riesgo de exponer informacion por un filtro
visual incompleto. El frontend puede ocultar acciones, pero nunca reemplaza la
validacion del servidor.

## Evolucion futura

- Observabilidad con logs estructurados, metricas y trazas.
- Backups y estrategia de recuperacion de PostgreSQL.
- Pruebas end-to-end en un entorno controlado.
- Notificaciones externas por correo o canales internos.
- Integraciones con compras, proveedores, clientes y ERP despues de estabilizar
  el dominio de mantenimiento.
