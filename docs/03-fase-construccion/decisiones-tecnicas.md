[HelpDesk](../README.md) / [Fase de Construcción](README.md)

# Decisiones Técnicas por Iteración

Registro de las decisiones de implementación tomadas en cada iteración de Construcción, con su motivo — mismo criterio que las iteraciones de Elaboración en el [Plan de Desarrollo de Software](../01-fase-inicio/plan-desarrollo-software.md), pero como artefacto propio de esta fase. El código lleva como mucho un comentario corto señalando que la decisión está aquí; el razonamiento completo vive en este documento, no en el código.

## Iteración 0 — Entorno y esqueleto

- **Jerarquía de rol (`Usuario ← AgenteSoporte ← Supervisor`, `Usuario ← Administrador`) resuelta como tabla única `Usuario`** con enum `rol` y campos nullable `nivel`/`equipoId`, en vez de una tabla por subtipo. Evita repartir las FK de `Ticket.solicitanteId`/`agenteId` entre varias tablas para un caso de uso que siempre trata "quien reporta" y "quien atiende" como el mismo concepto.
- **IDs como UUID**, no autoincrementales — portabilidad entre entornos (2 PCs) sin depender de secuencias que puedan desincronizarse.
- **`SLA.tiempoPrimeraRespuesta`/`tiempoResolucion` en minutos.** El Modelo de Dominio no fijaba la unidad; se decide aquí.
- **`Notificacion.leida` (booleano) añadido sin equivalente en el Modelo de Dominio.** Necesario para la decisión de Iteración 3 de entregar `Notificacion` como lista in-app.
- **Modo de desarrollo: todo dentro de Docker**, con bind-mount de código para hot-reload — decidido con el usuario para no depender de tener Node nativo con la misma versión en las 2 PCs.
- **Estructura de carpetas por vertical slice** (`server/src/modules/<controller>/`), no por capa técnica — 1 carpeta = 1 de los 8 Controllers que ya define el Modelo de Análisis/Diseño.
- **npm workspaces** (`client`, `server`) con un único `package-lock.json` — un solo `npm install` al cambiar de PC.
- **La base de datos se trata como reproducible, nunca se porta el volumen de datos a mano**: migraciones Prisma + `prisma/seed.js` en git, volúmenes de Docker con nombre (no bind-mounts a rutas del host).
- **Prisma 7 evaluado y descartado.** Elimina `datasource.url` en el schema (exige `prisma.config.ts` + adapters), incompatible con "JavaScript, no TypeScript" de la [Decisión de Arquitectura](../02-fase-elaboracion/arquitectura.md). Se mantiene Prisma 5.x.
- **Vite, Vitest y react-router-dom actualizados a su última major** (nada dependía aún de las APIs viejas) — 0 vulnerabilidades en `npm audit`.

**Bugs de infraestructura encontrados y resueltos:**
- Faltaba `.dockerignore` — el contexto de build incluía `node_modules` y `.git` (257MB).
- Prisma necesita OpenSSL, que Alpine no trae por defecto (`apk add openssl`).
- El `postinstall: prisma generate` necesita `prisma/schema.prisma` copiado *antes* del `npm ci` en la imagen, si no el layer de dependencias no lo encuentra.
- El stage `prod` no puede regenerar el cliente Prisma (la CLI es `devDependency`, omitida con `--omit=dev`) — copia el cliente ya generado desde el stage `build`.

**Cierre:** `docker compose up --build` probado desde cero (`down -v` + rebuild) simulando un checkout limpio en la segunda PC — migración y seed funcionando, target `prod` también construido y probado end-to-end.

## Iteración 1 — Acceso y Sesión + Usuario

- **El Administrador fija la contraseña inicial directamente** al crear un Usuario — no hay flujo de recuperación por correo (self-hosted, sin SMTP decidido en la Decisión de Arquitectura).
- **JWT con payload mínimo `{sub, rol}`**, cookie `httpOnly`/`sameSite=lax`/`secure` solo en producción, expira a las 8h. Limitación conocida (ya en el Patrón 01 de Elaboración): sin revocación server-side — si el rol de un Usuario cambia, sus sesiones activas conservan el rol viejo hasta volver a iniciar sesión.
- **`equipoId` de Usuario no se expone todavía** (ni en el formulario ni en la API) — `Equipo` no tiene CRUD hasta la Iteración 2.
- **UC-40 Eliminar Usuario: la validación de bloqueo por tickets asociados está escrita y activa**, pero no se puede demostrar todavía porque `Ticket` no tiene datos reales hasta la Iteración 3.
- **Confirmación de borrado con `window.confirm()` nativo**, no un modal propio — simplificación deliberada de esta iteración.
- **UC-37 Ver Usuario se implementó como el mismo formulario de edición, precargado** — no una pantalla de solo lectura aparte, mismo criterio que el resto del CRUD de configuración (Patrón 06: "EntityForm sirve para Crear y Editar").

**Bugs de infraestructura encontrados y resueltos:**
- `node --watch` no detecta cambios de forma fiable a través del bind-mount de Docker en Windows — cambiado a `nodemon --legacy-watch` (polling) en el server, y `usePolling: true` en Vite para el cliente.
- El volumen con nombre de `node_modules` no se refresca solo al reconstruir la imagen tras añadir una dependencia nueva — hay que borrarlo a mano (`docker volume rm 01-helpdesk_app-node-modules`) cuando pase. Documentado también como comentario corto en `docker-compose.yml`.

**Cierre:** probado en navegador real (no solo por API): login con el admin seedeado y con un usuario recién creado, guardia de rol en frontend y backend, CRUD completo de Usuario (crear con campo "Nivel" condicional, ver/editar precargado, eliminar con confirmación).
