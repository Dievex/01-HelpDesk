[HelpDesk](../README.md) / Auditoría — Fase de Inicio (2026-08-19, tercera revisión)

# Auditoría de la Fase de Inicio — tercera revisión

Auditoría independiente, realizada el 2026-08-19 sobre el estado actual del repositorio (`git log` confirma que todos los cambios de la revisión anterior ya están commiteados: `1dcac41`, `2777518`, `44e8f7c`, `dfd957d`, `d088c83`). No se ha leído ni tomado como base ningún documento previo de `audit/` — este análisis parte de una relectura completa de los artefactos fuente.

Alcance: mismo que las revisiones anteriores — todos los artefactos de `docs/01-fase-inicio/` y sus fuentes `.puml`, con `docs/02-fase-elaboracion/especificacion-casos-uso/tickets.md` (sin cambios desde la última revisión) como referencia de consistencia.

**Contexto:** las dos rondas de correcciones previas resolvieron, con buen criterio, prácticamente todo lo señalado anteriormente: `Comentario`/`Adjunto`/`Plazo de Reapertura` en el Glosario, `UC-42`/`UC-43` cerrando las clases huérfanas del dominio, IDs de riesgo permanentes, `R-10` (despliegue self-hosted) agregado y ahora sí referenciado en el Plan de Desarrollo, cardinalidades completas en `diagrama-clases.md`, cierre de `R-04` con un motivo que ya no se apoya en un ejemplo que no aplica, y las notas de herencia de `casos-de-uso.md` reescritas para no depender de rangos numéricos que se rompen al agregar un caso de uso. Esta revisión encuentra bastante menos que las anteriores — es lo esperable a la tercera pasada — y lo que queda es de severidad menor.

---

## Hallazgos

### 1. El `README.md` del Modelo de Dominio nunca incorporó la regla de cierre automático por Plazo de Reapertura

**Archivo:** `docs/01-fase-inicio/modelo-dominio/README.md`, sección "Reglas de negocio capturadas (para Casos de Uso)".

Esta sección es, por diseño, el catálogo centralizado de reglas de negocio que Elaboración deberá implementar al detallar flujos — hoy lista las reglas de notificación, las de visibilidad de `ArticuloConocimiento` y las de `Prioridad` por defecto. La regla de cierre automático (`Ticket` pasa de `Resuelto` a `Cerrado` solo si vence el **Plazo de Reapertura**) ya está completamente modelada en otros tres lugares — el atributo `Ticket.fechaLimiteReapertura`, el término de Glosario "Plazo de Reapertura", y la transición del Diagrama de Estados con su propia decisión de modelado — pero nunca se agregó a esta lista.

**Por qué importa:** es el único de los tres artefactos que documentan esa regla que quedó sin tocar en las dos rondas de correcciones anteriores, precisamente porque el propio README no fue de los archivos que esas correcciones revisaron. El riesgo concreto es que quien detalle `Confirmar Cierre de Ticket` (UC-07) en Elaboración mirando *solo* esta sección — que es exactamente su propósito, ser el resumen consultable — no se entere de que existe un camino de cierre disparado por el Sistema, no por el Solicitante, y lo omita del flujo.

---

### 2. La nueva referencia "ver el conteo vigente en Casos de Uso" no tiene ningún conteo publicado al que apuntar

**Archivo:** `docs/01-fase-inicio/plan-desarrollo-software.md` vs. `docs/01-fase-inicio/casos-de-uso.md`.

El Plan corrigió el número fijo que se desincronizaba ("33", "35"...) reemplazándolo por: *"total del catálogo menos estos 8 — ver el conteo vigente en Casos de Uso, para no volver a desincronizar este número"*. Es la solución correcta al problema de fondo. Pero `casos-de-uso.md` no publica en ningún lugar un total (algo tan simple como "43 casos de uso en total" al pie del catálogo) — para obtenerlo, el lector tiene que contar manualmente las filas de las 4 secciones de actor más las 4 subsecciones de Administrador.

**Por qué importa:** es un hallazgo menor porque ya no hay ningún número que pueda quedar mal — el objetivo principal (evitar la desincronización) está logrado. Pero la referencia cruzada, tal como queda, le pide al lector un trabajo manual que el propio catálogo podría ahorrarle con una línea. Vale la pena como pulido, no como corrección urgente.

---

### 3. Nomenclatura ligeramente distinta para el mismo concepto entre `diagrama-estados.md` y `diagrama-clases.md`

**Archivo:** `docs/01-fase-inicio/modelo-dominio/diagrama-estados.md` vs. `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md`.

`diagrama-clases.md` ya usa el término formal del Glosario: *"se dispara sola si se vence el **Plazo de Reapertura** (ver [Glosario](../glosario.md))"*. `diagrama-estados.md` —el documento donde nació originalmente esta regla— sigue diciendo *"se cierra solo al vencer `Ticket.fechaLimiteReapertura`... El plazo exacto lo define la Organización adoptante"*, sin usar ni enlazar el término formal.

**Por qué importa:** es una inconsistencia menor de redacción, no de contenido — ambos documentos describen la misma regla correctamente. Pero ahora que existe un término canónico en el Glosario específicamente para evitar esta clase de deriva terminológica, tiene sentido que los dos documentos que la mencionan lo usen igual, sobre todo en el que la originó.

---

### 4. Las correcciones de la segunda revisión no quedaron citadas en ningún lado, a diferencia de las de la primera

**Archivo:** `docs/01-fase-inicio/casos-de-uso.md`, decisión de modelado sobre `UC-42`/`UC-43`.

Esa nota cita explícitamente `audit/auditoria-fase-inicio.md` como origen de esos dos casos de uso. Ninguno de los cambios que claramente responden a la segunda auditoría (el motivo de cierre reescrito de `R-04`, las notas de herencia sin rangos fijos, `R-10` incorporado al Plan, el bloque de cardinalidades exhaustivo, el término "Plazo de Reapertura") lleva una cita equivalente.

**Por qué importa:** es el hallazgo más menor de los cuatro — casi un comentario de estilo. Pero en un proyecto que se distingue justamente por justificar y trazar cada decisión ("Decisiones de modelado y por qué" en cada documento), dejar sin trazabilidad el origen externo de media docena de cambios rompe un poco la consistencia de esa práctica, más notorio porque el propio proyecto ya demostró que sabe hacerlo (la cita a la primera auditoría).

---

## Aciertos que vale la pena destacar

- **El patrón de corrección elegido para los dos hallazgos de mayor impacto de la revisión anterior es, en sí mismo, el acierto más importante de esta ronda.** Tanto el conteo del catálogo en el Plan como los rangos de herencia en Casos de Uso dejaron de ser números/rangos escritos a mano y pasaron a ser referencias relativas ("total menos estos 8", "tabla de arriba, incluido UC-42"). No es solo corregir el valor de hoy — es eliminar la clase de error que produjo el hallazgo, así que no debería poder repetirse la próxima vez que se agregue un caso de uso. Es la respuesta correcta a un bug de sincronización, y no todos los equipos la eligen sobre el parche puntual.
- **El cierre de `R-04` ahora es honesto sobre lo que queda sin resolver** en vez de apoyarse en un ejemplo que no aplicaba — es preferible un riesgo cerrado con "esto sigue pendiente, se resolverá cuando toque" que uno cerrado con una justificación que no se sostiene.
- **La incorporación de `R-10` al Plan de Desarrollo fuera de la tabla de casos de uso** (como párrafo aparte, reconociendo que una decisión de arquitectura no encaja en una tabla pensada para casos de uso) es una buena solución a una tensión real entre la forma del documento y el contenido que necesitaba cargar — forzarlo dentro de la tabla hubiera sido peor que salirse de ella con una nota clara.
- **El bloque nuevo de cardinalidades en `diagrama-clases.md`** no solo llena el hueco que dejó la nota de "las cardinalidades quedan documentadas en prosa" — de paso explica por qué `AgenteSoporte–Ticket` es opcional pero deliberadamente no lleva línea punteada, cerrando una distinción (configuración vs. estado transitorio del flujo) que no estaba explícita antes y que evita que alguien "corrija" esa aparente inconsistencia en el futuro sin entender el criterio.
