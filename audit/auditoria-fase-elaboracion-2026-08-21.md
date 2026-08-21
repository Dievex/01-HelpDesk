[HelpDesk](../README.md) / Auditoría — Fase de Inicio y Fase de Elaboración (2026-08-21)

# Auditoría de la Fase de Inicio y la Fase de Elaboración — 2026-08-21

Auditoría independiente y exhaustiva, releída desde cero (no se ha asumido ningún hallazgo previo como cerrado sin volver a verificarlo contra el estado actual del repositorio). Se ha partido del historial de `audit/` — tres rondas sobre Fase de Inicio (`auditoria-fase-inicio.md`, `-2026-08-19.md`, `-2026-08-19-r3.md`) y dos sobre Inicio+Elaboración conjuntas (`auditoria-fase-elaboracion-2026-08-20.md` y su revisión `-r2.md`) — para no repetir hallazgos ya resueltos, pero cada uno de ellos se ha vuelto a comprobar contra el árbol de archivos actual, no solo contra lo que decía el informe anterior.

Desde la última ronda (`-r2.md`, 20 ago) hay tres commits relevantes: `7d8cf3b` (cierre formal de la Fase de Elaboración, hito LCAM), `aad5e9e` (alta del nuevo artefacto Diagramas de Contexto: `docs/01-fase-inicio/diagramas-contexto.md` + 4 diagramas de estados en PlantUML, uno por actor) y `816da44` (edición posterior de ese mismo artefacto, que retiró un bloque introductorio del documento — ver Hallazgo 2). El alcance cubierto es el pedido: los 10 documentos de `docs/01-fase-inicio/` (incluido el nuevo `diagramas-contexto.md`), los 52 documentos de `docs/02-fase-elaboracion/` (arquitectura, las 43 especificaciones de caso de uso y el Modelo de Análisis/Diseño), los 104 pares `.puml`/`.svg` bajo `puml/01-fase-inicio/` y `puml/02-fase-elaboracion/`, y el `README.md` raíz junto con `docs/README.md`.

No se cuestionan las convenciones deliberadas ya documentadas y justificadas por el propio proyecto (línea punteada no estándar para relaciones opcionales, `EventoAuditoria.tipoEvento` como texto libre en vez de enum, ausencia de "Editar Ticket", etc.) — esas ya se auditaron en rondas anteriores y siguen defendidas explícitamente en el texto.

---

## Categorías verificadas

1. **Enlaces relativos rotos** — se escaneó programáticamente cada enlace Markdown y cada `<img src>` de los 62 documentos bajo `docs/` contra el sistema de archivos real. **2 hallazgos** (ver Hallazgos 2 y 4 más abajo); el resto de los cientos de enlaces revisados resuelve correctamente, incluidos los dos que la ronda del 20-ago había corregido (`UC-21`→`UC-24`, `UC-34`→`UC-20`), que siguen sin regresión.
2. **Trazabilidad de riesgos** — los 8 riesgos del "Historial de riesgos cerrados" en `lista-riesgos.md` citan artefactos reales y verificables (`UC-13`, `UC-09`/`UC-10`, `UC-20`, `UC-01`, la Decisión de Arquitectura) o motivos de retiro explícitos y coherentes con el resto del proyecto. **Sin hallazgos.**
3. **Catálogo de 43 casos de uso** — confirmados 43 archivos `UC-*.md` sin huecos ni duplicados; las tablas de `casos-de-uso.md` (11+8+4+20=43), de `especificacion-casos-uso/README.md` por paquete y los cinco resúmenes narrativos de iteración de `plan-desarrollo-software.md` (8+7+7+19+2=43, contando UC-22 a 25 y UC-02 fuera de iteración formal) suman exactos entre sí. **Sin hallazgos.**
4. **Modelo de Dominio vs. especificaciones de casos de uso** — los 9 valores de `EventoAuditoria.tipoEvento` (Creación, Asignación, Reasignación, Resolución, Escalamiento, Cierre, Reapertura, Priorización, Vinculación) coinciden exactamente entre `diagrama-clases.md`, el Glosario y las especificaciones que los disparan. **Sin hallazgos** (confirma, sin regresión, lo ya corregido el 20-ago).
5. **Modelo de Análisis/Diseño, Decisión de Arquitectura y especificaciones** — nombres de tecnología (React + Vite, Node + Express, PostgreSQL + Prisma, JWT en cookie `httpOnly`, volumen Docker) citados de forma idéntica en `arquitectura.md` y los 7 patrones. **1 hallazgo** (ver Hallazgo 3, sobre una cifra de clases del dominio que no cuadra, no sobre nombres de tecnología).
6. **Cobertura de los 43 UC por los 7 patrones** — mapeo exacto 1 a 1 sin huecos ni solapamientos (2+9+3+3+2+23+1=43, verificado enumerando cada ID). **Sin hallazgos.**
7. **Trazabilidad Modelo de Dominio → Glosario** — las 14 clases del `diagrama-clases.puml` y las relaciones/atributos añadidos durante Elaboración (`autor` en `Adjunto` y `ArticuloConocimiento`, `Plazo de Reapertura`) tienen entrada en `glosario.md`. **Sin hallazgos.**
8. **Coherencia del cierre formal de fase (LCOM/LCAM)** — `README.md` raíz, `docs/01-fase-inicio/README.md`, `docs/02-fase-elaboracion/README.md` y la tabla de `plan-desarrollo-software.md` cuentan la misma historia (Inicio cerrada/LCOM, Elaboración cerrada/LCAM con el Modelo de Análisis/Diseño, Construcción no iniciada). **1 hallazgo** (ver Hallazgo 2, sobre una referencia cruzada que quedó colgando).
9. **Diagramas de Contexto (nuevo artefacto)** — se contrastó cada arista y self-loop de los 4 diagramas de estados contra el texto literal de las especificaciones que dicen modelar (login, Tomar/Asignar/Reasignar/Priorizar Ticket, los cinco "Eliminar" con y sin bloqueo, Crear X aterriza en detalle, herencia Solicitante→Agente→Supervisor y Solicitante→Administrador). Todo coincide **salvo un caso** (ver Hallazgo 1, el más importante de esta ronda).
10. **Castellano de España** — búsqueda de voseo y regionalismos (`vos`, `tenés`, `podés`, `ustedes`, `computadora`, `carro`, `celular`, `ahorita`, etc.) en los 62 documentos: cero coincidencias. **Sin hallazgos.**
11. **Integridad de pares `.puml`/`.svg`** — los 104 `.svg` del repositorio tienen `data-diagram-type` válido (ninguno es una página de error de renderizado); se confirmó además que el `.svg` del Administrador refleja fielmente el bug del Hallazgo 1 (no es un problema de renderizado obsoleto, el propio `.puml` ya lo tiene). **Sin hallazgos de integridad de renderizado.**
12. **Fechas y numeración citadas en prosa** — las fechas del Historial de Riesgos son coherentes con las fechas de commit reales (`git log`); los IDs de UC y de riesgo citados en prosa coinciden con los que definen sus propios documentos. **1 hallazgo** (ver Hallazgo 3, una cifra de clases incorrecta).

---

## Hallazgos (priorizados, más importante primero)

### 1. El diagrama de contexto del Administrador conserva el self-loop de "visibilidad denegada" de Artículo de Conocimiento, que el propio documento dice que no debería tener

**Archivos:** `puml/01-fase-inicio/diagramas-contexto/actor-administrador.puml` (líneas 41-42) y su `.svg` correspondiente; `docs/01-fase-inicio/diagramas-contexto.md` (línea 57); `docs/02-fase-elaboracion/especificacion-casos-uso/base-conocimiento/UC-09-ver-articulo-conocimiento.md` (línea 40); `docs/01-fase-inicio/modelo-dominio/README.md` (línea 30).

`diagramas-contexto.md` afirma explícitamente: *"Ver/Listar Artículo de Conocimiento pierde su self-loop de 'visibilidad denegada' al pasar de Solicitante a Agente de Soporte. El flujo alternativo de UC-09 que deniega el acceso a artículos Internos solo le ocurre a Solicitante; Agente ya ve Público e Interno, así que ese caso no aplica en su diagrama (**ni en los de Supervisor o Administrador**)."*

Sin embargo, `actor-administrador.puml` sí lo tiene:

```
ARTICULOS_CONOCIMIENTO_ABIERTO --> ARTICULO_CONOCIMIENTO_ABIERTO : abrirArticuloConocimiento()
ARTICULOS_CONOCIMIENTO_ABIERTO --> ARTICULOS_CONOCIMIENTO_ABIERTO : abrirArticuloConocimiento()
```

La segunda arista es exactamente el self-loop de denegación que, según el propio texto, "no aplica" al Administrador. Se confirmó que no es un problema de renderizado desactualizado: el `.svg` correspondiente contiene las mismas dos aristas que el `.puml` (`grep` sobre el `.svg` devuelve 2 apariciones de `abrirArticuloConocimiento()`, igual que en la fuente).

Esto contradice además dos fuentes independientes que son explícitas sobre el alcance del Administrador: `UC-09` dice *"Solicitante solo ve artículos Público; Agente de Soporte, Supervisor y Administrador ven Público e Interno, por ser personal técnico"*, y el Modelo de Dominio ya capturaba esto desde la Fase de Inicio (`modelo-dominio/README.md`, línea 30): *"Agente, Supervisor y Administrador pueden Ver/Listar todos los artículos (Público e Interno), por ser personal técnico."* Ninguna de las dos fuentes deja margen para que el Administrador vea la denegación de acceso a un `Interno` — el bug es del diagrama del Administrador, no de las especificaciones.

**Por qué importa:** es exactamente el tipo de error que el propio artefacto se propuso evitar (arrastrar un self-loop que ya no aplica al pasar a un actor con más privilegios) y que su propia prosa asegura al lector que se evitó. Un lector que confíe en la explicación del documento y no abra el `.puml` del Administrador se llevará una idea equivocada de que a este actor se le puede denegar el acceso a un `Interno`, cuando tanto el Modelo de Dominio como `UC-09`/`UC-10` dicen lo contrario desde la Fase de Inicio. Es, además, el único de los cuatro diagramas de contexto donde se encontró una discrepancia real tras contrastar cada arista con las especificaciones — el resto de las 40+ transiciones revisadas (login, Tomar/Asignar/Reasignar/Priorizar, los cinco "Eliminar" con y sin bloqueo, Crear X, la herencia entre Solicitante/Agente/Supervisor/Administrador) coinciden con el texto literal de sus casos de uso.

---

### 2. `docs/01-fase-inicio/README.md` promete una "nota en el documento" sobre el cierre post-fase que ya no existe

**Archivos:** `docs/01-fase-inicio/README.md` (línea 17); `docs/01-fase-inicio/diagramas-contexto.md` (estado actual, tras el commit `816da44`).

El índice de artefactos de la Fase de Inicio dice: *"[Diagramas de Contexto](diagramas-contexto.md) — añadido tras el cierre de la fase, **ver nota en el documento**"*.

Esa nota existía: el commit `aad5e9e` la añadió como una cita en bloque al inicio de `diagramas-contexto.md` — *"Artefacto añadido tras el cierre formal de la Fase de Inicio (hito LCOM), como refinamiento del Modelo de Casos de Uso ya cerrado."* — junto con dos párrafos explicando la convención de nombres de estados. El commit `816da44` ("Update diagrama de contexto quitando contenido irrelevante") eliminó ese bloque completo sin sustituirlo por nada equivalente. Lo único que queda en el documento sobre el tema es un bullet de alcance mucho más estrecho, en la sección de decisiones de modelado: *"Es una decisión de modelado de este artefacto, no algo que las especificaciones de Elaboración digan literalmente — no se editaron esos documentos para no reabrir una fase ya cerrada"* — que habla de una decisión puntual (los self-loops de cinco acciones sobre `Ticket`), no de que el artefacto completo se añadiera después del cierre de la fase.

**Por qué importa:** un lector que siga la instrucción explícita del README de Fase de Inicio ("ver nota en el documento") para entender por qué este artefacto rompe la regla general de no tocar una fase ya cerrada no encontrará esa explicación de forma directa — tendrá que inferirla de un bullet que en realidad está justificando otra cosa. Es una referencia cruzada que quedó colgando tras una edición posterior, el mismo tipo de problema (aunque de narrativa, no de enlace) que el resto de la categoría de cierre de fase.

---

### 3. Enlace relativo roto por profundidad de carpeta en `diagrama-clases.md` hacia un informe de auditoría

**Archivo:** `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md`, línea 33.

El texto dice: *"Este bloque se agregó tras la segunda auditoría externa (ver [`audit/auditoria-fase-inicio-2026-08-19.md`](../../audit/auditoria-fase-inicio-2026-08-19.md))"*.

`diagrama-clases.md` vive en `docs/01-fase-inicio/modelo-dominio/`, dos niveles bajo `docs/`. Para llegar a `audit/`, que está en la raíz del repositorio, hacen falta **tres** `../` (`modelo-dominio` → `01-fase-inicio` → `docs` → raíz), no dos: el enlace actual resuelve a `docs/audit/auditoria-fase-inicio-2026-08-19.md`, que no existe. Se confirmó programáticamente (script que resuelve cada enlace relativo contra el sistema de archivos) que es el único enlace roto de todo `docs/01-fase-inicio/` y `docs/02-fase-elaboracion/`, aparte del de docs/README.md (Hallazgo 4). El mismo documento sí usa correctamente `../casos-de-uso.md` (un nivel, hacia `docs/01-fase-inicio/`) y `../../02-fase-elaboracion/...` (dos niveles, hacia `docs/`) unas líneas antes — el error es específico del enlace a `audit/`, que necesita un nivel más porque esa carpeta cuelga de la raíz del repositorio, no de `docs/`.

**Por qué importa:** es el mismo patrón de bug de profundidad de carpeta que ya se había detectado y corregido en una ronda anterior (motivo por el que el enunciado de esta auditoría pedía prestarle atención especial) — aquí ha reaparecido en un enlace nuevo, añadido en la misma ronda que corrigió el problema anterior. Un lector que haga clic en la referencia desde GitHub o desde un visor de Markdown local recibe un 404 en vez de la auditoría citada.

---

### 4. `docs/README.md` enlaza a una fase que no existe todavía, con un backtick suelto en el texto del enlace

**Archivo:** `docs/README.md`, línea 15.

La tabla de fases dice: `| [04 · Transición\`](04-fase-transicion/README.md) | Despliegue |`. Dos problemas en la misma celda: (a) `docs/04-fase-transicion/README.md` no existe en el árbol del repositorio (a diferencia de `docs/03-fase-construccion/README.md`, que sí existe como stub con "Estado: no iniciada"); y (b) hay un backtick colgante mal cerrado inmediatamente después de "Transición" y antes del cierre del texto del enlace (`` `Transición\`] ``), que probablemente sea un resto de una edición previa.

**Por qué importa:** es un hallazgo menor — es coherente y esperable que la documentación de una fase que ni siquiera ha empezado (Construcción todavía no arrancó, y Transición ni siquiera tiene stub) no tenga todavía su README, y el propio `README.md` raíz ya avisa de que "Fase de Construcción aún no iniciada — no hay build ejecutable". Pero el enlace tal cual está redirige a un 404 real si alguien navega la documentación de fases desde esta tabla, y el backtick suelto es un defecto de formato que se renderiza literalmente en Markdown. Se resuelve fácilmente creando el mismo tipo de stub que ya existe para `03-fase-construccion/README.md`, o quitando el enlace hasta que exista el archivo.

---

### 5. "41+ clases del dominio" en la Decisión de Arquitectura no coincide con las clases reales del Modelo de Dominio

**Archivo:** `docs/02-fase-elaboracion/arquitectura.md`, líneas 22 y 36.

El documento dice dos veces: *"tipado de las consultas reduce errores al traducir las **41+ clases** del dominio a tablas"* (línea 22) y *"Con **41+ clases** de dominio y varias relaciones no triviales... TypeScript habría atrapado errores de forma más temprana"* (línea 36).

`puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml` define exactamente **14 clases**: `Usuario`, `AgenteSoporte`, `Supervisor`, `Administrador`, `Equipo`, `Ticket`, `Categoria`, `Prioridad`, `SLA`, `Comentario`, `Adjunto`, `EventoAuditoria`, `ArticuloConocimiento` y `Notificacion`. No hay ninguna lectura razonable del modelo (contando atributos, relaciones o roles) que se acerque a 41.

**Por qué importa:** es una cifra concreta y verificable, citada dos veces como justificación de una decisión de arquitectura real (por qué Prisma, por qué no TypeScript) — un lector que la tome al pie de la letra sobreestima por un factor de casi 3× la complejidad real del dominio que motiva esas decisiones. Es probable que sea una confusión con el total de 43 casos de uso (un número que sí aparece constantemente en el resto del proyecto) mal transcrito o mal recordado al escribir la Decisión de Arquitectura, pero tal como está, es información objetivamente incorrecta sobre un artefacto que sí existe y se puede contar.

---

## Aciertos que vale la pena destacar

- **Ninguna regresión en los 5 hallazgos de la ronda del 20 de agosto.** Se volvió a verificar cada uno contra el estado actual: los 9 tipos de `EventoAuditoria`, el Glosario con `autor` en `Adjunto`/`Artículo de Conocimiento`, el párrafo narrativo de la primera iteración con `UC-41` incluido, el título de `R-07` con los tres frentes, y los enlaces de `UC-21`/`UC-34` — todos siguen corregidos tal como los dejó el commit `c94b2a7`.
- **Los cuatro puntos que quedaron en "zona gris" tras la tercera revisión de Inicio (r3) están genuinamente resueltos**, no solo mencionados: `modelo-dominio/README.md` ya lista la regla de cierre automático por Plazo de Reapertura (línea 38-40); `casos-de-uso.md` publica el total "43 casos de uso" (línea 139) al que apunta la referencia relativa del Plan de Desarrollo; `diagrama-estados.md` ya usa el término formal **Plazo de Reapertura** (línea 21), igualado con `diagrama-clases.md`; y ambas correcciones de la r2 de Inicio quedan citadas con enlace a su auditoría de origen.
- **La cobertura semántica del nuevo artefacto Diagramas de Contexto es, salvo el Hallazgo 1, notablemente sólida.** Cada self-loop y cada transición revisada contra el texto literal de su caso de uso —incluidas las condiciones de carrera de `Tomar`/`Asignar Ticket` volviendo a la cola, la distinción entre `Eliminar Equipo` (sin bloqueo) y `Eliminar Categoría`/`Prioridad`/`Usuario` (con bloqueo, self-loop sobre el detalle) y la herencia compartida entre los cuatro diagramas— coincide exactamente con lo que dicen las 43 especificaciones, incluyendo casos donde el diagrama tuvo que interpretar una especificación que no menciona pantalla final de forma explícita.
