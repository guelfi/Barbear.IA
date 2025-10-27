#!/bin/bash

# =============================================================================
# SCRIPT DE FALLBACK MANUAL PARA DEPLOY DO BARBEAR.IA
# =============================================================================
# Este script permite executar o deploy manualmente em caso de falha do
# GitHub Actions ou necessidade de intervenção manual na OCI.
#
# Uso: ./deploy-fallback.sh [opções]
#
# Opções:
#   --force-rebuild    Força rebuild completo sem cache
#   --skip-backup      Pula criação de backup
#   --rollback         Executa rollback para versão anterior
#   --dry-run          Simula execução sem fazer alterações
#   --help             Mostra esta ajuda
#
# Requisitos:
#   - Acesso SSH configurado para a OCI
#   - Docker e docker-compose instalados localmente
#   - Variáveis de ambiente configuradas (ver seção CONFIGURAÇÃO)
# =============================================================================

set -e  # Parar em caso de erro
set -u  # Parar se variável não definida

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração padrão
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Variáveis de configuração (podem ser sobrescritas por arquivo .env)
OCI_HOST="${OCI_HOST:-}"
OCI_USERNAME="${OCI_USERNAME:-root}"
OCI_SSH_KEY="${OCI_SSH_KEY:-~/.ssh/id_rsa}"
PROJECT_NAME="${PROJECT_NAME:-barbear-ia}"
CONTAINER_NAME="${CONTAINER_NAME:-barbear-ia-app}"
PORT="${PORT:-3500}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/barbear-ia}"

# Flags de controle
FORCE_REBUILD=false
SKIP_BACKUP=false
ROLLBACK_MODE=false
DRY_RUN=false

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
SCRIPT DE FALLBACK MANUAL PARA DEPLOY DO BARBEAR.IA

Uso: $0 [opções]

Opções:
  --force-rebuild    Força rebuild completo sem cache
  --skip-backup      Pula criação de backup
  --rollback         Executa rollback para versão anterior
  --dry-run          Simula execução sem fazer alterações
  --help             Mostra esta ajuda

Variáveis de ambiente necessárias:
  OCI_HOST          IP ou hostname da instância OCI
  OCI_USERNAME      Usuário SSH (padrão: root)
  OCI_SSH_KEY       Caminho para chave SSH privada
  PROJECT_NAME      Nome do projeto (padrão: barbear-ia)
  CONTAINER_NAME    Nome do container (padrão: barbear-ia-app)
  PORT              Porta da aplicação (padrão: 3500)
  REMOTE_PATH       Caminho remoto do projeto

Exemplo:
  export OCI_HOST="192.168.1.100"
  export OCI_SSH_KEY="~/.ssh/oci_key"
  $0 --force-rebuild

EOF
}

check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar variáveis obrigatórias
    if [ -z "$OCI_HOST" ]; then
        log_error "Variável OCI_HOST não definida"
        exit 1
    fi
    
    # Verificar chave SSH
    if [ ! -f "$OCI_SSH_KEY" ]; then
        log_error "Chave SSH não encontrada: $OCI_SSH_KEY"
        exit 1
    fi
    
    # Verificar conectividade SSH
    if ! ssh -i "$OCI_SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "$OCI_USERNAME@$OCI_HOST" "echo 'SSH OK'" > /dev/null 2>&1; then
        log_error "Não foi possível conectar via SSH"
        exit 1
    fi
    
    # Verificar se Docker está instalado localmente
    if ! command -v docker > /dev/null 2>&1; then
        log_error "Docker não está instalado localmente"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

execute_remote_command() {
    local command="$1"
    local description="$2"
    
    log_info "$description"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "[DRY RUN] Comando que seria executado:"
        echo "  $command"
        return 0
    fi
    
    if ssh -i "$OCI_SSH_KEY" "$OCI_USERNAME@$OCI_HOST" "$command"; then
        log_success "$description - Concluído"
        return 0
    else
        log_error "$description - Falhou"
        return 1
    fi
}

create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        log_warning "Pulando criação de backup (--skip-backup)"
        return 0
    fi
    
    log_info "Criando backup da configuração atual..."
    
    local backup_commands="
        cd $REMOTE_PATH
        mkdir -p /var/backups/barbear-ia-snapshots
        
        # Backup da configuração
        cp docker-compose.yml /var/backups/barbear-ia-snapshots/backup-$TIMESTAMP-docker-compose.yml
        
        # Backup da imagem atual se existir
        if docker images --filter 'reference=*$CONTAINER_NAME*' --format '{{.ID}}' | head -1 > /dev/null; then
            CURRENT_IMAGE=\$(docker images --filter 'reference=*$CONTAINER_NAME*' --format '{{.ID}}' | head -1)
            docker save \$CURRENT_IMAGE > /var/backups/barbear-ia-snapshots/backup-$TIMESTAMP-image.tar
            echo \"Backup da imagem \$CURRENT_IMAGE criado\"
        fi
        
        # Backup dos dados se existirem volumes
        if docker volume ls | grep -q '$PROJECT_NAME'; then
            docker run --rm -v ${PROJECT_NAME}_data:/data -v /var/backups/barbear-ia-snapshots:/backup alpine tar czf /backup/backup-$TIMESTAMP-volumes.tar.gz -C /data .
            echo \"Backup dos volumes criado\"
        fi
        
        echo \"Backup criado com timestamp: $TIMESTAMP\"
    "
    
    execute_remote_command "$backup_commands" "Criando backup"
}

deploy_application() {
    log_info "Iniciando deploy da aplicação..."
    
    # Gerar checksum dos arquivos críticos
    local source_checksum=$(find "$PROJECT_ROOT" -name "package.json" -o -name "Dockerfile" -o -name "docker-compose.yml" | xargs cat | sha256sum | cut -d' ' -f1)
    local commit_sha=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local commit_short=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    log_info "Checksum dos arquivos: $source_checksum"
    log_info "Commit: $commit_sha"
    
    # Sincronizar arquivos
    log_info "Sincronizando arquivos com a OCI..."
    
    if [ "$DRY_RUN" = false ]; then
        rsync -avz --delete \
            -e "ssh -i $OCI_SSH_KEY" \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='.env.local' \
            --exclude='dist' \
            "$PROJECT_ROOT/" \
            "$OCI_USERNAME@$OCI_HOST:$REMOTE_PATH/"
    else
        log_warning "[DRY RUN] Sincronização de arquivos simulada"
    fi
    
    # Comandos de deploy remoto
    local deploy_commands="
        set -e
        cd $REMOTE_PATH
        
        echo '🔄 Iniciando deploy manual do $PROJECT_NAME...'
        echo '📊 Commit: $commit_short'
        echo '🔐 Checksum: $source_checksum'
        
        # Criar metadados do deploy
        cat > deploy-metadata.json << EOF
{
  \"deploy_type\": \"manual_fallback\",
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"commit_sha\": \"$commit_sha\",
  \"commit_short\": \"$commit_short\",
  \"source_checksum\": \"$source_checksum\",
  \"operator\": \"\$(whoami)@\$(hostname)\"
}
EOF
        
        # Verificar pré-requisitos
        echo '🔍 Verificando pré-requisitos...'
        
        if ! docker --version > /dev/null 2>&1; then
            echo '❌ Docker não está disponível'
            exit 1
        fi
        
        if ! docker-compose --version > /dev/null 2>&1; then
            echo '❌ Docker Compose não está disponível'
            exit 1
        fi
        
        # Verificar espaço em disco
        AVAILABLE_SPACE=\$(df /var/www | tail -1 | awk '{print \$4}')
        MIN_SPACE=2097152  # 2GB em KB
        
        if [ \"\$AVAILABLE_SPACE\" -lt \"\$MIN_SPACE\" ]; then
            echo '❌ Espaço em disco insuficiente'
            echo \"   Disponível: \${AVAILABLE_SPACE}KB\"
            echo \"   Mínimo: \${MIN_SPACE}KB\"
            exit 1
        fi
        
        echo '✅ Pré-requisitos verificados'
        
        # Limpeza completa se force rebuild
        if [ '$FORCE_REBUILD' = true ]; then
            echo '🧹 Executando limpeza completa (force rebuild)...'
            docker-compose down --remove-orphans || true
            docker system prune -a -f --volumes || true
            docker builder prune -a -f || true
        fi
        
        # Build da aplicação
        echo '🏗️ Construindo aplicação...'
        
        BUILD_ARGS=\"--build-arg COMMIT_SHA=$commit_sha --build-arg BUILD_TIMESTAMP=\$(date -u +%Y-%m-%dT%H:%M:%SZ) --build-arg SOURCE_CHECKSUM=$source_checksum\"
        
        if [ '$FORCE_REBUILD' = true ]; then
            docker-compose build --no-cache --pull --force-rm --progress=plain \$BUILD_ARGS $CONTAINER_NAME
        else
            docker-compose build --progress=plain \$BUILD_ARGS $CONTAINER_NAME
        fi
        
        if [ \$? -ne 0 ]; then
            echo '❌ Erro no build da aplicação'
            exit 1
        fi
        
        echo '✅ Build concluído com sucesso'
        
        # Deploy
        echo '🚀 Executando deploy...'
        
        # Parar versão atual
        docker-compose down --remove-orphans || true
        
        # Iniciar nova versão
        docker-compose up -d $CONTAINER_NAME
        
        if [ \$? -ne 0 ]; then
            echo '❌ Erro ao iniciar nova versão'
            exit 1
        fi
        
        # Aguardar inicialização
        echo '⏳ Aguardando inicialização (45 segundos)...'
        sleep 45
        
        # Verificação de saúde
        echo '🔍 Executando verificação de saúde...'
        
        HEALTH_RETRIES=0
        MAX_HEALTH_RETRIES=10
        
        while [ \$HEALTH_RETRIES -lt \$MAX_HEALTH_RETRIES ]; do
            if curl -f -s http://localhost:$PORT/ > /dev/null; then
                echo '✅ Verificação de saúde passou!'
                
                if docker-compose ps $CONTAINER_NAME | grep -q 'Up'; then
                    echo '✅ Container está rodando corretamente'
                    break
                else
                    echo '❌ Container não está no estado Up'
                    docker-compose ps
                    exit 1
                fi
            else
                HEALTH_RETRIES=\$((HEALTH_RETRIES + 1))
                echo \"⏳ Verificação falhou (tentativa \$HEALTH_RETRIES/\$MAX_HEALTH_RETRIES)\"
                
                if [ \$HEALTH_RETRIES -lt \$MAX_HEALTH_RETRIES ]; then
                    sleep 15
                fi
            fi
        done
        
        if [ \$HEALTH_RETRIES -eq \$MAX_HEALTH_RETRIES ]; then
            echo '❌ Verificação de saúde falhou'
            docker-compose logs --tail=30 $CONTAINER_NAME
            exit 1
        fi
        
        # Limpeza final
        echo '🧹 Limpeza final...'
        docker image prune -f || true
        
        # Salvar informações do deploy
        cat > last-successful-deploy.json << EOF
{
  \"deploy_type\": \"manual_fallback\",
  \"commit_sha\": \"$commit_sha\",
  \"commit_short\": \"$commit_short\",
  \"deploy_timestamp\": \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"image_id\": \"\$(docker images --filter 'reference=*$CONTAINER_NAME*' --format '{{.ID}}' | head -1)\",
  \"container_id\": \"\$(docker-compose ps -q $CONTAINER_NAME)\",
  \"success\": true
}
EOF
        
        echo '🎉 Deploy manual realizado com sucesso!'
        echo \"🌐 Aplicação disponível em: http://$OCI_HOST:$PORT\"
    "
    
    execute_remote_command "$deploy_commands" "Executando deploy"
}

rollback_application() {
    log_info "Iniciando rollback para versão anterior..."
    
    local rollback_commands="
        set -e
        cd $REMOTE_PATH
        
        echo '🔄 Iniciando rollback manual...'
        
        # Procurar backup mais recente
        LATEST_BACKUP=\$(ls -t /var/backups/barbear-ia-snapshots/backup-*-docker-compose.yml 2>/dev/null | head -1)
        LATEST_IMAGE_BACKUP=\$(ls -t /var/backups/barbear-ia-snapshots/backup-*-image.tar 2>/dev/null | head -1)
        
        if [ -z \"\$LATEST_BACKUP\" ]; then
            echo '❌ Nenhum backup de configuração encontrado'
            exit 1
        fi
        
        echo \"📦 Restaurando backup: \$(basename \$LATEST_BACKUP)\"
        cp \"\$LATEST_BACKUP\" docker-compose.yml
        
        # Restaurar imagem se disponível
        if [ ! -z \"\$LATEST_IMAGE_BACKUP\" ] && [ -f \"\$LATEST_IMAGE_BACKUP\" ]; then
            echo \"📦 Restaurando imagem: \$(basename \$LATEST_IMAGE_BACKUP)\"
            docker load -i \"\$LATEST_IMAGE_BACKUP\"
        fi
        
        # Parar containers atuais
        echo '🛑 Parando containers atuais...'
        docker-compose down --remove-orphans || true
        
        # Iniciar versão de backup
        echo '🚀 Iniciando versão de backup...'
        docker-compose up -d $CONTAINER_NAME
        
        # Aguardar inicialização
        echo '⏳ Aguardando inicialização (30 segundos)...'
        sleep 30
        
        # Verificar rollback
        ROLLBACK_RETRIES=0
        MAX_ROLLBACK_RETRIES=5
        
        while [ \$ROLLBACK_RETRIES -lt \$MAX_ROLLBACK_RETRIES ]; do
            if curl -f -s http://localhost:$PORT/ > /dev/null; then
                echo '✅ Rollback realizado com sucesso!'
                
                # Salvar informações do rollback
                cat > rollback-info.json << EOF
{
  \"rollback_timestamp\": \"\$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"restored_backup\": \"\$(basename \$LATEST_BACKUP)\",
  \"rollback_type\": \"manual_fallback\",
  \"success\": true
}
EOF
                break
            else
                ROLLBACK_RETRIES=\$((ROLLBACK_RETRIES + 1))
                echo \"⏳ Rollback tentativa \$ROLLBACK_RETRIES/\$MAX_ROLLBACK_RETRIES falhou\"
                
                if [ \$ROLLBACK_RETRIES -lt \$MAX_ROLLBACK_RETRIES ]; then
                    sleep 10
                fi
            fi
        done
        
        if [ \$ROLLBACK_RETRIES -eq \$MAX_ROLLBACK_RETRIES ]; then
            echo '❌ Rollback falhou'
            docker-compose logs --tail=20 $CONTAINER_NAME || true
            exit 1
        fi
        
        echo \"🎉 Rollback concluído! Aplicação disponível em: http://$OCI_HOST:$PORT\"
    "
    
    execute_remote_command "$rollback_commands" "Executando rollback"
}

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

main() {
    # Parse dos argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force-rebuild)
                FORCE_REBUILD=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --rollback)
                ROLLBACK_MODE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Opção desconhecida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Carregar arquivo .env se existir
    if [ -f "$PROJECT_ROOT/.env" ]; then
        log_info "Carregando configurações do arquivo .env"
        source "$PROJECT_ROOT/.env"
    fi
    
    # Banner
    echo "============================================================================="
    echo "                    DEPLOY FALLBACK MANUAL - BARBEAR.IA"
    echo "============================================================================="
    echo "Timestamp: $(date)"
    echo "Modo: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "EXECUÇÃO REAL")"
    echo "Force Rebuild: $FORCE_REBUILD"
    echo "Skip Backup: $SKIP_BACKUP"
    echo "Rollback Mode: $ROLLBACK_MODE"
    echo "OCI Host: $OCI_HOST"
    echo "============================================================================="
    
    # Verificar pré-requisitos
    check_prerequisites
    
    if [ "$ROLLBACK_MODE" = true ]; then
        # Modo rollback
        rollback_application
    else
        # Modo deploy normal
        create_backup
        deploy_application
    fi
    
    log_success "Operação concluída com sucesso!"
}

# Executar função principal se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi