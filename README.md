# Planubi

Planificador semanal (MVP) construido con Next.js + Tailwind. Persistencia local (localStorage) con canal reactivo para sincronizar tabs. Diseñado para facilitar la programación rápida de tareas.

## Características

- Backlog de tareas sin fecha/hora.
- Vista semanal (7 días) con horas 07:00-20:00.
- Crear tareas desde backlog, cabecera de día o slot horario.
- Marcar tareas como realizadas.
- Indicador de vencimiento (<=3 días) y vencidas.
- Arquitectura lista para migración a IndexedDB (abstraer en `tasksRepo`).

## Futuras mejoras sugeridas

- Drag & drop backlog -> calendario.
- Edición rápida (doble click) y descripción expandible.
- Filtros por estado / búsqueda.
- Persistencia con IndexedDB (idb) para escalabilidad.

## Scripts

- `npm run dev` desarrollo
- `npm run build` build producción
- `npm start` servir build

## Migrar a IndexedDB (idea rápida)

Crear implementación alternativa de almacenaje que cumpla la misma interfaz que `tasksRepo` y use idb. Inyectar vía contexto o factoría.
