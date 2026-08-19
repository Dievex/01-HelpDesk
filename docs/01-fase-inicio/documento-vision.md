[HelpDesk](../README.md) / [Fase de Inicio](README.md)

# Documento de Visión

---

## 1. Introducción

### 1.1 Propósito
Este documento recoge, valida y traza las necesidades y características de HelpDesk. Sirve de acuerdo entre los interesados sobre el problema a resolver y el alcance de la solución, y es el criterio contra el que se evalúa el éxito del producto.

### 1.2 Alcance
Aplica al producto HelpDesk como sistema de gestión de tickets de soporte: creación, seguimiento, asignación, resolución y medición de cumplimiento de SLA. No cubre monitoreo de infraestructura, gestión de activos (asset management) ni CRM — aunque el producto pueda integrarse con herramientas de ese tipo a futuro.

### 1.3 Modelo de despliegue
HelpDesk es un producto **self-hosted**: cada organización que lo adopta despliega y opera su propia instancia, con sus propios datos, usuarios y configuración.

---

## 2. Posicionamiento

### 2.1 Planteamiento del problema

| | |
|---|---|
| **El problema de** | la falta de un canal único y trazable para reportar y resolver solicitudes de soporte |
| **afecta a** | equipos de soporte (IT u otros) y a las personas que dependen de ellos dentro de una organización |
| **el impacto de lo cual es** | solicitudes perdidas o duplicadas, tiempos de resolución sin control, cero visibilidad de carga de trabajo del equipo de soporte, y ausencia de datos históricos para tomar decisiones |
| **una solución exitosa sería** | un sistema centralizado de tickets con seguimiento de estado, asignación, priorización, SLA y reportes, accesible tanto para quien reporta como para quien resuelve |

### 2.2 Planteamiento de posición del producto

| | |
|---|---|
| **Para** | equipos de soporte y las organizaciones que los emplean |
| **Quienes** | necesitan gestionar solicitudes de soporte de forma ordenada y medible |
| **El** | producto HelpDesk |
| **Es** | una aplicación web de gestión de mesa de ayuda, autoalojada (self-hosted) |
| **Que** | centraliza la creación, asignación, priorización y resolución de tickets, con métricas de cumplimiento de SLA |
| **A diferencia de** | canales ad-hoc (correo, chat, teléfono) o suites empresariales sobredimensionadas para equipos pequeños/medianos |
| **Nuestro producto** | provee trazabilidad completa, responsables claros, tiempos medibles y una base de conocimiento reutilizable, sin atar a la organización a un proveedor SaaS |

---

## 3. Descripción de los interesados y usuarios

### 3.1 Resumen de interesados (stakeholders)

| Nombre | Descripción | Responsabilidad |
|---|---|---|
| Product Owner | Dirige la visión y prioridades del producto | Aprobar alcance, prioridades y cada hito de fase |
| Organización adoptante | Empresa u organización que instala y opera una instancia | Define sus propias reglas de escalado, SLA y categorías dentro del producto |

### 3.2 Resumen de usuarios (roles dentro de una instancia)

| Nombre | Descripción | Representa a |
|---|---|---|
| Solicitante | Cualquier persona que reporta una incidencia o solicitud a través del sistema | Usuarios finales de la organización adoptante |
| Agente de Soporte N1 | Primera línea: triage, resolución de solicitudes simples, escalado | Equipo de soporte |
| Agente de Soporte N2/N3 | Resuelve solicitudes escaladas de mayor complejidad | Equipo de soporte especializado |
| Supervisor de Mesa de Ayuda | Supervisa carga de trabajo, reasigna tickets, revisa métricas y SLA | Jefatura del equipo de soporte |
| Administrador del Sistema | Configura categorías, SLA, usuarios y permisos de la instancia | TI de la organización adoptante |

> "Agente de Soporte N1" y "N2/N3" se describen aquí como dos perfiles de negocio porque tienen necesidades distintas, pero en el Modelo de Casos de Uso se resuelven como un único actor (`Agente de Soporte`), diferenciado solo por un atributo de nivel — no como actores de sistema separados.

### 3.3 Entorno de usuario
Acceso vía navegador web estándar, sin cliente de escritorio. La instancia corre en la infraestructura que decida la organización adoptante (on-premise o cloud propio); ese detalle de despliegue se resuelve en la fase de Elaboración.

### 3.4 Necesidades clave de los interesados/usuarios

| Necesidad | Prioridad | Rol | Solución actual (mercado) | Solución propuesta |
|---|---|---|---|---|
| Reportar una incidencia sin depender de un canal informal | Alta | Solicitante | Correo/chat/teléfono | Formulario web de creación de ticket |
| Saber en qué estado está mi solicitud | Alta | Solicitante | Ninguna / hay que preguntar | Seguimiento de estado en tiempo real |
| Priorizar y distribuir la carga de tickets | Alta | Agente / Supervisor | Criterio informal | Cola con prioridad, categoría y asignación |
| Medir tiempos de respuesta y resolución | Alta | Supervisor | Herramientas externas o nada | Reportes de SLA y KPIs |
| Reutilizar soluciones a problemas frecuentes | Media | Agente | Conocimiento tácito | Base de conocimiento con artículos |
| Escalar un caso que no se puede resolver en primer nivel | Alta | Agente N1 | Informal | Escalado formal con historial |
| Auditar quién hizo qué sobre un ticket | Media | Supervisor | No suele existir en herramientas ligeras | Historial de auditoría por ticket |
| Operar el producto sin depender de un tercero externo | Media | Organización adoptante | Dependencia de proveedor SaaS | Despliegue self-hosted |

---

## 4. Vista general del producto

### 4.1 Perspectiva del producto
Producto nuevo e independiente. En esta fase **no se fija arquitectura ni stack tecnológico** — eso corresponde a la fase de Elaboración, una vez identificados los casos de uso arquitectónicamente significativos y los riesgos técnicos.

### 4.2 Resumen de capacidades

| Beneficio para el usuario | Características que lo soportan |
|---|---|
| Reportar problemas fácilmente | Creación de ticket, formularios por categoría, adjuntar evidencia |
| Transparencia del proceso | Seguimiento de estado, notificaciones de cambios |
| Resolución más rápida | Asignación automática/manual, priorización, escalado por niveles |
| Menos incidencias repetidas | Base de conocimiento, categorización de causas |
| Visibilidad gerencial | Dashboard de métricas, reportes de cumplimiento de SLA |
| Control de acceso adecuado | Roles (solicitante, agente, supervisor, admin) |
| Independencia de proveedor | Despliegue self-hosted, sin bloqueo (lock-in) de datos |

### 4.3 Suposiciones y dependencias
- Se asume que la organización adoptante provee su propia infraestructura de despliegue (a definir en Elaboración: contenedores, servidor propio, etc.).
- Se asume que la autenticación puede resolverse inicialmente con cuentas propias del sistema, dejando abierta la posibilidad de integración con directorios externos (LDAP/SSO) como extensión futura, no como requisito de esta versión.
- No se asume presupuesto de licenciamiento de terceros.

---

## 5. Características del producto (Features)

Nivel alto, sin detalle de flujo (eso vive en los Casos de Uso):

1. **Gestión de tickets**: alta, seguimiento por comentarios, cambio de estado, cierre. (Los datos del ticket no se editan tras crearlo — ver Modelo de Casos de Uso.)
2. **Categorización y priorización**: tipo de incidencia/solicitud, urgencia, impacto.
3. **Asignación y escalado**: manual y por reglas (N1 → N2 → N3).
4. **Gestión de SLA**: tiempos objetivo por prioridad/categoría, alertas de incumplimiento.
5. **Notificaciones**: al solicitante y al agente ante cambios relevantes.
6. **Base de conocimiento**: artículos vinculables a tickets recurrentes.
7. **Reportes y dashboard**: KPIs de volumen, tiempos, cumplimiento de SLA por agente/equipo.
8. **Gestión de usuarios y roles**: control de acceso por perfil, configurable por la organización adoptante.
9. **Historial/auditoría**: trazabilidad de cambios sobre cada ticket.

---

## 6. Restricciones

- El sistema debe ser accesible vía navegador web (sin cliente de escritorio).
- Debe permitir a cada organización adoptante configurar sus propias políticas de acceso a datos personales, dado que el producto no controla el contexto legal de quien lo instala.
- Debe ser desplegable de forma autónoma por la organización adoptante (self-hosted), sin dependencia de servicios propietarios de terceros para funcionar.

---

## 7. Rangos de calidad

| Atributo | Requisito |
|---|---|
| Usabilidad | Un usuario sin capacitación debe poder crear un ticket en menos de 2 minutos |
| Disponibilidad | Orientado a uso en horario laboral de la organización adoptante; sin requisito de alta disponibilidad 24/7 en esta versión |
| Seguridad | Acceso autenticado; datos de tickets visibles solo para el solicitante, agentes asignados y supervisores |
| Trazabilidad | Todo cambio de estado de un ticket debe quedar registrado con autor y fecha |
| Portabilidad | El producto debe poder instalarse en un entorno nuevo sin dependencias ocultas de una infraestructura específica |

---

## 8. Precedencia y priorización

Prioridad de features para la primera versión operativa (MVP), de mayor a menor:

1. Gestión de tickets (creación, estado, cierre)
2. Categorización y priorización
3. Asignación y escalado
4. Notificaciones básicas
5. Reportes/dashboard
6. Base de conocimiento
7. Gestión avanzada de SLA con alertas automáticas

Esta lista es la que se usará para decidir qué casos de uso son arquitectónicamente significativos en la fase de Elaboración.

---

## 9. Otros requisitos del producto

- **Idioma**: español (interfaz y documentación) en esta versión; internacionalización queda fuera de alcance inicial.


---

## 10. Apéndice

- Glosario de términos → ver [glosario.md](glosario.md).
- Modelo de Dominio (conceptual) → ver [modelo-dominio/](modelo-dominio/README.md).

---