# Portfolio Copy

## One-liner

Sistema full-stack de mantenimiento preventivo para maquinaria de panaderia, con
ordenes de trabajo, alertas, auditoria y permisos por planta o area.

## Short description

Pantry Maintenance centraliza el ciclo operativo de mantenimiento: registra maquinas,
calcula vencimientos, coordina ordenes de trabajo, documenta intervenciones y muestra
alertas accionables. Fue construido con NestJS, Next.js, Prisma y PostgreSQL.

## Case study

### Contexto

Las operaciones de panaderia dependen de equipos como hornos, batidoras y amasadoras.
Cuando la informacion se dispersa entre hojas de calculo, mensajes y registros
manuales, es dificil saber que maquina requiere atencion, quien es responsable y si
una falla se repite.

### Problema

Se necesitaba una herramienta operativa que combinara mantenimiento preventivo,
historial tecnico y seguimiento de fallas sin perder simplicidad de uso para equipos
de mantenimiento.

### Solucion

Se construyo una plataforma con dashboard, expediente tecnico por maquina, planes
preventivos, ordenes de trabajo, agenda, alertas urgentes, metricas de reincidencia,
refacciones y auditoria.

### Retos tecnicos

- Diseñar un monorepo orientado a dominios sin crear capas globales rigidas.
- Mantener la autorizacion en el backend y reflejar permisos en el frontend.
- Evolucionar de permisos globales a scopes por planta y area.
- Modelar fechas preventivas y transiciones de ordenes de forma determinista.
- Integrar Ant Design y Motion.dev sin acoplar las features a librerias visuales.
- Conservar una experiencia responsive para operacion en pantallas pequenas.

### Resultado

El MVP permite pasar de una vista general de la operacion a la trazabilidad detallada
de una maquina y sus mantenimientos. La base tecnica queda preparada para agregar
mas plantas, usuarios y dominios empresariales sin adelantar un ERP completo.

## Bullet points para CV

- Desarrolle una plataforma full-stack de mantenimiento preventivo con NestJS,
  Next.js, Prisma y PostgreSQL.
- Implemente autenticacion por sesiones, RBAC, permisos efectivos y scopes por planta
  o area con enforcement en backend.
- Modele el ciclo de mantenimiento con maquinas, planes preventivos, ordenes de
  trabajo, historial, alertas, refacciones y auditoria.
- Organice el frontend por features con App Router, hooks de datos y wrappers propios
  para Ant Design y Motion.dev.
- Agregue dashboard operativo, agenda responsive, metricas de reincidencia y
  expediente tecnico por maquina.
- Valide la implementacion con pruebas Jest, typecheck, migraciones Prisma y builds
  de produccion para API y web.

## Project card

**Pantry Maintenance**  
Full-stack maintenance operations platform  
NestJS | Next.js | TypeScript | Prisma | PostgreSQL | Tailwind | Ant Design

## Demo checklist

Capturas recomendadas para presentar el proyecto:

1. Login y estado de sesion.
2. Dashboard con metricas y alertas.
3. Lista y formulario de maquinas.
4. Expediente tecnico con timeline.
5. Planes preventivos y fechas de vencimiento.
6. Ordenes de trabajo y detalle.
7. Agenda semanal o mensual.
8. Usuarios con roles y scopes.
9. Auditoria.
10. Vista mobile con navegacion responsive.
