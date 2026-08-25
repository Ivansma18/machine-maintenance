# Operacion local de Auth/Roles

Esta guia describe el flujo local para probar la autenticacion y recuperar una base de datos de desarrollo sin versionar credenciales.

## Configuracion inicial

1. Copiar `apps/api/.env.example` a `apps/api/.env`.
2. Crear la base PostgreSQL `machine_maintenance`.
3. Definir `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_NAME` y `ADMIN_PASSWORD` en `apps/api/.env`.
4. Mantener `ADMIN_PASSWORD` solo en el entorno local; no agregar el archivo `.env` al repositorio.
5. Ejecutar `npm install`, `npm run prisma:generate`, `npm run prisma:migrate:deploy` y `npm run prisma:seed`.

El seed es idempotente. Puede repetirse despues de cambiar permisos o roles administrables. No reemplaza la password de un usuario admin ya existente de forma inesperada.

## Desarrollo diario

- API: `npm run start:api` en `http://localhost:3002`.
- Web: `npm run dev:web` en `http://localhost:5174`.
- Health check: `GET http://localhost:3002/api/health`.
- Login: usar el `ADMIN_USERNAME` o `ADMIN_EMAIL` configurado y su password local.

La cookie de sesion es HttpOnly, usa `SameSite=Lax`, tiene `Path=/` y solo usa `Secure` cuando `NODE_ENV=production`. El servidor conserva el hash del token, nunca el token plano.

## Verificaciones operativas

- Abrir dos navegadores o perfiles e iniciar sesion con el mismo usuario.
- Cerrar sesion en un perfil y confirmar que el otro sigue autenticado.
- Cambiar `isActive` del usuario a `false` y confirmar que las sesiones dejan de validar.
- Confirmar que un usuario `Viewer` puede leer, pero no puede ejecutar acciones de escritura.
- Confirmar que una llamada directa sin permiso recibe `403`; ocultar un boton no sustituye esta validacion.
- Confirmar que una sesion sin cookie, revocada o expirada recibe `401`.

## Reset local

El reset elimina todos los datos de la base indicada por `DATABASE_URL`. Ejecutarlo solo en una base de desarrollo:

```text
npx prisma migrate reset --schema prisma/schema.prisma
npm run prisma:seed
```

Si la base contiene datos que deban conservarse, no ejecutar el reset. Aplicar solamente migraciones pendientes con `npm run prisma:migrate:deploy` y volver a ejecutar el seed si se actualizo la matriz base.

## Incidentes frecuentes

| Sintoma                            | Causa probable                                         | Accion                                                              |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Login devuelve `401`               | Variables del admin incorrectas o usuario inactivo     | Revisar `apps/api/.env` y el registro del usuario                   |
| Web no conserva la sesion          | `WEB_ORIGIN` no coincide con el origen del navegador   | Ajustar `WEB_ORIGIN` y reiniciar la API                             |
| Todas las llamadas devuelven `401` | Cookie ausente o API reiniciada con otra configuracion | Revisar DevTools, limpiar cookies locales y volver a iniciar sesion |
| Accion devuelve `403`              | El permiso no pertenece a los roles efectivos          | Revisar la matriz y las relaciones `RolePermission`                 |
