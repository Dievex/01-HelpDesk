[HelpDesk](../README.md) / Fase de Construcción

# Fase de Construcción

Objetivo de la fase: completar la implementación funcional del producto, desarrollando y probando el resto de casos de uso sobre la arquitectura baseline fijada en Elaboración. Cierra con el hito **Initial Operational Capability Milestone (IOCM)**.

**Estado: cerrada — hito Initial Operational Capability Milestone (IOCM) alcanzado.** Las 7 iteraciones planificadas están cerradas (Iteración 0 · Entorno y esqueleto, 1 · Acceso y Sesión + Usuario, 2 · Categoría/Equipo/Prioridad+SLA, 3 · Ticket flujo mínimo viable, 4 · Ticket resto del ciclo de vida, 5 · Contenido de Ticket + Base de Conocimiento, 6 · Dashboard de Métricas), y el checklist de cierre de fase también:

- ✅ Regresión completa por rol (Administrador, Supervisor, Agente, Solicitante) probada de punta a punta en navegador real sobre el entorno de desarrollo acumulado.
- ✅ Portabilidad confirmada con un clon limpio del repositorio: `docker compose up`, migraciones, seed, y la suite de pruebas automatizadas corren sin ningún paso manual oculto.
- ✅ 46 pruebas automatizadas de backend (Vitest + Supertest, `server/tests/`) cubriendo las reglas de negocio no obvias de las 6 iteraciones — escritas retroactivas, decisión tomada explícitamente con el usuario al cierre de la Iteración 6 en vez de darlas por cubiertas solo con la verificación manual. Pendiente, fuera de alcance: pruebas de frontend.

El catálogo completo de 44 casos de uso (UC-01 a UC-43) está implementado y operable.

## Artefactos

- [Roadmap de Iteraciones — estado y continuación](roadmap-iteraciones.md) — mapa rápido de qué está cerrado y qué falta, pensado para retomar el trabajo en una sesión nueva
- [Decisiones Técnicas por Iteración](decisiones-tecnicas.md) — registro vivo, se actualiza al cerrar cada iteración
