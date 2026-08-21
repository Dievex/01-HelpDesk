# ---- base: dependencias compartidas por dev y build ----
FROM node:22-alpine AS base
# Prisma necesita OpenSSL para sus motores binarios -- Alpine no lo trae por defecto.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
# El schema tiene que estar presente ya aquí: "npm ci" dispara el postinstall
# ("prisma generate"), que falla si prisma/schema.prisma todavía no existe.
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

# ---- prod: un único contenedor sirviendo API + cliente estático (Decisión de Arquitectura) ----
FROM node:22-alpine AS prod
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
# --ignore-scripts: "prisma" (CLI) es devDependency, omitida aquí -- el postinstall
# "prisma generate" fallaría al no encontrarla. El cliente ya generado se copia
# abajo desde el stage "build", que sí tiene la CLI completa.
RUN npm ci --omit=dev --workspace=server --ignore-scripts
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client node_modules/@prisma/client
COPY server server
COPY prisma prisma
COPY --from=build /app/client/dist client/dist
EXPOSE 3000
CMD ["node", "server/src/index.js"]
