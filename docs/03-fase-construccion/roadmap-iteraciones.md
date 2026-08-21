[HelpDesk](../README.md) / [Fase de Construcción](README.md)

# Roadmap de Iteraciones — estado y continuación

Documento pensado para retomar el trabajo en una sesión nueva (de Claude o de quien sea): resume qué está cerrado, qué falta y cómo levantar el entorno. El detalle completo de cada decisión técnica vive en [Decisiones Técnicas por Iteración](decisiones-tecnicas.md) — este documento es el mapa, no el registro.

## Cómo levantar el entorno

```bash
cp .env.example .env        # si no existe ya
docker compose up --build
```

- Cliente: http://localhost:5173 — API: http://localhost:3000/api
- Modo de desarrollo: todo corre dentro de Docker (bind-mount + hot-reload), decisión tomada para portabilidad entre las 2 PCs del usuario — ver Iteración 0 en `decisiones-tecnicas.md`.
- Seed (`docker compose exec app npm run db:seed`, o se ejecuta con el propio `npm run dev`... **no**, hay que correrlo a mano tras la primera migración): crea el Administrador inicial y el catálogo base (Equipo "Soporte General", Categoría "General", Prioridades Baja/Media/Alta).
- **Gotcha conocido:** si `npm run dev` falla con "not found" tras añadir una dependencia nueva, el volumen `node_modules` quedó desactualizado — `docker compose down && docker volume rm 01-helpdesk_app-node-modules && docker compose up --build`.

### Usuarios de prueba creados a mano durante Construcción (no están en el seed)

Estos existen solo en la base de datos de la sesión de desarrollo actual — si alguien clona el repo desde cero, no existirán hasta recrearlos vía UI/API:

| Correo | Contraseña | Rol | Equipo |
|---|---|---|---|
| admin@helpdesk.local | admin123 | ADMINISTRADOR | — |
| sara@helpdesk.local | super123 | SUPERVISOR | Soporte General |
| alex2@helpdesk.local | agente123 | AGENTE | Soporte General |
| pepe@helpdesk.local | pepe1234 | SOLICITANTE | — |

## Reglas de trabajo acordadas con el usuario (memoria persistente, pero repetidas aquí por si acaso)

1. **No hacer commits sin que el usuario lo pida explícitamente.** Nunca commitear al cerrar una iteración por iniciativa propia.
2. **Pausar al cerrar cada iteración** y esperar el visto bueno antes de arrancar la siguiente — no ejecutar el roadmap completo de corrido.
3. **Documentar en `decisiones-tecnicas.md` antes de reportar una iteración cerrada** — el código lleva como mucho un comentario corto; el razonamiento completo vive en ese documento, no en el código.
4. **Código Clean Code**: nombres claros, funciones pequeñas de una responsabilidad, comentarios mínimos.
5. Probar cada iteración de verdad (navegador real vía Chrome DevTools MCP y/o API), no solo dar por hecho que compila.

## Estado del roadmap

| # | Iteración | Estado |
|---|---|---|
| 0 | Entorno y esqueleto | ✅ Cerrada |
| 1 | Acceso y Sesión + Usuario | ✅ Cerrada |
| 2 | Categoría, Equipo, Prioridad+SLA | ✅ Cerrada |
| 3 | Ticket, flujo mínimo viable | ✅ Cerrada |
| 4 | Ticket, resto del ciclo de vida | ✅ Cerrada |
| 5 | Contenido de Ticket + Base de Conocimiento | ✅ Cerrada |
| 6 | Dashboard de Métricas | ⏳ **Siguiente** |
| — | Cierre de fase / hardening (IOCM) | Pendiente |

### Resumen de lo ya construido (iteraciones 0 a 5)

- **Backend**: `server/src/modules/{auth,usuarios,categorias,equipos,prioridades,tickets,articulos}` — Express + Prisma, JWT en cookie httpOnly, 8 Controllers según el Modelo de Análisis/Diseño.
- **Frontend**: `client/src/pages/{usuarios,categorias,equipos,prioridades,tickets,articulos}` — React + Vite + react-router-dom, sin Redux ni librería de estado (Context API para auth, `useState`/`useEffect` para el resto).
- **43 casos de uso del catálogo**: implementados hasta ahora — UC-01 a UC-20 (parcial, falta Dashboard), UC-36 a UC-43, y todo el CRUD de Categoría/Equipo/Prioridad/Usuario/Artículo. El ciclo de vida completo del Ticket (9 transiciones + cierre automático) está operable.
- **Infraestructura**: Docker Compose (app + Postgres), volúmenes con nombre para BD y adjuntos, `node-cron` para el cierre automático, `multer` para subida de archivos.

## Iteración 6 — Dashboard de Métricas (siguiente)

**Alcance:** UC-20 Ver Dashboard de Métricas, exclusivo de Supervisor.

**Lo que hay que construir** (Patrón 07 del Modelo de Análisis/Diseño, `docs/02-fase-elaboracion/modelo-analisis-diseno/patron-07-dashboard-metricas.md`):
- `ReportsController.obtenerMetricas(equipoId, desde, hasta)` — una única consulta agregada, sin mutación.
- Filtra `Ticket` por Categorías del Equipo del Supervisor + `fechaCreacion` dentro del rango de fechas elegido.
- KPIs: volumen de tickets, tiempos promedio, cumplimiento de SLA.
- **Tiempo de primera respuesta se deriva** del primer `Comentario` hecho por un Agente de Soporte en el ticket (no hay columna propia). Un ticket resuelto sin que el Agente haya comentado queda excluido de esa métrica específica.
- **Cumplimiento de SLA se calcula en vivo**, comparando `fechaResolucion - fechaCreacion` contra `SLA.tiempoResolucion` de la Prioridad confirmada del ticket — sin almacenar el resultado.
- Selector de rango de fechas (desde/hasta) filtrando por `fechaCreacion`, mismo criterio para todas las métricas del período.
- Es autocontenido: no navega a ninguna otra pantalla del catálogo (ver `docs/01-fase-inicio/diagramas-contexto.md`, diagrama de Supervisor).

**Criterio de cierre:** cumplimiento de SLA calculado en vivo y correcto sobre datos de prueba reales, acotado al Equipo del Supervisor, con el filtro de rango de fechas funcionando.

## Cierre de fase / hardening (después de la Iteración 6)

No es una iteración de casos de uso, es el checklist final antes de declarar IOCM:
- Regresión completa por rol (probar los 4 roles de punta a punta otra vez).
- Reconfirmar portabilidad real entre las 2 PCs del usuario (clon limpio + `docker compose up`).
- Revisar cobertura de pruebas automatizadas contra la estrategia fijada en la Iteración 0 (Vitest + Supertest; ⚠️ **nota**: hasta la Iteración 5 no se han escrito pruebas automatizadas todavía, solo verificación manual/API en cada cierre — esto es una desviación del plan original que vale la pena decidir explícitamente con el usuario antes de declarar IOCM: ¿se escriben ahora, retroactivas, o se documenta como decisión consciente de alcance?).
- Actualizar `docs/03-fase-construccion/README.md` con el estado final.
