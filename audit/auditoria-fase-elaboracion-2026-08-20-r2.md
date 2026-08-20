[HelpDesk](../README.md) / Auditoría — Fase de Inicio + Fase de Elaboración (2026-08-20, segunda revisión)

# Auditoría de la Fase de Inicio y la Fase de Elaboración — segunda revisión

Auditoría independiente, realizada el 2026-08-20 sobre el estado actual del repositorio, tras el commit `c94b2a7` ("Fix hallazgos de la auditoria de Fase de Inicio + Fase de Elaboracion"), que aplicó las cinco correcciones señaladas en [`audit/auditoria-fase-elaboracion-2026-08-20.md`](auditoria-fase-elaboracion-2026-08-20.md).

Alcance: mismo que la revisión anterior. Esta segunda revisión se centró en (a) verificar cada uno de los cinco hallazgos anteriores contra el diff real del commit de corrección, y (b) comprobar que la corrección no dejó rastros contradictorios en otros documentos que mencionan los mismos conceptos (`R-07`, los tipos de `EventoAuditoria`, la primera iteración) fuera de los seis archivos tocados.

---

## Resultado: los cinco hallazgos están resueltos, sin regresiones

### 1. Tipos de `EventoAuditoria` — resuelto

`docs/01-fase-inicio/modelo-dominio/diagrama-clases.md` incorpora una nueva decisión de modelado que enumera los nueve valores en uso de `tipoEvento`, cada uno enlazado al caso de uso que lo dispara (Creación → UC-03, Asignación → UC-11/UC-18, Resolución → UC-12, Escalamiento → nota ya existente, Cierre → UC-07, Reapertura → UC-08, Priorización → UC-41, Reasignación → UC-19, Vinculación → UC-43). Se verificó por búsqueda exhaustiva en las 43 especificaciones de caso de uso que estos nueve son, efectivamente, los únicos valores de `tipoEvento` usados en todo el catálogo — la lista es completa, no quedó ningún décimo valor sin documentar.

### 2. Glosario desactualizado — resuelto

"Adjunto" y "Artículo de Conocimiento" ahora mencionan la autoría (*"con el Usuario que lo subió y la fecha"*, *"con el Usuario autor que lo escribió"*). "Auditoría (Evento de Auditoría)" ahora lista los nueve tipos y además incorpora la opcionalidad del autor (*"autor (opcional, puede ser el propio Sistema)"*), un detalle que ni siquiera se había pedido explícitamente pero que también estaba documentado en `diagrama-clases.md` y no en el Glosario — buena corrección adicional, coherente con el espíritu del hallazgo original.

### 3. UC-41 omitido en `especificacion-casos-uso/README.md` — resuelto

El párrafo narrativo ahora dice *"...UC-01, UC-03, UC-11 a UC-14, UC-21 y UC-41"*, coincidiendo con los ocho casos de uso del criterio de éxito de la primera iteración en `plan-desarrollo-software.md`.

### 4. Título de R-07 — resuelto

El título en `lista-riesgos.md` pasó de mencionar solo `SLA` a *"Complejidad del modelo de dominio (`Equipo`/escalamiento, visibilidad de `ArticuloConocimiento`, `SLA`) subestimada..."*, reconociendo los tres frentes. Se revisaron todas las demás menciones de `R-07` en el repositorio (`plan-desarrollo-software.md`, `patron-07-dashboard-metricas.md`, `UC-09-ver-articulo-conocimiento.md`, `UC-20-ver-dashboard-metricas.md`) y ninguna contradice el nuevo título — todas narran alguno de los tres frentes ya reconocidos.

### 5. Enlaces UC-21 / UC-34 — resuelto

Ambos enlaces resuelven ahora a los archivos que su texto anuncia: `UC-24-editar-categoria.md` (misma carpeta que UC-21) y `UC-20-ver-dashboard-metricas.md` (carpeta `reportes/`, un nivel arriba desde `prioridad/`). Se confirmó que ambos archivos existen en esas rutas exactas.

---

## Hallazgos nuevos

Ninguno. No se detectó ningún caso análogo introducido por la propia corrección, ni ninguna categoría de las ocho auditadas en la primera revisión que hubiera quedado afectada colateralmente.

## Aciertos que vale la pena destacar

- **La nota nueva sobre `EventoAuditoria.tipoEvento` en `diagrama-clases.md` es honesta sobre la limitación del modelo** ("es texto libre en el `.puml` (sin enum), pero en uso son nueve valores fijos") en vez de fingir que el `.puml` ya lo enumeraba — es preferible documentar la brecha entre el diagrama y el uso real a maquillarla.
- **La corrección del Glosario fue más allá de lo estrictamente señalado**, incorporando también la opcionalidad del autor de `EventoAuditoria` — un detalle que ya estaba documentado en `diagrama-clases.md` desde antes y que el hallazgo original no pedía explícitamente, pero que es exactamente el tipo de deriva que ese mismo hallazgo advertía.
