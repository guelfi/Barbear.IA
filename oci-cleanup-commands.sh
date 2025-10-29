#!/bin/bash

# Comandos para executar na OCI via SSH
# Copie e cole estes comandos um por vez na sua sessão SSH

echo "🔍 PASSO 1: Verificar containers atuais"
docker ps -a --filter "name=barbear"

echo ""
echo "🔍 PASSO 2: Verificar se há containers do barbear.ai especificamente"
docker ps -a --filter "name=barbear.ai"
docker ps -a --filter "name=barbear-ai"

echo ""
echo "🔍 PASSO 3: Listar TODOS os containers para ver outros projetos"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📁 PASSO 4: Navegar para o diretório e verificar o script"
cd /var/www/Barbear.IA
pwd
ls -la cleanup-container.sh

echo ""
echo "📖 PASSO 5: Verificar conteúdo do script"
cat cleanup-container.sh

echo ""
echo "🚀 PASSO 6: Executar limpeza seletiva"
chmod +x cleanup-container.sh
./cleanup-container.sh

echo ""
echo "✅ PASSO 7: Verificar resultado final"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"