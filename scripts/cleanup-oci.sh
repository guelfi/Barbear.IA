#!/bin/bash

# Script de limpeza para OCI antes do deploy
# Execute este script na instância OCI via SSH

set -e

echo "🧹 Iniciando limpeza da OCI para Barbear.IA..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está na instância OCI
if [ ! -f "/etc/cloud/cloud.cfg" ]; then
    warning "Este script deve ser executado na instância OCI"
fi

# Parar e remover containers do Barbear.IA
log "Parando containers do Barbear.IA..."
sudo docker stop barbear-ia-app 2>/dev/null || warning "Container barbear-ia-app não estava rodando"
sudo docker rm barbear-ia-app 2>/dev/null || warning "Container barbear-ia-app não encontrado"

# Parar docker-compose se existir
if [ -f "/home/ubuntu/Barbear.IA/docker-compose.yml" ]; then
    log "Parando docker-compose..."
    cd /home/ubuntu/Barbear.IA
    sudo docker-compose down 2>/dev/null || warning "Docker-compose não estava rodando"
fi

# Remover imagens do Barbear.IA
log "Removendo imagens antigas do Barbear.IA..."
sudo docker images | grep -E "(barbear|barbear-ia)" | awk '{print $3}' | xargs -r sudo docker rmi -f 2>/dev/null || warning "Nenhuma imagem do Barbear.IA encontrada"

# Limpar imagens órfãs
log "Limpando imagens órfãs..."
sudo docker image prune -f

# Limpar volumes não utilizados
log "Limpando volumes não utilizados..."
sudo docker volume prune -f

# Limpar networks não utilizadas
log "Limpando networks não utilizadas..."
sudo docker network prune -f

# Verificar espaço em disco
log "Verificando espaço em disco..."
df -h /

# Limpar logs antigos do Docker
log "Limpando logs antigos do Docker..."
sudo find /var/lib/docker/containers/ -name "*.log" -exec truncate -s 0 {} \; 2>/dev/null || warning "Não foi possível limpar logs do Docker"

# Verificar porta 3500
log "Verificando porta 3500..."
if sudo netstat -tlnp | grep -q ":3500 "; then
    warning "Porta 3500 ainda está em uso:"
    sudo netstat -tlnp | grep ":3500 "
    
    # Tentar matar processos na porta 3500
    PIDS=$(sudo lsof -t -i:3500 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        log "Matando processos na porta 3500..."
        echo $PIDS | xargs -r sudo kill -9
        sleep 2
    fi
else
    success "Porta 3500 está livre"
fi

# Verificar se o diretório do projeto existe
if [ -d "/home/ubuntu/Barbear.IA" ]; then
    success "Diretório do projeto encontrado: /home/ubuntu/Barbear.IA"
    
    # Fazer backup de arquivos importantes se existirem
    cd /home/ubuntu/Barbear.IA
    
    if [ -d "build" ]; then
        log "Fazendo backup do build atual..."
        sudo mv build "build_backup_$(date +%Y%m%d_%H%M%S)" || warning "Não foi possível fazer backup do build"
    fi
    
    # Verificar status do Git
    log "Verificando status do Git..."
    git status --porcelain
    
    # Mostrar último commit
    log "Último commit:"
    git log --oneline -1
    
else
    error "Diretório do projeto não encontrado: /home/ubuntu/Barbear.IA"
    log "Criando diretório e clonando repositório..."
    
    cd /home/ubuntu
    git clone https://github.com/guelfi/Barbear.IA.git
    cd Barbear.IA
fi

# Verificar recursos do sistema
log "Verificando recursos do sistema..."
echo "CPU:"
nproc
echo "Memória:"
free -h
echo "Espaço em disco:"
df -h /

# Verificar Docker
log "Verificando Docker..."
sudo docker --version
sudo docker-compose --version 2>/dev/null || warning "Docker Compose não encontrado"

# Verificar Node.js
log "Verificando Node.js..."
node --version 2>/dev/null || warning "Node.js não encontrado"
npm --version 2>/dev/null || warning "NPM não encontrado"

# Mostrar containers ativos
log "Containers ativos:"
sudo docker ps

# Mostrar imagens disponíveis
log "Imagens Docker disponíveis:"
sudo docker images

success "Limpeza concluída! Sistema pronto para deploy."
log "Execute o deploy via GitHub Actions ou manualmente."

echo ""
echo "📋 Resumo da limpeza:"
echo "   - Containers do Barbear.IA removidos"
echo "   - Imagens antigas limpas"
echo "   - Porta 3500 liberada"
echo "   - Sistema verificado e pronto"
echo ""
echo "🚀 Próximo passo: Executar deploy via GitHub Actions"