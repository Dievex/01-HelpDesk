[HelpDesk](../README.md) / Auditoría — Fase de Inicio

# Auditoría de la Fase de Inicio

Auditoría externa de los artefactos de la Fase de Inicio (cerrada), con la Fase de Elaboración (`docs/02-fase-elaboracion/especificacion-casos-uso/tickets.md`) usada solo como referencia de consistencia. Fecha de auditoría: 2026-08-18. Alcance evaluado: `documento-vision.md`, `glosario.md`, `modelo-dominio/` (clases y estados), `casos-de-uso.md` (y sus `.puml`), `lista-riesgos.md`, `plan-desarrollo-software.md`, y los índices `docs/README.md` / `01-fase-inicio/README.md`.

No se cuestionan las convenciones deliberadas del proyecto (breadcrumbs en vez de metadatos, diagramas PlantUML embebidos, ausencia de "Historial de revisiones", decisiones de modelado inline).

---

## Hallazgos (priorizados, más importante primero)

### 1. `plan-desarrollo-software.md` justifica UC-13 con el riesgo equivocado (R-04 en vez de R-03)

**Archivo:** `docs/01-fase-inicio/plan-desarrollo-software.md`, tabla "Primera iteración de Elaboración", fila UC-13.

La tabla dice: *"UC-13 Escalar Ticket — Resuelve R-04 (complejidad de `Equipo`/`nivel`/escalamiento)"*. Pero en `lista-riesgos.md`, **R-04** es *"Cumplimiento de protección de datos personales depende de configuración de la Organización adoptante"* (categoría Legal). El riesgo que realmente describe la complejidad de `Equipo`/SLA/escalamiento/visibilidad es **R-03**, cuya mitigación dice textualmente *"Empezar Elaboración con un caso de uso que ejercite estas relaciones (`Escalar Ticket`)"*.

**Por qué importa:** el Plan de Desarrollo de Software es, por definición, el documento que debe justificar con trazabilidad exacta por qué se elige el primer lote de casos de uso a partir de la Lista de Riesgos — es el corazón argumental del documento que cierra la fase (LCOM). Un ID de riesgo incorrecto rompe esa trazabilidad: cualquiera que siga la referencia para entender "por qué Escalar Ticket" termina en un riesgo legal que no tiene nada que ver. Es una referencia cruzada rota, exactamente el tipo de error que una auditoría de consistencia debe atrapar.

---

### 2. El Plan de Desarrollo no incluye UC-41, aunque Elaboración ya lo está detallando junto con UC-03

**Archivos:** `docs/01-fase-inicio/plan-desarrollo-software.md` (tabla "Primera iteración") vs. `docs/02-fase-elaboracion/especificacion-casos-uso/tickets.md`.

`tickets.md` ya contiene la especificación completa de **UC-41 · Priorizar Ticket**, presentado como inseparable del flujo de UC-03 Crear Ticket (el propio UC-03 dice explícitamente: *"El Solicitante no elige la Prioridad — la fija el Supervisor en UC-41"*, y ambos casos de uso comparten el mismo documento). Sin embargo, la tabla "Primera iteración de Elaboración" en `plan-desarrollo-software.md` solo lista UC-01, UC-03, UC-11/UC-12, UC-13, UC-14 y UC-21 — **UC-41 no aparece**.

**Por qué importa:** el Plan de Desarrollo de Software es, en teoría, el documento que define el alcance de la iteración 1. La realidad de Elaboración ya lo desborda: se está trabajando un caso de uso que el Plan nunca declaró. Esto no es un problema grave de fondo (UC-41 surgió, según la propia nota en `casos-de-uso.md`, al detallar UC-03 — es una consecuencia natural y bien documentada), pero el Plan, al ser el artefacto de cierre de Inicio, debería actualizarse para reflejar el alcance real de la iteración que dice gobernar, o al menos llevar una nota equivalente a la que sí tienen `casos-de-uso.md` y `lista-riesgos.md` (su "Historial de riesgos cerrados"). Hoy el Plan queda desalineado con el trabajo que efectivamente se está haciendo bajo su paraguas.

---

### 3. `Comentario` y `Adjunto` violan la regla de trazabilidad del propio Modelo de Dominio

**Archivos:** `docs/01-fase-inicio/modelo-dominio/README.md` (regla) vs. `docs/01-fase-inicio/glosario.md` y `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml` (clases).

El README del Modelo de Dominio establece explícitamente: *"Cada clase de este modelo debe poder trazarse a un término del Glosario."* Sin embargo, dos clases del diagrama —`Comentario` (con atributos `texto`, `fecha`) y `Adjunto` (con atributo `nombreArchivo`)— **no tienen entrada en `glosario.md`**. Todas las demás clases sí la tienen (Usuario, AgenteSoporte→"Agente de Soporte", Ticket, Categoría, Prioridad, SLA, EventoAuditoria→"Auditoría", ArticuloConocimiento→"Artículo de Conocimiento", Notificación, Equipo, Administrador).

**Por qué importa:** es una violación directa y verificable de una regla que el propio documento se impone. Además, `Comentario` y `Adjunto` son justo las dos clases con vida propia más limitada (composición de `Ticket`), lo que sugiere que se trataron como "obvias" y se saltaron el glosario — pero el objetivo del glosario es fijar vocabulario único para todo el equipo, y ninguna clase debería quedar exenta de esa regla por parecer autoevidente.

---

### 4. `Adjunto` (y el vínculo Ticket↔ArticuloConocimiento) son huérfanos frente al Modelo de Casos de Uso

**Archivos:** `docs/01-fase-inicio/casos-de-uso.md` vs. `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml`.

El Documento de Visión (4.2) promete explícitamente *"adjuntar evidencia"* como característica que soporta "Reportar problemas fácilmente", y el Modelo de Dominio modela `Adjunto` como composición de `Ticket`. Pero en el catálogo de 41 casos de uso **no existe ningún caso de uso que cree, vea o elimine un adjunto** — ni siquiera como parte implícita de otro (a diferencia de `Comentario`, que sí tiene su propio UC-06 "Comentar Ticket"). Lo mismo ocurre con la relación `Ticket --> ArticuloConocimiento : se resuelve con`: el Glosario y la Visión mencionan artículos "vinculables a tickets", pero ningún caso de uso del catálogo (ni "Resolver Ticket" UC-12, cuyo objetivo es solo "Marcar un ticket como resuelto") cubre el acto de vincular un artículo a un ticket.

**Por qué importa:** son relaciones y una clase completa del dominio que hoy nadie ejercita desde el Modelo de Casos de Uso. Si el propio Modelo de Dominio pone tanto cuidado en evitar clases huérfanas (ver la justificación explícita de por qué `Escalamiento` NO es una clase), la misma vara debería aplicarse a nivel de casos de uso: una clase sin ningún caso de uso que la cree o consulte es tan huérfana como una clase sin relaciones.

---

### 5. El diagrama de clases no tiene multiplicidades, pero la prosa que lo acompaña asume cardinalidades específicas

**Archivos:** `puml/01-fase-inicio/modelo-dominio/diagrama-clases.puml` vs. `docs/01-fase-inicio/modelo-dominio/diagrama-clases.md` y `docs/01-fase-inicio/casos-de-uso.md`.

Ninguna asociación del `.puml` lleva anotación de multiplicidad (no hay `0..1`, `1`, `*` en ningún lado). Sin embargo, la sección "Decisiones de modelado" del propio diagrama afirma con precisión: *"La pertenencia a `Equipo` es opcional (`0..1`) tanto para `AgenteSoporte` como para `Categoria`"*, y `casos-de-uso.md` afirma que `SLA` no tiene CRUD propio porque *"no existe independiente de una `Prioridad` (relación 1 a 1 en el Modelo de Dominio)"* — una cardinalidad que tampoco está en el diagrama.

**Por qué importa:** en un diagrama de clases UML, la multiplicidad es información estructural, no un detalle cosmético — es lo que distingue "un agente puede o no tener equipo" de "un agente siempre tiene exactamente un equipo". Hoy esa información solo vive en texto disperso en dos documentos distintos, lo cual es frágil: si el `.puml` cambia, nada obliga a que el texto siga siendo cierto, y viceversa. Vale la pena anotar las multiplicidades directamente en el `.puml` para que el diagrama sea la fuente única de verdad que las decisiones inline solo explican, no reemplazan.

---

### 6. La regla de "vencimiento del plazo de reapertura" no está respaldada en ningún otro artefacto

**Archivo:** `puml/01-fase-inicio/modelo-dominio/diagrama-estados.puml`, transición `Resuelto --> Cerrado : Solicitante confirma o vence el plazo de reapertura`.

Esta transición introduce una regla de negocio real (cierre automático por vencimiento de un plazo) que no aparece en ningún otro lugar: no está en el Glosario, no hay un atributo en `Ticket` que la respalde (no hay `fechaLimiteReapertura` ni similar en `diagrama-clases.puml`), y el Documento de Visión no menciona una política de "plazo de reapertura" en ninguna de sus secciones (ni en Features, ni en Rangos de calidad).

**Por qué importa:** es una transición disparada por el sistema (no por un actor), lo que ya la hace arquitectónicamente distinta de las demás (todas las otras transiciones las dispara explícitamente un actor humano) — y sin embargo no se le dio el mismo tratamiento que a otras decisiones de modelado (no hay una entrada en "Decisiones de modelado" que explique de dónde sale el plazo, quién lo configura, ni qué lo dispara). Para una fase que se jacta de justificar cada decisión, esta transición queda como la única sin trazabilidad hacia atrás ni un dato que la sostenga.

---

### 7. Inconsistencia numérica en `plan-desarrollo-software.md`: "6 casos de uso" / "35 restantes"

**Archivo:** `docs/01-fase-inicio/plan-desarrollo-software.md`, tabla "Primera iteración de Elaboración" y párrafo siguiente.

La tabla lista 6 filas, pero una de ellas ("UC-11 Tomar Ticket / UC-12 Resolver Ticket") agrupa **dos** IDs de caso de uso distintos. Es decir, la iteración 1 cubre **7** casos de uso (UC-01, 03, 11, 12, 13, 14, 21), no 6. El párrafo siguiente dice *"Se considera cerrada cuando estos 6 casos de uso tengan..."* y *"El resto del catálogo (35 casos de uso) se detalla en iteraciones posteriores"* — con 41 casos de uso totales en el catálogo (UC-01 a UC-41) y 7 cubiertos en la iteración 1, el resto correcto es 34, no 35.

**Por qué importa:** es un error menor pero concreto — el tipo de detalle que un revisor de calidad de un Plan de Desarrollo debería atrapar antes de cerrar la fase, porque el criterio de éxito de la iteración ("cerrada cuando estos 6 casos de uso...") literalmente cuenta mal cuántos casos de uso hay que cerrar.

---

### 8. La Lista de Riesgos no incluye ningún riesgo sobre el despliegue self-hosted

**Archivos:** `docs/01-fase-inicio/lista-riesgos.md` vs. `docs/01-fase-inicio/documento-vision.md` (secciones 1.3, 4.3, 6).

El Documento de Visión declara el modelo self-hosted como diferenciador central del producto ("a diferencia de... suites empresariales... sin atar a la organización a un proveedor SaaS") y una restricción dura (sección 6: *"desplegable de forma autónoma por la organización adoptante... sin dependencia de servicios propietarios de terceros"*), y en la sección 4.3 admite explícitamente que la infraestructura de despliegue "se resuelve en la fase de Elaboración" — es decir, es un hueco reconocido y todavía abierto. Pese a eso, la Lista de Riesgos no tiene ninguna entrada sobre empaquetado, requisitos de infraestructura mínima, o complejidad de instalación por parte de organizaciones adoptantes con perfiles técnicos muy distintos.

**Por qué importa:** es exactamente el tipo de incertidumbre que una Lista de Riesgos al cierre de Inicio debería capturar — es un unknown central y explícitamente diferido, no un detalle menor. Su ausencia es más notable porque la Lista sí es rigurosa en otros frentes (R-01 autenticación, R-03 complejidad del dominio); el hueco no es por descuido general sino que parece que el ángulo "self-hosted" específicamente no se revisó.

---

### 9. El ID "R-01" se reutiliza para dos riesgos completamente distintos

**Archivo:** `docs/01-fase-inicio/lista-riesgos.md`, tabla activa vs. "Historial de riesgos cerrados".

El histórico registra que el R-01 original — *"Alcance del MVP demasiado ambicioso"* — se cerró el 2026-08-18. La tabla de riesgos activos vigente también tiene un **R-01**, pero es un riesgo totalmente distinto: *"El mecanismo de autenticación no está definido"*.

**Por qué importa:** reutilizar un ID de riesgo ya cerrado rompe la trazabilidad histórica — cualquier referencia futura a "R-01" (en commits, PRs, u otros documentos) se vuelve ambigua sin mirar la fecha. La práctica estándar de gestión de riesgos es no reciclar IDs: un riesgo cerrado retiene su ID permanentemente, y el siguiente riesgo nuevo toma el próximo número libre (en este caso, hubiera sido R-05).

---

### 10. La Visión separa "Agente de Soporte N1" y "N2/N3" como filas de usuario distintas; el resto de los artefactos los tratan como un único actor

**Archivo:** `docs/01-fase-inicio/documento-vision.md`, sección 3.2, vs. `glosario.md`, `modelo-dominio/diagrama-clases.md` y `casos-de-uso.md`.

La tabla de usuarios de la Visión (3.2) lista *"Agente de Soporte N1"* y *"Agente de Soporte N2/N3"* como dos filas separadas, cada una con su propia descripción. Todos los artefactos posteriores son explícitos y consistentes en el sentido contrario: es **un solo actor/clase** (`AgenteSoporte`), diferenciado únicamente por el atributo `nivel` — la decisión está justificada tanto en el diagrama de clases como en `casos-de-uso.md` ("No se separan actores 'Agente N1' y 'Agente N2/N3'... el nivel solo determina el destino de un escalamiento").

**Por qué importa:** no es una contradicción grave — es razonable que la Visión, al describir necesidades de negocio, hable de "primera línea" y "soporte especializado" como perfiles distintos sin que eso implique dos actores de sistema. Pero como está escrito hoy, un lector que solo lea la Visión se lleva la impresión de dos roles separados, y el documento nunca aclara que esa distinción se resuelve más adelante como un simple atributo. Una nota de una línea en 3.2 (algo como "en el modelo de casos de uso, N1/N2/N3 es un atributo de un mismo actor, no actores separados") cerraría el hueco.

---

### 11. La Visión promete "edición" de tickets; no existe un caso de uso "Editar Ticket"

**Archivo:** `docs/01-fase-inicio/documento-vision.md`, sección 5 ("Gestión de tickets: alta, **edición**, cambio de estado, cierre") vs. `docs/01-fase-inicio/casos-de-uso.md`.

El catálogo cubre creación (UC-03), consulta (UC-04/05/14), comentarios (UC-06), y las transiciones de estado (UC-07, 08, 11, 12, 13, 18, 19, 41) — pero no hay ningún caso de uso para editar los campos propios de un ticket ya creado (título, descripción, categoría) fuera de un cambio de estado.

**Por qué importa:** puede ser una omisión real o una decisión implícita de que un ticket, una vez creado, no se edita (solo se comenta o cambia de estado) — lo cual sería razonable dado que auditoría/trazabilidad es un requisito fuerte del producto (sección 7 de la Visión) y permitir edición libre de título/descripción complicaría esa trazabilidad. Si es una decisión deliberada, vale la pena que quede explícita (como se hizo con "Se eliminó 'Atender Ticket'" en las decisiones de modelado); si no lo es, es un caso de uso que falta.

---

### 12. No hay un caso de uso explícito para consultar el historial de auditoría de un ticket

**Archivo:** `docs/01-fase-inicio/documento-vision.md`, sección 3.4 ("Auditar quién hizo qué sobre un ticket") y sección 5 ("Historial/auditoría") vs. `docs/01-fase-inicio/casos-de-uso.md`.

`EventoAuditoria` existe como clase de dominio y la Visión lista explícitamente la necesidad de auditar tickets (rol Supervisor, prioridad Media), pero ningún caso de uso del catálogo se llama ni referencia "Ver Historial" o "Ver Auditoría". Es asumible que quede implícito dentro de "Ver Ticket" (UC-04), igual que los comentarios — pero a diferencia de los comentarios, la Visión sí lo eleva a necesidad de negocio explícita con su propia fila en la tabla 3.4, lo que sugiere que merecería, cuando menos, una mención explícita de que va dentro de UC-04.

**Por qué importa:** es un hueco menor comparado con los anteriores, pero encaja en el mismo patrón: una necesidad nombrada explícitamente en la Visión que no tiene un punto de anclaje declarado en el Modelo de Casos de Uso.

---

## Aciertos que vale la pena destacar

- **Disciplina de fase muy bien respetada.** El Modelo de Dominio se abstiene explícita y consistentemente de métodos, visibilidad y patrones de diseño; los Casos de Uso se quedan en nombre+objetivo sin flujos. Es infrecuente ver ese límite tan bien sostenido en un ejercicio de aprendizaje — la tentación de "adelantar trabajo" es fuerte y aquí se resiste.
- **Generalización de actores bien planteada y consistentemente aplicada** (`Solicitante ← Agente de Soporte ← Supervisor`, `Solicitante ← Administrador`), con justificación explícita de por qué se evitó duplicar casos de uso, y aplicada de igual forma en el diagrama de clases (`Usuario ← AgenteSoporte ← Supervisor`).
- **Convención de nombres impecable**: "Ver" vs. "Listar" aplicada sin excepciones en las 41 filas del catálogo, y el criterio explícito de evitar verbos paraguas ("Gestionar", "Atender") se sostiene en la práctica — no hay un solo nombre de caso de uso ambiguo en todo el catálogo.
- **Las "Decisiones de modelado y por qué" son, en general, el punto más fuerte del conjunto.** Justificar por qué `Escalamiento` o `Estado` no son clases, por qué `Equipo` no necesita relación de supervisión aparte, o por qué `Asignar`/`Reasignar Ticket` son casos de uso distintos, es exactamente el tipo de razonamiento que evita over-engineering — y está mejor documentado que en muchos proyectos RUP reales.
- **La Lista de Riesgos está genuinamente conectada con el Plan de Desarrollo** (más allá del error puntual de ID en el hallazgo #1): la lógica de "priorizar por exposición y usar los riesgos para elegir qué se detalla primero en Elaboración" es metodológicamente correcta y se ejecuta de verdad, no es solo una frase de relleno.
- **El manejo de `UC-41`** (agregado fuera de secuencia al final del catálogo, con nota explicando por qué no se renumeró) es una buena forma de mantener un artefacto "vivo" sin romper referencias ya publicadas — el problema no es cómo se agregó UC-41, sino que el Plan de Desarrollo no se actualizó en consecuencia (hallazgo #2).
