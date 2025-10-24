# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar versão estável do npm para consistência
RUN npm install -g npm@10

# Copy package files
COPY package*.json ./

# Instalar dependências - forçar npm install para evitar bug do rollup
RUN echo "📦 Removendo package-lock.json e usando npm install limpo" && \
    rm -f package-lock.json && \
    npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application (Vite builds to 'build' directory)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check para monitoramento automático
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]