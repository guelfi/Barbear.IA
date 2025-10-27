#!/usr/bin/env python3
"""
SCRIPT DE FALLBACK MANUAL PARA DEPLOY DO BARBEAR.IA
==================================================

Este script Python permite executar o deploy manualmente em caso de falha do
GitHub Actions ou necessidade de intervenção manual na OCI.

Uso: python deploy-fallback.py [opções]

Opções:
  --force-rebuild    Força rebuild completo sem cache
  --skip-backup      Pula criação de backup
  --rollback         Executa rollback para versão anterior
  --dry-run          Simula execução sem fazer alterações
  --config FILE      Arquivo de configuração personalizado
  --help             Mostra esta ajuda

Requisitos:
  - Python 3.6+
  - Bibliotecas: paramiko, requests (pip install paramiko requests)
  - Acesso SSH configurado para a OCI
  - Docker e docker-compose instalados localmente

Configuração:
  Crie um arquivo .env ou defina as variáveis de ambiente:
  - OCI_HOST: IP ou hostname da instância OCI
  - OCI_USERNAME: Usuário SSH (padrão: root)
  - OCI_SSH_KEY: Caminho para chave SSH privada
  - PROJECT_NAME: Nome do projeto (padrão: barbear-ia)
  - CONTAINER_NAME: Nome do container (padrão: barbear-ia-app)
  - PORT: Porta da aplicação (padrão: 3500)
  - REMOTE_PATH: Caminho remoto do projeto
"""

import os
import sys
import json
import time
import hashlib
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    import paramiko
    import requests
except ImportError:
    print("❌ Dependências não encontradas. Instale com:")
    print("   pip install paramiko requests")
    sys.exit(1)

# Configuração de cores para output
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'  # No Color

class Logger:
    """Logger simples com cores"""
    
    @staticmethod
    def info(message: str):
        print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")
    
    @staticmethod
    def success(message: str):
        print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")
    
    @staticmethod
    def warning(message: str):
        print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")
    
    @staticmethod
    def error(message: str):
        print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")
    
    @staticmethod
    def debug(message: str):
        print(f"{Colors.PURPLE}[DEBUG]{Colors.NC} {message}")

class DeployConfig:
    """Configuração do deploy"""
    
    def __init__(self, config_file: Optional[str] = None):
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Configurações padrão
        self.config = {
            'OCI_HOST': '',
            'OCI_USERNAME': 'root',
            'OCI_SSH_KEY': '~/.ssh/id_rsa',
            'PROJECT_NAME': 'barbear-ia',
            'CONTAINER_NAME': 'barbear-ia-app',
            'PORT': '3500',
            'REMOTE_PATH': '/var/www/barbear-ia',
            'SSH_TIMEOUT': 30,
            'HEALTH_CHECK_RETRIES': 10,
            'HEALTH_CHECK_INTERVAL': 15
        }
        
        # Carregar configurações
        self._load_env_file()
        self._load_environment_variables()
        
        if config_file:
            self._load_config_file(config_file)
    
    def _load_env_file(self):
        """Carrega configurações do arquivo .env"""
        env_file = self.project_root / '.env'
        if env_file.exists():
            Logger.info(f"Carregando configurações de {env_file}")
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        self.config[key.strip()] = value.strip().strip('"\'')
    
    def _load_environment_variables(self):
        """Carrega configurações das variáveis de ambiente"""
        for key in self.config.keys():
            if key in os.environ:
                self.config[key] = os.environ[key]
    
    def _load_config_file(self, config_file: str):
        """Carrega configurações de arquivo JSON"""
        try:
            with open(config_file, 'r') as f:
                custom_config = json.load(f)
                self.config.update(custom_config)
            Logger.info(f"Configurações carregadas de {config_file}")
        except Exception as e:
            Logger.error(f"Erro ao carregar arquivo de configuração: {e}")
            sys.exit(1)
    
    def get(self, key: str, default=None):
        """Obtém valor de configuração"""
        return self.config.get(key, default)
    
    def validate(self):
        """Valida configurações obrigatórias"""
        required_fields = ['OCI_HOST']
        missing_fields = [field for field in required_fields if not self.config.get(field)]
        
        if missing_fields:
            Logger.error(f"Campos obrigatórios não definidos: {', '.join(missing_fields)}")
            return False
        
        return True

class SSHClient:
    """Cliente SSH para execução de comandos remotos"""
    
    def __init__(self, config: DeployConfig):
        self.config = config
        self.client = None
    
    def connect(self) -> bool:
        """Conecta ao servidor SSH"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Expandir caminho da chave SSH
            ssh_key_path = os.path.expanduser(self.config.get('OCI_SSH_KEY'))
            
            if not os.path.exists(ssh_key_path):
                Logger.error(f"Chave SSH não encontrada: {ssh_key_path}")
                return False
            
            Logger.info(f"Conectando a {self.config.get('OCI_HOST')}...")
            
            self.client.connect(
                hostname=self.config.get('OCI_HOST'),
                username=self.config.get('OCI_USERNAME'),
                key_filename=ssh_key_path,
                timeout=self.config.get('SSH_TIMEOUT', 30)
            )
            
            Logger.success("Conexão SSH estabelecida")
            return True
            
        except Exception as e:
            Logger.error(f"Erro na conexão SSH: {e}")
            return False
    
    def execute_command(self, command: str, description: str = "", dry_run: bool = False) -> Tuple[bool, str, str]:
        """Executa comando remoto"""
        if description:
            Logger.info(description)
        
        if dry_run:
            Logger.warning(f"[DRY RUN] Comando que seria executado:")
            print(f"  {command}")
            return True, "", ""
        
        try:
            stdin, stdout, stderr = self.client.exec_command(command, timeout=1800)  # 30 min timeout
            
            # Aguardar conclusão
            exit_status = stdout.channel.recv_exit_status()
            
            stdout_text = stdout.read().decode('utf-8')
            stderr_text = stderr.read().decode('utf-8')
            
            if exit_status == 0:
                if description:
                    Logger.success(f"{description} - Concluído")
                return True, stdout_text, stderr_text
            else:
                if description:
                    Logger.error(f"{description} - Falhou (exit code: {exit_status})")
                Logger.error(f"STDERR: {stderr_text}")
                return False, stdout_text, stderr_text
                
        except Exception as e:
            Logger.error(f"Erro na execução do comando: {e}")
            return False, "", str(e)
    
    def disconnect(self):
        """Desconecta do servidor SSH"""
        if self.client:
            self.client.close()
            Logger.info("Conexão SSH fechada")

class DeployManager:
    """Gerenciador principal do deploy"""
    
    def __init__(self, config: DeployConfig):
        self.config = config
        self.ssh = SSHClient(config)
        self.commit_sha = self._get_git_commit()
        self.commit_short = self.commit_sha[:8] if self.commit_sha else "unknown"
        self.source_checksum = self._calculate_source_checksum()
    
    def _get_git_commit(self) -> str:
        """Obtém hash do commit atual"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                  capture_output=True, text=True, cwd=self.config.project_root)
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception:
            pass
        return "unknown"
    
    def _calculate_source_checksum(self) -> str:
        """Calcula checksum dos arquivos críticos"""
        try:
            critical_files = ['package.json', 'Dockerfile', 'docker-compose.yml']
            content = ""
            
            for filename in critical_files:
                file_path = self.config.project_root / filename
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content += f.read()
            
            return hashlib.sha256(content.encode('utf-8')).hexdigest()
        except Exception as e:
            Logger.warning(f"Erro ao calcular checksum: {e}")
            return "unknown"
    
    def check_prerequisites(self) -> bool:
        """Verifica pré-requisitos"""
        Logger.info("Verificando pré-requisitos...")
        
        # Verificar configuração
        if not self.config.validate():
            return False
        
        # Verificar Docker local
        try:
            result = subprocess.run(['docker', '--version'], capture_output=True)
            if result.returncode != 0:
                Logger.error("Docker não está instalado localmente")
                return False
        except FileNotFoundError:
            Logger.error("Docker não encontrado no PATH")
            return False
        
        # Verificar conectividade SSH
        if not self.ssh.connect():
            return False
        
        Logger.success("Pré-requisitos verificados")
        return True
    
    def sync_files(self, dry_run: bool = False) -> bool:
        """Sincroniza arquivos com o servidor"""
        Logger.info("Sincronizando arquivos com a OCI...")
        
        if dry_run:
            Logger.warning("[DRY RUN] Sincronização de arquivos simulada")
            return True
        
        try:
            # Usar rsync para sincronização
            rsync_cmd = [
                'rsync', '-avz', '--delete',
                '-e', f'ssh -i {os.path.expanduser(self.config.get("OCI_SSH_KEY"))}',
                '--exclude=.git',
                '--exclude=node_modules',
                '--exclude=.env.local',
                '--exclude=dist',
                f'{self.config.project_root}/',
                f'{self.config.get("OCI_USERNAME")}@{self.config.get("OCI_HOST")}:{self.config.get("REMOTE_PATH")}/'
            ]
            
            result = subprocess.run(rsync_cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                Logger.success("Arquivos sincronizados")
                return True
            else:
                Logger.error(f"Erro na sincronização: {result.stderr}")
                return False
                
        except Exception as e:
            Logger.error(f"Erro na sincronização: {e}")
            return False
    
    def create_backup(self, skip_backup: bool = False, dry_run: bool = False) -> bool:
        """Cria backup da configuração atual"""
        if skip_backup:
            Logger.warning("Pulando criação de backup (--skip-backup)")
            return True
        
        backup_commands = f"""
            cd {self.config.get('REMOTE_PATH')}
            mkdir -p /var/backups/barbear-ia-snapshots
            
            # Backup da configuração
            cp docker-compose.yml /var/backups/barbear-ia-snapshots/backup-{self.config.timestamp}-docker-compose.yml
            
            # Backup da imagem atual se existir
            if docker images --filter 'reference=*{self.config.get('CONTAINER_NAME')}*' --format '{{{{.ID}}}}' | head -1 > /dev/null; then
                CURRENT_IMAGE=$(docker images --filter 'reference=*{self.config.get('CONTAINER_NAME')}*' --format '{{{{.ID}}}}' | head -1)
                docker save $CURRENT_IMAGE > /var/backups/barbear-ia-snapshots/backup-{self.config.timestamp}-image.tar
                echo "Backup da imagem $CURRENT_IMAGE criado"
            fi
            
            # Backup dos dados se existirem volumes
            if docker volume ls | grep -q '{self.config.get('PROJECT_NAME')}'; then
                docker run --rm -v {self.config.get('PROJECT_NAME')}_data:/data -v /var/backups/barbear-ia-snapshots:/backup alpine tar czf /backup/backup-{self.config.timestamp}-volumes.tar.gz -C /data .
                echo "Backup dos volumes criado"
            fi
            
            echo "Backup criado com timestamp: {self.config.timestamp}"
        """
        
        success, stdout, stderr = self.ssh.execute_command(
            backup_commands, "Criando backup", dry_run
        )
        
        return success
    
    def deploy_application(self, force_rebuild: bool = False, dry_run: bool = False) -> bool:
        """Executa deploy da aplicação"""
        Logger.info("Iniciando deploy da aplicação...")
        
        deploy_commands = f"""
            set -e
            cd {self.config.get('REMOTE_PATH')}
            
            echo '🔄 Iniciando deploy manual do {self.config.get('PROJECT_NAME')}...'
            echo '📊 Commit: {self.commit_short}'
            echo '🔐 Checksum: {self.source_checksum}'
            
            # Criar metadados do deploy
            cat > deploy-metadata.json << 'EOF'
{{
  "deploy_type": "manual_fallback_python",
  "timestamp": "{datetime.utcnow().isoformat()}Z",
  "commit_sha": "{self.commit_sha}",
  "commit_short": "{self.commit_short}",
  "source_checksum": "{self.source_checksum}",
  "operator": "$(whoami)@$(hostname)"
}}
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
            AVAILABLE_SPACE=$(df /var/www | tail -1 | awk '{{print $4}}')
            MIN_SPACE=2097152  # 2GB em KB
            
            if [ "$AVAILABLE_SPACE" -lt "$MIN_SPACE" ]; then
                echo '❌ Espaço em disco insuficiente'
                echo "   Disponível: ${{AVAILABLE_SPACE}}KB"
                echo "   Mínimo: ${{MIN_SPACE}}KB"
                exit 1
            fi
            
            echo '✅ Pré-requisitos verificados'
            
            # Limpeza completa se force rebuild
            if [ '{str(force_rebuild).lower()}' = 'true' ]; then
                echo '🧹 Executando limpeza completa (force rebuild)...'
                docker-compose down --remove-orphans || true
                docker system prune -a -f --volumes || true
                docker builder prune -a -f || true
            fi
            
            # Build da aplicação
            echo '🏗️ Construindo aplicação...'
            
            BUILD_ARGS="--build-arg COMMIT_SHA={self.commit_sha} --build-arg BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ) --build-arg SOURCE_CHECKSUM={self.source_checksum}"
            
            if [ '{str(force_rebuild).lower()}' = 'true' ]; then
                docker-compose build --no-cache --pull --force-rm --progress=plain $BUILD_ARGS {self.config.get('CONTAINER_NAME')}
            else
                docker-compose build --progress=plain $BUILD_ARGS {self.config.get('CONTAINER_NAME')}
            fi
            
            if [ $? -ne 0 ]; then
                echo '❌ Erro no build da aplicação'
                exit 1
            fi
            
            echo '✅ Build concluído com sucesso'
            
            # Deploy
            echo '🚀 Executando deploy...'
            
            # Parar versão atual
            docker-compose down --remove-orphans || true
            
            # Iniciar nova versão
            docker-compose up -d {self.config.get('CONTAINER_NAME')}
            
            if [ $? -ne 0 ]; then
                echo '❌ Erro ao iniciar nova versão'
                exit 1
            fi
            
            # Aguardar inicialização
            echo '⏳ Aguardando inicialização (45 segundos)...'
            sleep 45
            
            # Verificação de saúde
            echo '🔍 Executando verificação de saúde...'
            
            HEALTH_RETRIES=0
            MAX_HEALTH_RETRIES={self.config.get('HEALTH_CHECK_RETRIES', 10)}
            
            while [ $HEALTH_RETRIES -lt $MAX_HEALTH_RETRIES ]; do
                if curl -f -s http://localhost:{self.config.get('PORT')}/ > /dev/null; then
                    echo '✅ Verificação de saúde passou!'
                    
                    if docker-compose ps {self.config.get('CONTAINER_NAME')} | grep -q 'Up'; then
                        echo '✅ Container está rodando corretamente'
                        break
                    else
                        echo '❌ Container não está no estado Up'
                        docker-compose ps
                        exit 1
                    fi
                else
                    HEALTH_RETRIES=$((HEALTH_RETRIES + 1))
                    echo "⏳ Verificação falhou (tentativa $HEALTH_RETRIES/$MAX_HEALTH_RETRIES)"
                    
                    if [ $HEALTH_RETRIES -lt $MAX_HEALTH_RETRIES ]; then
                        sleep {self.config.get('HEALTH_CHECK_INTERVAL', 15)}
                    fi
                fi
            done
            
            if [ $HEALTH_RETRIES -eq $MAX_HEALTH_RETRIES ]; then
                echo '❌ Verificação de saúde falhou'
                docker-compose logs --tail=30 {self.config.get('CONTAINER_NAME')}
                exit 1
            fi
            
            # Limpeza final
            echo '🧹 Limpeza final...'
            docker image prune -f || true
            
            # Salvar informações do deploy
            cat > last-successful-deploy.json << 'EOF'
{{
  "deploy_type": "manual_fallback_python",
  "commit_sha": "{self.commit_sha}",
  "commit_short": "{self.commit_short}",
  "deploy_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "image_id": "$(docker images --filter 'reference=*{self.config.get('CONTAINER_NAME')}*' --format '{{{{.ID}}}}' | head -1)",
  "container_id": "$(docker-compose ps -q {self.config.get('CONTAINER_NAME')})",
  "success": true
}}
EOF
            
            echo '🎉 Deploy manual realizado com sucesso!'
            echo "🌐 Aplicação disponível em: http://{self.config.get('OCI_HOST')}:{self.config.get('PORT')}"
        """
        
        success, stdout, stderr = self.ssh.execute_command(
            deploy_commands, "Executando deploy", dry_run
        )
        
        if success and not dry_run:
            Logger.info("Verificando aplicação...")
            time.sleep(5)  # Aguardar um pouco mais
            
            # Verificar se aplicação está respondendo
            try:
                response = requests.get(
                    f"http://{self.config.get('OCI_HOST')}:{self.config.get('PORT')}/",
                    timeout=10
                )
                if response.status_code == 200:
                    Logger.success("Aplicação está respondendo corretamente!")
                else:
                    Logger.warning(f"Aplicação respondeu com status {response.status_code}")
            except Exception as e:
                Logger.warning(f"Não foi possível verificar aplicação via HTTP: {e}")
        
        return success
    
    def rollback_application(self, dry_run: bool = False) -> bool:
        """Executa rollback para versão anterior"""
        Logger.info("Iniciando rollback para versão anterior...")
        
        rollback_commands = f"""
            set -e
            cd {self.config.get('REMOTE_PATH')}
            
            echo '🔄 Iniciando rollback manual...'
            
            # Procurar backup mais recente
            LATEST_BACKUP=$(ls -t /var/backups/barbear-ia-snapshots/backup-*-docker-compose.yml 2>/dev/null | head -1)
            LATEST_IMAGE_BACKUP=$(ls -t /var/backups/barbear-ia-snapshots/backup-*-image.tar 2>/dev/null | head -1)
            
            if [ -z "$LATEST_BACKUP" ]; then
                echo '❌ Nenhum backup de configuração encontrado'
                exit 1
            fi
            
            echo "📦 Restaurando backup: $(basename $LATEST_BACKUP)"
            cp "$LATEST_BACKUP" docker-compose.yml
            
            # Restaurar imagem se disponível
            if [ ! -z "$LATEST_IMAGE_BACKUP" ] && [ -f "$LATEST_IMAGE_BACKUP" ]; then
                echo "📦 Restaurando imagem: $(basename $LATEST_IMAGE_BACKUP)"
                docker load -i "$LATEST_IMAGE_BACKUP"
            fi
            
            # Parar containers atuais
            echo '🛑 Parando containers atuais...'
            docker-compose down --remove-orphans || true
            
            # Iniciar versão de backup
            echo '🚀 Iniciando versão de backup...'
            docker-compose up -d {self.config.get('CONTAINER_NAME')}
            
            # Aguardar inicialização
            echo '⏳ Aguardando inicialização (30 segundos)...'
            sleep 30
            
            # Verificar rollback
            ROLLBACK_RETRIES=0
            MAX_ROLLBACK_RETRIES=5
            
            while [ $ROLLBACK_RETRIES -lt $MAX_ROLLBACK_RETRIES ]; do
                if curl -f -s http://localhost:{self.config.get('PORT')}/ > /dev/null; then
                    echo '✅ Rollback realizado com sucesso!'
                    
                    # Salvar informações do rollback
                    cat > rollback-info.json << 'EOF'
{{
  "rollback_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "restored_backup": "$(basename $LATEST_BACKUP)",
  "rollback_type": "manual_fallback_python",
  "success": true
}}
EOF
                    break
                else
                    ROLLBACK_RETRIES=$((ROLLBACK_RETRIES + 1))
                    echo "⏳ Rollback tentativa $ROLLBACK_RETRIES/$MAX_ROLLBACK_RETRIES falhou"
                    
                    if [ $ROLLBACK_RETRIES -lt $MAX_ROLLBACK_RETRIES ]; then
                        sleep 10
                    fi
                fi
            done
            
            if [ $ROLLBACK_RETRIES -eq $MAX_ROLLBACK_RETRIES ]; then
                echo '❌ Rollback falhou'
                docker-compose logs --tail=20 {self.config.get('CONTAINER_NAME')} || true
                exit 1
            fi
            
            echo "🎉 Rollback concluído! Aplicação disponível em: http://{self.config.get('OCI_HOST')}:{self.config.get('PORT')}"
        """
        
        success, stdout, stderr = self.ssh.execute_command(
            rollback_commands, "Executando rollback", dry_run
        )
        
        return success

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Script de fallback manual para deploy do Barbear.IA",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('--force-rebuild', action='store_true',
                       help='Força rebuild completo sem cache')
    parser.add_argument('--skip-backup', action='store_true',
                       help='Pula criação de backup')
    parser.add_argument('--rollback', action='store_true',
                       help='Executa rollback para versão anterior')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simula execução sem fazer alterações')
    parser.add_argument('--config', type=str,
                       help='Arquivo de configuração personalizado')
    
    args = parser.parse_args()
    
    # Banner
    print("=" * 80)
    print("                    DEPLOY FALLBACK MANUAL - BARBEAR.IA")
    print("                              (Python Version)")
    print("=" * 80)
    print(f"Timestamp: {datetime.now()}")
    print(f"Modo: {'DRY RUN' if args.dry_run else 'EXECUÇÃO REAL'}")
    print(f"Force Rebuild: {args.force_rebuild}")
    print(f"Skip Backup: {args.skip_backup}")
    print(f"Rollback Mode: {args.rollback}")
    print("=" * 80)
    
    try:
        # Inicializar configuração
        config = DeployConfig(args.config)
        
        # Inicializar gerenciador de deploy
        deploy_manager = DeployManager(config)
        
        # Verificar pré-requisitos
        if not deploy_manager.check_prerequisites():
            Logger.error("Falha na verificação de pré-requisitos")
            sys.exit(1)
        
        if args.rollback:
            # Modo rollback
            success = deploy_manager.rollback_application(args.dry_run)
        else:
            # Modo deploy normal
            # Sincronizar arquivos
            if not deploy_manager.sync_files(args.dry_run):
                Logger.error("Falha na sincronização de arquivos")
                sys.exit(1)
            
            # Criar backup
            if not deploy_manager.create_backup(args.skip_backup, args.dry_run):
                Logger.error("Falha na criação de backup")
                sys.exit(1)
            
            # Executar deploy
            success = deploy_manager.deploy_application(args.force_rebuild, args.dry_run)
        
        # Desconectar SSH
        deploy_manager.ssh.disconnect()
        
        if success:
            Logger.success("Operação concluída com sucesso!")
            sys.exit(0)
        else:
            Logger.error("Operação falhou")
            sys.exit(1)
            
    except KeyboardInterrupt:
        Logger.warning("Operação cancelada pelo usuário")
        sys.exit(1)
    except Exception as e:
        Logger.error(f"Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()