[HelpDesk](../README.md) / Fase de Transición

# Fase de Transición

Objetivo de la fase: llevar el producto a un estado usable/desplegable fuera del entorno de desarrollo — según fijó el [Plan de Desarrollo de Software](../01-fase-inicio/plan-desarrollo-software.md) de la Fase de Inicio. Cierra con el hito **Product Release Milestone (PRM)**.

**Estado: en curso — Iteración 1 cerrada.**

Punto de partida: la arquitectura de despliegue productivo (contenedor único, API + cliente estático) ya estaba decidida y construida desde Elaboración/Construcción (`Dockerfile`, target `prod`; `server/src/app.js` sirve `client/dist` cuando `NODE_ENV=production`). Lo que faltaba, y es el alcance de esta fase, es empaquetar ese despliegue para un tercero y documentarlo.

## Alcance acordado con el usuario

- Empaquetado de producción completo: `docker-compose.prod.yml`, `.env.prod.example`, checklist de hardening de secretos, y reverse proxy con HTTPS automático (Caddy) — para quien quiera exponer su instancia a internet, no solo a la red local.
- Manual de instalación self-hosted, para alguien que clona el repo sin haber tocado el proyecto antes.
- Validación end-to-end en modo producción real (no dev) sobre un clon limpio, antes de declarar PRM.

## Iteraciones

| # | Iteración | Estado |
|---|---|---|
| 1 | Empaquetado de producción (compose, env, hardening, reverse proxy) | ✅ Cerrada |
| 2 | Manual de instalación + validación end-to-end + cierre de fase (PRM) | ⏳ Pendiente |

## Artefactos

- [Decisiones Técnicas por Iteración](decisiones-tecnicas.md) — registro vivo, mismo criterio que en Construcción
- Manual de instalación self-hosted — se agrega en la Iteración 2
