[HelpDesk](../README.md) / [Fase de Transición](README.md)

# Manual de instalación self-hosted

Guía para levantar HelpDesk en un servidor propio, para alguien que clona el repositorio sin haber tocado el proyecto antes. Todo lo que sigue está probado de punta a punta (ver "Cómo se validó" al final) — no es una guía teórica.

## Requisitos

- Un servidor (VPS, máquina propia, lo que sea) con Docker y Docker Compose instalados.
- Un dominio propio, con un registro DNS tipo A/AAAA apuntando a la IP pública de ese servidor, **antes** de levantar el proxy — Caddy necesita eso para emitir el certificado HTTPS.
- Puertos 80 y 443 del servidor abiertos y alcanzables desde internet (el 80 hace falta para el challenge ACME de Let's Encrypt, no solo para redirigir).

## 1. Clonar y configurar

```bash
git clone https://github.com/Dievex/01-HelpDesk.git
cd 01-HelpDesk
cp .env.prod.example .env
```

Editar `.env` y completar los valores que `.env.prod.example` deja vacíos a propósito:

| Variable | Cómo generarla |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -base64 24` |
| `DATABASE_URL` | mismo usuario/contraseña/db que arriba, con host `db` (no cambiar el host) |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `ADMIN_SEED_PASSWORD` | una contraseña real para el Administrador inicial |
| `DOMAIN` | el dominio propio, sin protocolo ni ruta (ej. `helpdesk.midominio.com`) |

**Checklist de hardening antes de exponer el sistema a internet** — ningún valor de `.env.prod.example` sirve tal cual, están vacíos justamente para forzar esto:
- [ ] `POSTGRES_PASSWORD` generado, no reutilizado de ningún entorno de desarrollo.
- [ ] `JWT_SECRET` generado, no reutilizado.
- [ ] `ADMIN_SEED_PASSWORD` es una contraseña real, no `admin123`.
- [ ] `DOMAIN` con DNS ya resuelto hacia este servidor (`dig +short $DOMAIN` debe devolver la IP del servidor) antes del paso 2.

## 2. Levantar la pila

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Esto construye la imagen (target `prod` del `Dockerfile`, un único contenedor sirviendo API + cliente estático), aplica las migraciones de Prisma automáticamente (servicio `migrate`, corre antes que `app` y sale) y levanta Postgres y Caddy. La primera vez, Caddy tarda unos segundos en emitir el certificado de Let's Encrypt para `DOMAIN` — se puede seguir con:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

Buscar la línea `certificate obtained successfully`. Si en cambio aparece un error de challenge ACME, la causa casi siempre es DNS que todavía no resuelve o el puerto 80/443 bloqueado por un firewall — revisar el requisito de arriba antes de reintentar.

## 3. Sembrar el Administrador inicial y el catálogo base

Este paso es manual y de una sola vez — a propósito no se automatiza como los otros servicios, porque imprime la contraseña del Administrador en el log:

```bash
docker compose -f docker-compose.prod.yml exec app node prisma/seed.js
```

Crea el Administrador (`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` del `.env`) y el catálogo base (Equipo "Soporte General", Categoría "General", Prioridades Baja/Media/Alta). Entrar con esas credenciales en `https://$DOMAIN` y **cambiar la contraseña del Administrador desde Editar Usuario de inmediato** — no hay un segundo mecanismo que lo fuerce.

Si se corre dos veces no duplica nada: el Administrador se salta si ya existe un Usuario con ese correo, y el catálogo base usa `upsert`.

## 4. Backup y restauración

Los únicos datos que importan viven en dos volúmenes con nombre, no en el filesystem del contenedor:

- `db-data` — la base de datos completa (Postgres).
- `uploads` — los adjuntos de Ticket (UC-42).

Backup de la base de datos (mientras la pila está corriendo):

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U helpdesk helpdesk > backup-$(date +%F).sql
```

Restauración (contra una base vacía, después de levantar `db` y antes de sembrar):

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U helpdesk helpdesk < backup-2026-08-21.sql
```

Backup de adjuntos, copiando el volumen a un `.tar` en el host:

```bash
docker run --rm -v 01-helpdesk_uploads:/data -v "$(pwd)":/backup alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

(el nombre real del volumen depende del nombre del proyecto de Compose — confirmarlo con `docker volume ls`).

## 5. Actualizar a una versión nueva

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

El servicio `migrate` vuelve a correr en cada `up`, pero es idempotente (`prisma migrate deploy` solo aplica las migraciones pendientes) — no hace falta ningún paso manual adicional salvo que una migración puntual lo requiera (se documentaría en el commit correspondiente).

## Cómo se validó

Toda la secuencia de arriba (build de los 4 targets del `Dockerfile`, migración, seed, login, sesión con cookie `Secure`/`HttpOnly`, llamada autenticada a la API, cliente estático servido, redirección HTTP→HTTPS, rechazo 401 sin sesión) se probó de punta a punta en un stack aislado (`docker compose -p helpdesk-prod-check`, volúmenes propios) en la Iteración 2, sin tocar el entorno de desarrollo activo. La única parte que **no** se pudo validar en esta sesión es la emisión real de un certificado de Let's Encrypt contra un dominio público — para eso Caddy necesita DNS público y los puertos 80/443 alcanzables desde internet, que no existen en la máquina de desarrollo. Se validó en su lugar el mecanismo de proxy/TLS completo con el modo `tls internal` de Caddy (certificado local, mismo código de reverse proxy) — el detalle está en [Decisiones Técnicas, Iteración 2](decisiones-tecnicas.md).
