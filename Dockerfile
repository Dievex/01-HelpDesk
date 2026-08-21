# Decisiones de este Dockerfile: docs/03-fase-construccion/decisiones-tecnicas.md

# ---- base: dependencias compartidas por dev y build ----
FROM node:22-alpine AS base
# Prisma necesita OpenSSL; Alpine no lo trae.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
# Lo necesita el postinstall (prisma generate).
COPY prisma/schema.prisma prisma/schema.prisma
RUN npm ci

# ---- dev: hot-reload; el código real lo trae el bind-mount de docker-compose ----
FROM base AS dev
COPY . .
EXPOSE 5173 3000
CMD ["npm", "run", "dev"]

# ---- build: bundle de producción del cliente ----
FROM base AS build
COPY . .
RUN npm run build --workspace=client

# ---- migrate: aplica migraciones de Prisma contra una BD de producción ----
# Target aparte porque el stage "prod" no tiene la CLI de Prisma (devDependency,
# omitida con --omit=dev) -- ver Iteración 0 en decisiones-tecnicas.md de Construcción.
FROM base AS migrate
COPY . .
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- prod: un único contenedor sirviendo API + cliente estático (Decisión de Arquitectura) ----
FROM node:22-alpine AS prod
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
# --ignore-scripts: sin la CLI de prisma (devDependency) no puede correr postinstall.
RUN npm ci --omit=dev --workspace=server --ignore-scripts
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client node_modules/@prisma/client
COPY server server
COPY prisma prisma
COPY --from=build /app/client/dist client/dist
EXPOSE 3000
CMD ["node", "server/src/index.js"]
