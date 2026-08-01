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

# Build the application with debug info
RUN echo "🏗️ Iniciando build de produção..." && \
    npm run build && \
    echo "✅ Build concluído. Verificando arquivos gerados:" && \
    ls -la build/ && \
    echo "📄 Conteúdo do index.html:" && \
    head -20 build/index.html

# Production stage
FROM nginx:alpine

# Copy built application (Vite builds to 'build' directory)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check para monitoramento automático
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]