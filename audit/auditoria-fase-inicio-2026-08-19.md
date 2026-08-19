[HelpDesk](../README.md) / Auditoría — Fase de Inicio (2026-08-19)

# Auditoría de la Fase de Inicio — segunda revisión

Auditoría independiente de los artefactos de la Fase de Inicio (cerrada), realizada el 2026-08-19 directamente sobre el estado actual del árbol de trabajo (que incluye cambios aún sin commitear respecto al último commit registrado en git). No se ha leído ni tomado como base ningún documento previo de la carpeta `audit/` — este análisis parte de cero, directamente de los artefactos fuente.

Alcance evaluado: `documento-vision.md`, `glosario.md`, `modelo-dominio/` (clases y estados), `casos-de-uso.md` (y sus `.puml`), `lista-riesgos.md`, `plan-desarrollo-software.md`, y los índices `docs/README.md` / `01-fase-inicio/README.md`, con `docs/02-fase-elaboracion/especificacion-casos-uso/tickets.md` como referencia de consistencia. No se cuestionan las convenciones deliberadas del proyecto (breadcrumbs, diagramas PlantUML embebidos, ausencia de "Historial de revisiones", decisiones de modelado inline).

**Nota de contexto:** el estado actual de estos artefactos ya incorpora correcciones sustanciales — glosario ampliado, dos casos de uso nuevos (UC-42, UC-43), riesgo R-10 agregado, referencias cruzadas corregidas, IDs de riesgo hechos permanentes, nota de reconciliación Visión/Actores, atributo `fechaLimiteReapertura`, etc. Son cambios sólidos y bien justificados. Esta revisión se enfoca en lo que sigue sin resolver y, especialmente, en inconsistencias nuevas que esas mismas correcciones introdujeron al no propagarse a todos los lugares que dependían del valor anterior.

---

## Hallazgos (priorizados, más importante primero)

### 1. La aritmética de "resto del catálogo" en el Plan de Desarrollo vuelve a estar mal — ahora por no contar UC-42 y UC-43

**Archivo:** `docs/01-fase-inicio/plan-desarrollo-software.md`, párrafo bajo la tabla "Primera iteración de Elaboración".

El catálogo de casos de uso (`casos-de-uso.md`) tiene hoy **43** casos de uso distintos: UC-01 a UC-41 (41) más UC-42 "Adjuntar Archivo a Ticket" y UC-43 "Vincular Artículo de Conocimiento a Ticket" (ambos agregados en esta misma ronda de cambios). La primera iteración cubre **8** (UC-01, 03, 11, 12, 13, 14, 21, 41 — el propio documento lo cuenta bien en "Criterio de éxito"). El resto debería ser **35**, pero el párrafo dice *"El resto del catálogo (33 casos de uso)... no hace falta re-descubrir el flujo básico de un CRUD 33 veces"*.

**Por qué importa:** 33 = 41 − 8, es decir, la cuenta se hizo sobre el catálogo *antes* de agregar UC-42 y UC-43, y no se actualizó al agregarlos — en el mismo conjunto de cambios que sí actualizó correctamente "6 casos de uso" → "8 casos de uso" un par de líneas más abajo. Es la reaparición exacta del mismo tipo de error aritmético que ya existía antes (entonces era "35" cuando debía ser "34"; ahora es "33" cuando debe ser "35"), lo que sugiere que este número se escribe a mano en vez de derivarse, y que nada lo revisa cuando cambia el tamaño del catálogo. Vale la pena describirlo como una resta ("43 − 8") en vez de un número fijo, precisamente para que no vuelva a desincronizarse la próxima vez que se agregue un caso de uso.

---

### 2. Las notas de herencia en `casos-de-uso.md` no se actualizaron al agregar UC-42 y UC-43

**Archivo:** `docs/01-fase-inicio/casos-de-uso.md`, notas en cursiva al inicio de las secciones "Agente de Soporte", "Supervisor" y "Administrador del Sistema".

Las tres secciones siguen diciendo *"Hereda todo lo de Solicitante (UC-01 a UC-10)"* (Agente, Administrador) y *"Hereda todo lo de Agente de Soporte (UC-11 a UC-17)"* (Supervisor). Pero la tabla de Solicitante ahora también incluye **UC-42** (fuera del rango "01 a 10"), y la de Agente incluye **UC-43** (fuera del rango "11 a 17"). Como Agente y Supervisor heredan de Solicitante, y Supervisor también de Agente, ambos deberían heredar UC-42; y Supervisor debería heredar también UC-43 — pero el texto que describe qué se hereda no lo menciona en ningún lado.

**Por qué importa:** es exactamente el mismo patrón que el hallazgo anterior — un valor derivado (aquí, un rango de IDs usado como atajo para "todo lo de este actor") que dejó de ser cierto en cuanto se agregó un caso de uso fuera de rango, y nadie lo propagó a los tres lugares que lo citan. Un lector que solo mire las notas de herencia (que es justamente su propósito: evitar tener que mirar la tabla completa) concluye que Agente y Supervisor no pueden adjuntar archivos a sus propios tickets ni tomar los que crean ellos mismos como Solicitantes — que es falso.

---

### 3. El cierre de R-04 en el Historial de Riesgos no está respaldado por el ejemplo que cita

**Archivo:** `docs/01-fase-inicio/lista-riesgos.md`, tabla "Historial de riesgos cerrados", fila R-04.

R-04 — *"Reglas de negocio aún abiertas (pausa de SLA, gestión de miembros de Equipo) quedan sin cerrar hasta Construcción"* — se cierra con el motivo: *"Se resuelven al detallar los casos de uso que las tocan, como ya viene ocurriendo (p. ej. `Priorizar Ticket` en la primera iteración de Elaboración)"*. Pero `Priorizar Ticket` (UC-41) trata de confirmar la Prioridad de un ticket — no toca ni la pausa del SLA en estados de espera ni la gestión de miembros de un Equipo. Además, ninguno de los dos temas está realmente cubierto por la iteración 1 actual: no existe un estado "En espera" en el Diagrama de Estados al que aplicar una pausa de SLA, y la gestión de miembros de Equipo vive en `Editar Usuario` (UC-39), que no forma parte de la primera iteración.

**Por qué importa:** cerrar un riesgo con un ejemplo que no lo resuelve rompe la credibilidad de todo el Historial — el valor del Historial de Riesgos es justamente poder confiar en que "cerrado" significa "ya no es un problema", no "se escribió una justificación que suena bien". Si de verdad la intención es no tratar esto como riesgo aparte (una postura defendible, similar a R-05), el motivo debería decirlo directamente en vez de apoyarse en un ejemplo que no aplica.

---

### 4. R-10 (despliegue self-hosted) promete resolverse "en la primera iteración", pero el Plan de Desarrollo no lo menciona

**Archivos:** `docs/01-fase-inicio/lista-riesgos.md` (R-10) vs. `docs/01-fase-inicio/plan-desarrollo-software.md`.

R-10 es el riesgo de mayor exposición de toda la lista (Alta) y su mitigación dice explícitamente: *"Evaluar containerización (Docker) desde la decisión de arquitectura en la primera iteración de Elaboración, no dejarlo para Transición"*. Sin embargo, la tabla "Primera iteración de Elaboración" del Plan — que es donde R-03 y R-07 sí obtienen una fila explícita que los conecta a un caso de uso concreto — no tiene ninguna entrada para R-10. No hay caso de uso, ni una línea aparte para "decisión de arquitectura de despliegue", que lo represente.

**Por qué importa:** es comprensible que R-10 no encaje en la tabla "Caso de uso → por qué entra" porque su mitigación es una decisión de arquitectura, no un caso de uso — pero eso es justamente la señal de que el Plan necesita, aunque sea, una línea fuera de esa tabla reconociendo que la primera iteración también debe producir esa decisión. Tal como está, el riesgo de mayor exposición de la lista es el único que el documento que se supone gobierna la iteración 1 no menciona en absoluto.

---

### 5. La nueva nota sobre multiplicidades en `diagrama-clases.md` promete algo que no cumple del todo

**Archivo:** `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md`, nota "Convención de este diagrama" vs. sección "Decisiones de modelado".

La nota agregada dice: *"Las cardinalidades exactas de cada relación, incluidas las que no son opcionales, quedan documentadas en prosa más abajo."* Pero la relación `Prioridad → SLA`, cuya cardinalidad 1 a 1 sí se afirma explícitamente en otro documento (`casos-de-uso.md`: *"No existe independiente de una `Prioridad` (relación 1 a 1 en el Modelo de Dominio)"*), no aparece mencionada en ninguna de las "Decisiones de modelado" de `diagrama-clases.md`. Tampoco se documentan las cardinalidades de `Ticket → Categoria`, `Ticket → Prioridad`, `AgenteSoporte → Ticket`, ni `Ticket → ArticuloConocimiento`.

**Por qué importa:** la nota se agregó, según todo indica, para responder a la falta de multiplicidades en el `.puml` — pero al prometer que la prosa cubre "cada relación... incluidas las que no son opcionales" establece una expectativa que el documento no cumple todavía. O se completa la prosa para las relaciones que faltan, o se acota la promesa a lo que realmente hay (las dos relaciones opcionales marcadas con línea punteada).

---

### 6. El "plazo de reapertura" tiene tres nombres distintos y ningún término canónico en el Glosario

**Archivos:** `puml/01-fase-inicio/modelo-dominio/diagrama-estados.puml` ("vence el plazo de reapertura"), `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml` (atributo `fechaLimiteReapertura`), `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md` ("los días de gracia que defina la Organización adoptante").

El mismo concepto de negocio —un plazo tras el cual un ticket `Resuelto` se cierra solo si el Solicitante no responde— aparece nombrado de tres maneras distintas en tres archivos distintos, y no tiene entrada propia en el Glosario (a diferencia de `Escalamiento`, que sí es una regla de negocio con su propia entrada aunque tampoco sea una clase).

**Por qué importa:** es un hallazgo menor, pero llamativo porque contrasta con el nivel de cuidado terminológico que el resto del proyecto sí mantiene (el Glosario existe explícitamente para evitar este tipo de deriva). Dado que esta regla ya se identificó como lo bastante importante como para respaldarla con un atributo nuevo (`fechaLimiteReapertura`), una entrada de Glosario de una línea (algo como "Plazo de Reapertura: período tras el cual un Ticket `Resuelto` se cierra automáticamente si el Solicitante no lo confirma ni lo reabre") cerraría el hueco y fijaría el nombre único a usar en Elaboración.

---

### 7. La notación de línea punteada para "opcional" es una desviación reconocida del estándar UML, cuando ya existe la forma estándar de decir lo mismo

**Archivo:** `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml` y `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md`.

El diagrama ahora usa `..>` (dependencia, en UML estándar) para marcar visualmente las dos relaciones opcionales (`AgenteSoporte`–`Equipo`, `Categoria`–`Equipo`), y el propio texto lo reconoce: *"esto es una simplificación deliberada nuestra, no la notación UML estándar"*. La notación estándar para expresar "0..1" ya existe (una etiqueta de multiplicidad junto a la línea de asociación) y no requiere inventar un significado nuevo para un tipo de línea que en UML ya significa otra cosa (dependencia).

**Por qué importa:** es una decisión defendible por legibilidad y está documentada con honestidad (algo que vale la pena reconocer), pero es la única concesión de todo el conjunto de diagramas que se aparta conscientemente del estándar en vez de usar la herramienta que UML ya provee para el mismo problema. Anotar solo esas dos multiplicidades como texto (`0..1`) junto a la línea, sin tocar el resto del diagrama, habría resuelto lo mismo sin reutilizar una notación que ya tiene otro significado.

---

## Aciertos que vale la pena destacar

- **Los cambios recientes son correcciones reales, no parches cosméticos.** Cada uno viene acompañado de una "Decisión de modelado" propia que explica el porqué (por ejemplo, `UC-42`/`UC-43` documentan explícitamente qué clase huérfana del dominio resuelven y por qué quedan bajo el actor que quedan) — se mantiene la disciplina del proyecto de justificar todo inline en vez de solo corregir el dato.
- **Los IDs de riesgo ahora son permanentes por diseño**, con una nota explícita que anticipa y explica los huecos de numeración en la tabla activa — resuelve de raíz el problema de reutilización de IDs sin necesidad de renumerar nada en el futuro.
- **La nota de reconciliación agregada a la Visión (3.2) sobre "Agente de Soporte N1/N2/N3"** es exactamente el tipo de puente que hacía falta entre el lenguaje de negocio de la Visión y el modelo formal de actores — una frase, bien puesta, cierra una ambigüedad real.
- **La decisión de no tener "Editar Ticket"** ahora está explícita y justificada por trazabilidad/auditoría, y esa misma justificación se propagó correctamente a la Visión (sección 5, con la nota aclaratoria) — es un buen ejemplo de una decisión que sí se sincronizó en los dos documentos que la mencionan, al contrario de los hallazgos 1 y 2 de esta revisión.
- **`R-10` en sí (contenido del riesgo) es una adición sólida** — identifica correctamente que el despliegue self-hosted es un diferenciador central y a la vez un unknown técnico real, con una mitigación concreta y accionable (evaluar Docker en la primera iteración). El único problema es que el Plan de Desarrollo no lo recoge todavía (hallazgo 4), no el riesgo en sí.
