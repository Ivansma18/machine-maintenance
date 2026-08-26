# Diseno De Refacciones, Inventario Y Consumo

Este documento define la Fase 30 del roadmap de evolucion. Es la especificacion funcional y
tecnica para incorporar refacciones al mantenimiento sin mezclar el catalogo, la existencia
disponible y el consumo realizado durante una intervencion.

La Fase 31 implementara persistencia y API. La Fase 32 mostrara el historial de piezas en el
expediente de maquina. Este documento no agrega codigo, migraciones ni endpoints.

## 1. Proposito

El modulo debe responder rapidamente estas preguntas:

- Que piezas existen en el catalogo?
- Que cantidad esta disponible?
- Cual es la existencia minima que requiere reposicion?
- Que piezas se consumieron en un mantenimiento concreto?
- En que maquinas se ha utilizado una pieza?
- Cuanto consumo tiene una pieza sin alterar el historial original?

Una `Part` describe una pieza reutilizable. Un `InventoryItem` representa su existencia operativa.
Un `MaintenanceLogPart` representa una salida de inventario asociada a trabajo ya realizado.
El catalogo no es inventario y el inventario no es historial de mantenimiento.

## 2. Alcance Y Usuarios

| Usuario               | Necesidad principal                         | Capacidades esperadas                         |
| --------------------- | ------------------------------------------- | --------------------------------------------- |
| `Admin`               | Controlar catalogo y existencias             | Crear, editar, ajustar y consultar             |
| `Maintenance Manager` | Coordinar piezas para trabajos               | Consultar, ajustar y registrar consumo         |
| `Technician`          | Informar piezas usadas en una intervencion   | Consultar y registrar consumo de su trabajo    |
| `Viewer`              | Conocer disponibilidad e historial            | Consultar sin mutar                            |

El backend continuara siendo la autoridad para stock, consumo, permisos y auditoria. El
frontend solo debe presentar disponibilidad y advertencias; no puede calcular ni confirmar una
salida por su cuenta.

## 3. Modelo Conceptual

### 3.1 `Part`

Catalogo maestro de refacciones.

```text
Part
- id
- sku
- name
- description?
- unit
- manufacturer?
- manufacturerPartNumber?
- isCritical
- isActive
- createdAt
- updatedAt
```

Reglas:

- `sku` es obligatorio y unico, sin distinguir mayusculas ni espacios laterales.
- `name` es obligatorio y describe una pieza concreta.
- `unit` define como se cuenta la pieza y no debe cambiarse si ya tiene consumo; una correccion
  historica requiere una migracion explicita.
- `manufacturerPartNumber` es informativo y no reemplaza el `sku` interno.
- `isCritical` identifica una pieza cuya falta puede detener una maquina o retrasar un trabajo.
- `isActive = false` evita nuevos consumos, pero conserva el historial existente.
- No se borran piezas con inventario o consumo relacionado.

Unidades iniciales:

```text
UNIT       pieza individual
SET        conjunto o kit
METER      longitud
LITER      volumen
KILOGRAM   peso
```

La Fase 31 debe validar que la cantidad tenga como maximo la precision definida para la unidad.
La primera version puede usar cantidades decimales no negativas para soportar metros, litros y
kilogramos sin crear modelos paralelos.

### 3.2 `InventoryItem`

Existencia agregada de una pieza. En esta primera version existe un solo inventario operativo
por pieza porque `Site`, `Area` y almacenes pertenecen a fases posteriores.

```text
InventoryItem
- id
- partId
- quantityOnHand
- minimumQuantity
- reorderQuantity?
- unitCost?
- createdAt
- updatedAt
```

Reglas:

- Existe como maximo un `InventoryItem` por `Part`.
- `quantityOnHand`, `minimumQuantity` y `reorderQuantity` nunca son negativos.
- `minimumQuantity` define cuando la pieza debe marcarse como bajo minimo.
- `reorderQuantity`, si existe, es una recomendacion de reposicion y no crea compras.
- `unitCost` es opcional y representa el costo de referencia actual, no un valor historico de
  consumo. Costos, proveedores y compras quedan fuera de esta fase.
- `quantityOnHand = 0` es valido; no se permiten salidas que produzcan stock negativo.
- La cantidad solo cambia mediante una operacion de inventario auditada o un consumo de log.

Estados derivados para lectura:

```text
AVAILABLE   quantityOnHand > minimumQuantity
LOW         quantityOnHand > 0 y quantityOnHand <= minimumQuantity
OUT         quantityOnHand = 0
```

Estos estados no se persisten como enum en la primera version. Se calculan en backend para evitar
duplicar datos y estados desactualizados.

### 3.3 `MaintenanceLogPart`

Linea de consumo de una pieza durante un mantenimiento ya realizado.

```text
MaintenanceLogPart
- id
- maintenanceLogId
- partId
- quantity
- unitCostSnapshot?
- notes?
- createdAt
```

Relaciones:

```text
MaintenanceLog 1 ---- N MaintenanceLogPart N ---- 1 Part
Part            1 ---- 1 InventoryItem
```

Reglas:

- `maintenanceLogId` y `partId` son obligatorios.
- `quantity` debe ser mayor que cero y expresarse en la unidad de `Part`.
- La pieza debe estar activa para registrar nuevo consumo.
- `unitCostSnapshot`, si se habilita, copia el costo vigente al momento del consumo. Nunca se
  recalcula retroactivamente desde `InventoryItem.unitCost`.
- `notes` permite registrar reemplazo, motivo o una observacion tecnica breve.
- El registro es inmutable despues de crearse. Una correccion se realiza con una operacion de
  ajuste definida en la Fase 31, no editando silenciosamente el historial.
- No se debe agregar una pieza a un log de otra maquina mediante un plan o referencia cruzada;
  el `MaintenanceLog` es la fuente de la maquina consumidora.
- Una misma pieza puede aparecer una sola vez por log en la primera version. Si el futuro
  requiere lotes o costos diferentes, se agregara una nocion de linea explicita.

## 4. Flujo De Consumo

El consumo se registra despues de crear el `MaintenanceLog` y forma parte del cierre operativo:

```text
MaintenanceLog existente
-> usuario selecciona Part activa
-> backend valida unidad y cantidad
-> backend bloquea InventoryItem
-> backend verifica stock suficiente
-> backend descuenta quantityOnHand
-> backend crea MaintenanceLogPart
-> backend registra auditoria
```

La actualizacion de inventario y la creacion de `MaintenanceLogPart` deben ejecutarse en una
sola transaccion. Si una de las dos operaciones falla, ninguna debe persistir.

La primera version no crea automaticamente una orden de compra, no reserva stock para una
`WorkOrder` abierta y no descuenta piezas al iniciar una orden. El descuento ocurre cuando el
trabajo ya esta registrado en `MaintenanceLog`.

## 5. Ajustes De Inventario

La Fase 31 necesitara una operacion explicita para entradas, correcciones y retiros:

```text
RECEIPT      entrada recibida
ADJUSTMENT   correccion de conteo
WASTE        merma o dano
CONSUMPTION  salida ligada a MaintenanceLogPart
```

Esta lista define el vocabulario, no un modelo de movimientos obligatorio para Fase 30. La
decision de persistir `InventoryMovement` se toma en la Fase 31. Si se elige no crear ese modelo,
cada ajuste debe conservar al menos actor, motivo, cantidad anterior y posterior en `AuditEvent`.

No se permite modificar `quantityOnHand` con un PATCH generico sin motivo y auditoria.

## 6. Permisos

Permisos iniciales sugeridos:

```text
parts:read
parts:create
parts:update
inventory:read
inventory:adjust
maintenance-logs:parts
```

Reglas:

- `parts:read` permite consultar catalogo, existencia y consumo agregado.
- `parts:create` permite crear una pieza.
- `parts:update` permite editar datos no historicos y activar o desactivar una pieza.
- `inventory:read` permite consultar cantidades y alertas de bajo minimo.
- `inventory:adjust` permite registrar entradas, mermas y correcciones.
- `maintenance-logs:parts` permite asociar consumo a un `MaintenanceLog`.
- Un `Technician` puede consumir piezas solo en logs que pueda registrar segun las reglas de
  mantenimiento existentes. El permiso no autoriza a ajustar inventario arbitrariamente.
- `Viewer` no puede crear consumo ni modificar existencias.

## 7. Auditoria

Acciones minimas auditables:

```text
part.created
part.updated
part.activated
part.deactivated
inventory.adjusted
maintenance-log-part.created
```

Cada consumo debe conservar:

- Actor, tipo de actor y `requestId`.
- `entityType = MaintenanceLogPart` para el evento de consumo.
- `entityId` de la linea creada.
- Identidad de la pieza y del `MaintenanceLog`.
- Cantidad consumida.
- Existencia anterior y posterior.
- Motivo o notas cuando sea un ajuste.

No guardar passwords, tokens, cookies ni snapshots de sesion.

## 8. Contrato De Consulta Para Fase 31

La API inicial sugerida es:

```text
GET   /api/parts
POST  /api/parts
GET   /api/parts/:id
PATCH /api/parts/:id
GET   /api/inventory
PATCH /api/inventory/:partId/adjust
GET   /api/maintenance-logs/:id/parts
POST  /api/maintenance-logs/:id/parts
```

La respuesta de una pieza debe incluir su existencia actual sin obligar al frontend a hacer una
segunda consulta:

```ts
type PartResponse = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: PartUnit;
  manufacturer: string | null;
  manufacturerPartNumber: string | null;
  isCritical: boolean;
  isActive: boolean;
  inventory: {
    quantityOnHand: number;
    minimumQuantity: number;
    reorderQuantity: number | null;
    unitCost: number | null;
    stockState: 'AVAILABLE' | 'LOW' | 'OUT';
  } | null;
};
```

El endpoint de consumo debe aceptar solo los datos propios de la linea:

```ts
type AddMaintenanceLogPartInput = {
  partId: string;
  quantity: number;
  notes?: string;
};
```

El backend obtiene la maquina, unidad, estado de la pieza y costo snapshot. El cliente no puede
enviar `machineId`, `unitCostSnapshot` ni la existencia posterior.

## 9. Integracion Con El Expediente Tecnico

La Fase 32 mostrara en `/machines/:id`:

- Ultimas piezas consumidas.
- Cantidad total consumida por periodo.
- Piezas criticas sin existencia.
- Piezas bajo minimo.
- Frecuencia de reemplazo por pieza.
- Acceso al `MaintenanceLog` de origen.

El expediente no debe presentar una pieza como consumida si solo fue seleccionada en una orden
abierta. El origen confiable es siempre `MaintenanceLogPart`.

## 10. Estados De UI Para Fases Posteriores

- Catalogo cargando: skeleton sin cantidades inventadas.
- Sin piezas: explicar como registrar la primera refaccion.
- Sin inventario: distinguir pieza sin existencia de pieza sin registro de inventario.
- Bajo minimo: advertencia visible, sin bloquear consulta.
- Sin stock: bloquear consumo y explicar la cantidad disponible.
- Pieza inactiva: ocultarla de nuevas selecciones y mantener historial.
- Conflicto de stock: recargar existencia y pedir confirmacion con la cantidad actual.
- Consumo exitoso: mostrar cantidad descontada y enlace al historial.
- Error transaccional: informar que no se guardo ni el consumo ni el descuento.

## 11. Fuera De Alcance

- Multi-planta, almacenes y ubicaciones por sitio.
- Proveedores, compras y ordenes de compra.
- Lotes, caducidad y numeros de serie de piezas.
- Reservas de stock para `WorkOrder`.
- Costeo contable y valorizacion FIFO/promedio.
- Reabastecimiento automatico.
- Importacion masiva y codigo de barras.
- Prediccion de consumo.
- Edicion o borrado de consumos historicos.

## 12. Criterios De Aceptacion

- Se distingue formalmente `Part`, `InventoryItem` y `MaintenanceLogPart`.
- Cada pieza tiene SKU, unidad, estado activo y reglas de identidad definidas.
- La existencia inicial es unica por pieza y no depende de multi-planta.
- Las cantidades no pueden producir stock negativo.
- Un consumo solo puede ligarse a un `MaintenanceLog` existente.
- La salida y la linea de consumo se guardan en una transaccion.
- El consumo conserva la unidad y la cantidad usadas.
- El costo snapshot, si se habilita, no cambia retroactivamente.
- Las piezas inactivas conservan su historial y no aceptan nuevo consumo.
- Ajustes y consumos requieren permisos y auditoria.
- Se define el contrato inicial de API para la Fase 31.
- Se definen las superficies del expediente para la Fase 32.
- No se introducen multi-planta, compras, reservas ni costeo avanzado antes de sus fases.
