#!/bin/bash

# Script para limpeza completa do container Barbear.IA na OCI
# Execute este script via SSH na instância OCI

set -e

echo "🧹 Iniciando limpeza completa do container Barbear.IA..."

# Navegar para o diretório do projeto
cd /var/www/Barbear.IA 2>/dev/null || cd /var/www/ || { echo "❌ Diretório não encontrado"; exit 1; }

echo "📍 Diretório atual: $(pwd)"

# 1. Parar todos os containers relacionados
echo "⏹️ Parando todos os containers..."
docker-compose down --remove-orphans || true
docker stop $(docker ps -q --filter "name=barbear") 2>/dev/null || true
docker stop $(docker ps -q --filter "name=nginx") 2>/dev/null || true

# 2. Remover containers
echo "🗑️ Removendo containers..."
docker rm -f $(docker ps -aq --filter "name=barbear") 2>/dev/null || true
docker rm -f $(docker ps -aq --filter "name=nginx") 2>/dev/null || true

# 3. Remover imagens relacionadas
echo "🖼️ Removendo imagens..."
docker rmi -f $(docker images --filter "reference=*barbear*" -q) 2>/dev/null || true
docker rmi -f $(docker images --filter "reference=*nginx*" -q) 2>/dev/null || true

# 4. Remover volumes
echo "💾 Removendo volumes..."
docker volume rm $(docker volume ls --filter "name=barbear" -q) 2>/dev/null || true

# 5. Limpeza geral do Docker
echo "🧽 Limpeza geral do Docker..."
docker system prune -af --volumes || true

# 6. Verificar se ainda há algo rodando na porta 3500
echo "🔍 Verificando porta 3500..."
if netstat -tlnp | grep :3500; then
    echo "⚠️ Ainda há algo rodando na porta 3500"
    PID=$(netstat -tlnp | grep :3500 | awk '{print $7}' | cut -d'/' -f1)
    if [ ! -z "$PID" ]; then
        echo "🔫 Matando processo PID: $PID"
        kill -9 $PID 2>/dev/null || true
    fi
else
    echo "✅ Porta 3500 está livre"
fi

# 7. Verificar status final
echo "📊 Status final:"
echo "Containers rodando: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | wc -l)"
echo "Imagens Docker: $(docker images | wc -l)"
echo "Volumes Docker: $(docker volume ls | wc -l)"

# 8. Verificar conectividade
echo "🌐 Testando conectividade na porta 3500..."
if curl -f -s http://localhost:3500/ > /dev/null 2>&1; then
    echo "⚠️ Ainda há resposta na porta 3500 - pode haver outro serviço"
else
    echo "✅ Porta 3500 não responde - limpeza completa"
fi

echo "🎉 Limpeza completa finalizada!"
echo "💡 Agora você pode executar um novo deploy via GitHub Actions"