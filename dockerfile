# Etapa de construcción
FROM node:23-alpine as builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json tsconfig.json ./

# Instalar dependencias (ignorando husky)
RUN npm ci --ignore-scripts

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa de producción
FROM node:23-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción (ignorando husky)
RUN npm ci --production --ignore-scripts

# Copiar los archivos compilados de la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer el puerto de la aplicación
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]