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
- **Pruebas automatizadas del backend** (`docker compose exec app npm run test --workspace=server`): usan una base de datos propia (`helpdesk_test`, misma instancia de Postgres) que se crea y migra sola en el primer run — no requiere pasos manuales. Ver "Cierre de fase" más abajo y Iteración 6/hardening en `decisiones-tecnicas.md`.

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
| 6 | Dashboard de Métricas | ✅ Cerrada |
| — | Cierre de fase / hardening (IOCM) | ⏳ **Siguiente** |

### Resumen de lo ya construido (iteraciones 0 a 6)

- **Backend**: `server/src/modules/{auth,usuarios,categorias,equipos,prioridades,tickets,articulos,reports}` — Express + Prisma, JWT en cookie httpOnly, 8 Controllers según el Modelo de Análisis/Diseño.
- **Frontend**: `client/src/pages/{usuarios,categorias,equipos,prioridades,tickets,articulos}` — React + Vite + react-router-dom, sin Redux ni librería de estado (Context API para auth, `useState`/`useEffect` para el resto).
- **44 casos de uso del catálogo**: UC-01 a UC-20 (completo, incluye Dashboard), UC-36 a UC-43, y todo el CRUD de Categoría/Equipo/Prioridad/Usuario/Artículo. El ciclo de vida completo del Ticket (9 transiciones + cierre automático) está operable.
- **Infraestructura**: Docker Compose (app + Postgres), volúmenes con nombre para BD y adjuntos, `node-cron` para el cierre automático, `multer` para subida de archivos.
- **Módulo `reports`** (`server/src/modules/reports/`, `client/src/pages/reportes/`): único módulo puramente de lectura/cálculo, sin modelo propio — ver Iteración 6 en `decisiones-tecnicas.md`.

## Cierre de fase / hardening (siguiente)

No es una iteración de casos de uso, es el checklist final antes de declarar IOCM:
- Regresión completa por rol (probar los 4 roles de punta a punta otra vez).
- Reconfirmar portabilidad real entre las 2 PCs del usuario (clon limpio + `docker compose up`).
- [x] **Pruebas automatizadas del backend escritas retroactivas** (Vitest + Supertest, según la estrategia fijada en la Iteración 0) — 46 tests / 8 archivos en `server/tests/`, cubriendo las reglas de negocio ya verificadas manualmente en cada cierre de iteración (guards de condición de carrera, control de acceso por rol/equipo, cascadas de borrado, cálculo del Dashboard). Ver detalle en `decisiones-tecnicas.md`. Pendiente, fuera de alcance de esta pasada: tests de frontend (React Testing Library, ya está en `client/package.json` pero sin usar).
- Actualizar `docs/03-fase-construccion/README.md` con el estado final.
