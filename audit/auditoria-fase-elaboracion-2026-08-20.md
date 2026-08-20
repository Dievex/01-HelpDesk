[HelpDesk](../README.md) / Auditoría — Fase de Inicio + Fase de Elaboración (2026-08-20)

# Auditoría de la Fase de Inicio y la Fase de Elaboración

Auditoría independiente, realizada el 2026-08-20. Es la primera auditoría de este directorio que cubre el alcance completo de Elaboración además de Inicio: los 43 casos de uso detallados en `docs/02-fase-elaboracion/especificacion-casos-uso/` y el Modelo de Análisis/Diseño en `docs/02-fase-elaboracion/modelo-analisis-diseno/`, en contraste con las tres auditorías anteriores (`auditoria-fase-inicio.md`, `auditoria-fase-inicio-2026-08-19.md`, `auditoria-fase-inicio-2026-08-19-r3.md`), centradas solo en los artefactos de Inicio.

Se verificaron ocho categorías: enlaces relativos rotos entre todos los documentos y sus `.puml`/`.svg`; trazabilidad de riesgos entre `plan-desarrollo-software.md` y `lista-riesgos.md`; conteo y consistencia del catálogo de 43 casos de uso en todos los README de paquete; consistencia entre el Modelo de Dominio y las especificaciones de casos de uso; consistencia entre el Modelo de Análisis/Diseño y la Decisión de Arquitectura; cobertura de los 43 casos de uso por los 7 patrones de flujo; trazabilidad de clases y relaciones al Glosario; y numeración/fechas citadas en prosa.

Cuatro de esas ocho categorías no arrojaron ningún hallazgo: los enlaces relativos (incluida la corrección ya aplicada en los 7 archivos `modelo-analisis-diseno/patron-XX.md`, que no dejó ningún `../` de más ni de menos, y sin casos análogos en el resto del repositorio), el conteo del catálogo de 43 UC en las tablas de los 8 README de paquete (suman exactamente 43, sin duplicados ni huecos, con el estado "Completo" coherente con que los 43 archivos existen), la consistencia de nombres de tecnología entre `arquitectura.md` y los 7 patrones del Modelo de Análisis/Diseño (JWT en cookie `httpOnly`, PostgreSQL+Prisma, volumen de Docker para adjuntos — todos citados igual en ambos lados), y la cobertura de los 43 casos de uso por los 7 patrones (cada UC aparece en la tabla de `modelo-analisis-diseno/README.md` mapeado a exactamente un patrón, sin huecos ni solapamientos).

---

## Hallazgos

### 1. Ocho tipos de `EventoAuditoria` usados en las especificaciones de casos de uso no están reflejados ni en el Modelo de Dominio ni en el Glosario

**Archivos:** `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml`, `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md`, `docs/01-fase-inicio/glosario.md`, `docs/01-fase-inicio/plan-desarrollo-software.md`.

El `.puml` modela `EventoAuditoria.tipoEvento` como un atributo de texto libre, sin enumerar valores. `diagrama-clases.md` documenta explícitamente un único valor como decisión de modelado: *"Escalamiento no tiene clase propia. Se representa como un `EventoAuditoria` de tipo 'Escalamiento'..."*. Pero las especificaciones de casos de uso usan, además, otros ocho valores que ningún artefacto del Modelo de Dominio ni el Glosario documenta: "Creación" (UC-03), "Cierre" (UC-07), "Reapertura" (UC-08), "Asignación" (UC-11, UC-18), "Resolución" (UC-12), "Reasignación" (UC-19), "Priorización" (UC-41) y "Vinculación" (UC-43).

El caso más concreto es "Reasignación": `plan-desarrollo-software.md`, al cerrar la tercera iteración (línea 75), es explícito sobre que se trata de una decisión de diseño real, no un detalle menor: *"UC-19 Reasignar Ticket introduce un tipo de `EventoAuditoria` nuevo, 'Reasignación', distinto de 'Asignación' (que UC-18 reutiliza de UC-11) — porque reasignar no cambia el `estado` del `Ticket`, solo su `AgenteSoporte`."* Esa misma frase es, en esencia, del mismo tipo que la nota que sí se agregó a `diagrama-clases.md` para "Escalamiento" — pero nunca se trasladó allí. Tampoco ninguno de los ocho valores tiene entrada en `glosario.md`, pese a que la entrada "Auditoría (Evento de Auditoría)" define el concepto general (*"Registro inmutable de un cambio ocurrido sobre un ticket: autor, fecha y tipo de cambio"*) sin listar qué tipos de cambio existen.

**Por qué importa:** el propio Modelo de Dominio se impone la disciplina de documentar cada tipo de `EventoAuditoria` como decisión de modelado — lo demuestra con "Escalamiento" — pero esa disciplina no se aplicó al resto. Un lector que llegue a `diagrama-clases.md` buscando qué valores puede tomar `tipoEvento` (información que necesitaría, por ejemplo, para implementar validación o un filtro en el Dashboard) encontrará solo uno de nueve valores reales en uso, con el riesgo añadido de que "Reasignación" y "Asignación" son fácilmente confundibles y su distinción — ya resuelta y documentada en el Plan — queda invisible para quien no lea las 43 especificaciones de UC una por una.

---

### 2. El Glosario no se actualizó cuando `diagrama-clases.md` documentó nuevas relaciones `autor` agregadas durante Elaboración

**Archivos:** `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md` (líneas 30 y 33) vs. `docs/01-fase-inicio/glosario.md` (líneas 9 y 12).

`diagrama-clases.md` documenta dos gaps del Modelo de Dominio cerrados durante Elaboración: *"`Adjunto` ganó `fecha` y una relación `autor` hacia `Usuario`, que le faltaban. Descubierto al detallar UC-42..."* y *"`ArticuloConocimiento` ganó una relación `autor` hacia `Usuario`, que le faltaba. Descubierto al detallar UC-15..."*. En ambos casos se aclara que la relación no es opcional: todo adjunto y todo artículo tiene autor.

Sin embargo, las entradas correspondientes en `glosario.md` no se actualizaron: "Adjunto" sigue definido como *"Archivo adjunto a un ticket como evidencia (captura de pantalla, registro, documento)"*, y "Artículo de Conocimiento" como *"Documento reutilizable que describe la solución a un problema común, vinculable a uno o varios tickets. Tiene una visibilidad: Público... o Interno..."* — ninguna de las dos menciona autoría.

**Por qué importa:** el propio `diagrama-clases.md` (línea 34) demuestra que el mecanismo de sincronización con el Glosario existe y se aplica cuando corresponde — describe cómo se fijó una entrada de Glosario para "Plazo de Reapertura" tras una auditoría anterior precisamente para evitar esta clase de deriva. Que el mismo cuidado no se haya aplicado a estas dos relaciones `autor`, agregadas en el mismo documento y por el mismo proceso (gaps descubiertos al detallar casos de uso), dejan el Glosario desactualizado frente al Modelo de Dominio vigente, justo la inconsistencia que la regla de trazabilidad del propio proyecto (*"Cada clase de este modelo debe poder trazarse a un término del Glosario"*) busca prevenir.

---

### 3. El resumen narrativo de la primera iteración en `especificacion-casos-uso/README.md` omite UC-41

**Archivo:** `docs/02-fase-elaboracion/especificacion-casos-uso/README.md`, línea 22, vs. `docs/01-fase-inicio/plan-desarrollo-software.md`, línea 36.

El párrafo narrativo dice: *"La primera iteración de Elaboración priorizó UC-01, UC-03, UC-11 a UC-14 y UC-21."* — siete casos de uso. Pero `plan-desarrollo-software.md` fija el criterio de éxito de esa misma iteración de forma explícita: *"Se considera cerrada cuando estos 8 casos de uso (UC-01, 03, 11, 12, 13, 14, 21, 41) tengan..."* — ocho, incluyendo UC-41 Priorizar Ticket.

UC-41 sí está bien contado en la tabla superior del propio `especificacion-casos-uso/README.md` (fila "Tickets", que lista "UC-03 a UC-08, UC-11 a UC-14, UC-18, UC-19, UC-41, UC-42"), así que no hay un problema de conteo total — el catálogo sigue sumando 43. El párrafo narrativo, sin embargo, es el único de los cinco resúmenes de iteración (primera a quinta) en todo el documento que deja un caso de uso sin asignar a ninguna iteración: repasando el resto del párrafo, UC-41 no aparece mencionado en ninguna otra iteración tampoco.

**Por qué importa:** este párrafo es, para un lector de Elaboración, el resumen consultable de qué se hizo en cada iteración — el mismo rol que cumple, en la Fase de Inicio, la sección de reglas de negocio del README del Modelo de Dominio (señalada en una auditoría anterior como el "resumen consultable" que debía mantenerse sincronizado). Alguien que llegue a UC-41 dentro del árbol de `tickets/` y luego intente ubicar en qué iteración se detalló, usando este resumen como referencia, no lo encontrará en ninguna — a pesar de que el propio Plan de Desarrollo lo trata como parte central del criterio de cierre de la primera iteración, incluso con una explicación de por qué se agrupó con UC-03 ("Surgió al detallar UC-03: sin él, todo ticket queda con Prioridad `Baja` sin revisar").

---

### 4. El título registrado de R-07 no reconoce el alcance de tres frentes que le atribuyen el Plan y su propio motivo de cierre

**Archivos:** `docs/01-fase-inicio/lista-riesgos.md`, línea 18, vs. `docs/01-fase-inicio/plan-desarrollo-software.md`, líneas 25 y 48.

El Historial de riesgos cerrados titula R-07 como: *"Complejidad del modelo de dominio (`SLA`) subestimada para el Modelo de Diseño"*. Pero el Plan, al justificar por qué UC-13 Escalar Ticket entra en la primera iteración, describe ese mismo riesgo como: *"Resuelve R-07 (complejidad de `Equipo`/`nivel`/escalamiento)"* — sin mencionar SLA. Más adelante, al justificar la segunda iteración (UC-09/UC-10), lo describe de nuevo en otros términos: *"Es la parte de R-07 que la primera iteración dejó sin validar: la regla de visibilidad (Público/Interno) de `ArticuloConocimiento`"*. El propio motivo de cierre de la fila de R-07 en `lista-riesgos.md` termina reconociendo los tres frentes: *"escalamiento y visibilidad ya se habían validado... El último punto pendiente, el cálculo de cumplimiento de SLA, se resolvió..."*.

**Por qué importa:** es una inconsistencia menor porque el contenido narrado de R-07 es coherente consigo mismo a lo largo del Plan y coincide con el motivo de cierre — el problema es solo la etiqueta corta de la tabla del Historial, que es lo primero (y a veces lo único) que un lector ve al buscar "R-07" por ID. Esa etiqueta solo menciona SLA, y alguien que llegue a ella sin leer el motivo completo no sabría que R-07 cubrió también la complejidad de `Equipo`/escalamiento y la visibilidad de `ArticuloConocimiento` — precisamente las dos partes que, según el propio Plan, se resolvieron primero.

---

### 5. Dos enlaces cuyo texto anuncia un caso de uso distinto al que apunta el `href`

**Archivos:** `docs/02-fase-elaboracion/especificacion-casos-uso/categoria/UC-21-crear-categoria.md`, línea 44; `docs/02-fase-elaboracion/especificacion-casos-uso/prioridad/UC-34-editar-prioridad.md`, línea 44.

En UC-21: *"Una `Categoria` creada así no aparecerá en ninguna cola hasta que se le asigne un Equipo vía [UC-24 Editar Categoría](../../../01-fase-inicio/casos-de-uso.md)"* — el enlace resuelve a `docs/01-fase-inicio/casos-de-uso.md` (el catálogo general de Inicio), no al archivo `UC-24-editar-categoria.md` que el texto del enlace anuncia y que existe en la misma carpeta `categoria/`.

En UC-34: *"el nuevo `SLA` solo aplica hacia adelante, para el cálculo de cumplimiento que hará [UC-20 Ver Dashboard de Métricas](../reportes/README.md)"* — el enlace resuelve al índice `reportes/README.md`, no al archivo `UC-20-ver-dashboard-metricas.md` que el texto anuncia.

**Por qué importa:** en ambos casos el destino existe (no son enlaces rotos en sentido estricto), por lo que un verificador automático de enlaces no los detectaría. Pero el texto promete una cosa y entrega otra: un lector que haga clic esperando llegar a la especificación de UC-24 o UC-20 aterriza en un documento distinto (un catálogo general o un índice de paquete) sin la información específica que el texto del enlace le hizo esperar, lo que rompe la navegabilidad cruzada que el resto del proyecto mantiene con cuidado.

---

## Aciertos que vale la pena destacar

- **La corrección de los `../` de más en los 7 archivos `modelo-analisis-diseno/patron-XX.md`** (señalada en auditorías previas) está completa y correcta, y no dejó ningún caso análogo sin corregir en el resto del repositorio — se revisaron sistemáticamente todos los niveles de profundidad de carpeta usados en `docs/` y `puml/`.
- **La cobertura de los 43 casos de uso por los 7 patrones del Modelo de Análisis/Diseño es exacta**, sin huecos ni solapamientos sin explicar — un resultado nada trivial para un mapeo manual de 43 elementos.
- **Los nombres de tecnología y mecanismos (JWT en cookie `httpOnly`, PostgreSQL+Prisma, volumen de Docker) se citan de forma idéntica** entre `arquitectura.md` y los 7 patrones, sin ninguna deriva terminológica — el tipo de inconsistencia que suele aparecer cuando una decisión de arquitectura se referencia desde múltiples documentos escritos en momentos distintos.
