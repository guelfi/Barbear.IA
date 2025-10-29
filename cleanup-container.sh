#!/bin/bash

# Script para limpeza SELETIVA do container Barbear.IA na OCI
# IMPORTANTE: Remove APENAS recursos do barbear.ai, preservando outros projetos
# Execute este script via SSH na instância OCI

set -e

echo "🧹 Iniciando limpeza SELETIVA do container Barbear.IA..."
echo "⚠️ ATENÇÃO: Este script remove APENAS recursos do barbear.ai"

# Verificar se estamos no diretório correto
if [ -d "/var/www/Barbear.IA" ]; then
    cd /var/www/Barbear.IA
    echo "📍 Diretório do projeto: $(pwd)"
else
    echo "❌ Diretório /var/www/Barbear.IA não encontrado"
    echo "📋 Listando diretórios disponíveis em /var/www/:"
    ls -la /var/www/ 2>/dev/null || echo "Diretório /var/www/ não existe"
    exit 1
fi

# Mostrar containers atuais ANTES da limpeza
echo "📊 ANTES - Containers em execução:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# 1. Parar containers específicos do barbear.ai
echo "⏹️ Parando containers do barbear.ai..."
docker stop $(docker ps -q --filter "name=barbear.ai") 2>/dev/null || echo "Nenhum container barbear.ai rodando"
docker stop $(docker ps -q --filter "name=barbear-ai") 2>/dev/null || echo "Nenhum container barbear-ai rodando"

# 2. Remover containers específicos do barbear.ai
echo "🗑️ Removendo containers do barbear.ai..."
docker rm -f $(docker ps -aq --filter "name=barbear.ai") 2>/dev/null || echo "Nenhum container barbear.ai para remover"
docker rm -f $(docker ps -aq --filter "name=barbear-ai") 2>/dev/null || echo "Nenhum container barbear-ai para remover"

# 3. Remover imagens específicas do barbear.ai
echo "🖼️ Removendo imagens do barbear.ai..."
docker rmi -f $(docker images --filter "reference=*barbear.ai*" -q) 2>/dev/null || echo "Nenhuma imagem barbear.ai para remover"
docker rmi -f $(docker images --filter "reference=*barbear-ai*" -q) 2>/dev/null || echo "Nenhuma imagem barbear-ai para remover"

# 4. Remover volumes específicos do barbear.ai
echo "💾 Removendo volumes do barbear.ai..."
docker volume rm $(docker volume ls --filter "name=barbear" -q) 2>/dev/null || echo "Nenhum volume barbear para remover"

# 5. Limpeza SELETIVA (apenas imagens órfãs, não todos os recursos)
echo "🧽 Limpeza seletiva de imagens órfãs..."
docker image prune -f || true

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
echo "📊 DEPOIS - Status final:"
echo "Containers rodando:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Imagens Docker restantes: $(docker images | wc -l)"
echo "Volumes Docker restantes: $(docker volume ls | wc -l)"

# 8. Verificar conectividade
echo "🌐 Testando conectividade na porta 3500..."
if curl -f -s http://localhost:3500/ > /dev/null 2>&1; then
    echo "⚠️ Ainda há resposta na porta 3500 - pode haver outro serviço"
else
    echo "✅ Porta 3500 não responde - limpeza completa"
fi

echo "🎉 Limpeza SELETIVA finalizada!"
echo "💡 Recursos do barbear.ai removidos, outros projetos preservados"
echo "🚀 Agora você pode executar um novo deploy via GitHub Actions"