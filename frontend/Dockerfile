# Etapa 1: Construccion de la aplicacion Angular
FROM node:22-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar codigo y compilar bundle de produccion
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx para distribuir archivos estaticos
FROM nginx:alpine

# Limpiar directorio por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar bundle compilado de Angular
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar configuracion de Nginx con soporte SPA y proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
