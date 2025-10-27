# 🔒 DOCUMENTAÇÃO DE SEGURANÇA - BARBEAR.IA

## 📋 Índice

1. [Visão Geral de Segurança](#visão-geral-de-segurança)
2. [Configuração de Secrets](#configuração-de-secrets)
3. [Autenticação SSH](#autenticação-ssh)
4. [Permissões e Acessos](#permissões-e-acessos)
5. [Boas Práticas](#boas-práticas)
6. [Auditoria e Monitoramento](#auditoria-e-monitoramento)
7. [Procedimentos de Emergência](#procedimentos-de-emergência)

---

## 🛡️ Visão Geral de Segurança

O sistema de deploy do Barbear.IA implementa múltiplas camadas de segurança para proteger o processo de deploy e a infraestrutura na Oracle Cloud Infrastructure (OCI).

### 🔐 Princípios de Segurança

- **Princípio do Menor Privilégio**: Cada componente possui apenas as permissões mínimas necessárias
- **Autenticação Forte**: Uso exclusivo de chaves SSH para autenticação
- **Segregação de Ambientes**: Separação clara entre desenvolvimento e produção
- **Auditoria Completa**: Logs detalhados de todas as operações
- **Rotação de Credenciais**: Procedimentos para renovação periódica de chaves

---

## 🗝️ Configuração de Secrets

### 📝 Lista de Secrets Obrigatórios

Configure os seguintes secrets no repositório GitHub (`Settings > Secrets and variables > Actions`):

| Secret Name | Descrição | Formato | Exemplo |
|-------------|-----------|---------|---------|
| `OCI_HOST` | IP ou hostname da instância OCI | String | `123.456.789.012` |
| `OCI_USERNAME` | Usuário SSH (recomendado: root) | String | `root` |
| `OCI_SSH_KEY` | Chave SSH privada completa | PEM | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `DEPLOY_TIMEOUT` | Timeout para operações (segundos) | Number | `1800` |
| `ROLLBACK_ENABLED` | Habilitar rollback automático | Boolean | `true` |
| `LOG_LEVEL` | Nível de log detalhado | String | `info` |

### 🔧 Configuração Passo a Passo

#### 1. Acessar Configurações do Repositório
```
1. Navegue para o repositório no GitHub
2. Clique em "Settings" (Configurações)
3. No menu lateral, clique em "Secrets and variables"
4. Selecione "Actions"
5. Clique em "New repository secret"
```

#### 2. Configurar OCI_HOST
```
Name: OCI_HOST
Secret: [IP_DA_SUA_INSTANCIA_OCI]

Exemplo: 123.456.789.012
```

#### 3. Configurar OCI_USERNAME
```
Name: OCI_USERNAME
Secret: root

Nota: Use 'root' para máximo controle, ou um usuário com sudo
```

#### 4. Configurar OCI_SSH_KEY
```
Name: OCI_SSH_KEY
Secret: [CONTEUDO_COMPLETO_DA_CHAVE_PRIVADA]

Formato:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
[... resto da chave ...]
-----END OPENSSH PRIVATE KEY-----

⚠️ IMPORTANTE: Cole a chave completa, incluindo as linhas BEGIN/END
```

#### 5. Configurar Secrets Opcionais
```
Name: DEPLOY_TIMEOUT
Secret: 1800
Descrição: Timeout de 30 minutos para operações

Name: ROLLBACK_ENABLED
Secret: true
Descrição: Habilita rollback automático em caso de falha

Name: LOG_LEVEL
Secret: info
Descrição: Nível de log (debug/info/warn/error)
```

---

## 🔑 Autenticação SSH

### 🛠️ Geração de Chaves SSH

#### 1. Gerar Par de Chaves
```bash
# Gerar chave RSA 4096 bits
ssh-keygen -t rsa -b 4096 -C "deploy@barbear-ia" -f ~/.ssh/barbear-ia-deploy

# Ou gerar chave Ed25519 (mais moderna)
ssh-keygen -t ed25519 -C "deploy@barbear-ia" -f ~/.ssh/barbear-ia-deploy-ed25519
```

#### 2. Configurar Permissões Locais
```bash
# Definir permissões corretas
chmod 600 ~/.ssh/barbear-ia-deploy
chmod 644 ~/.ssh/barbear-ia-deploy.pub

# Verificar permissões
ls -la ~/.ssh/barbear-ia-deploy*
```

#### 3. Copiar Chave Pública para OCI
```bash
# Método 1: ssh-copy-id (recomendado)
ssh-copy-id -i ~/.ssh/barbear-ia-deploy.pub root@<OCI_HOST>

# Método 2: Manual
cat ~/.ssh/barbear-ia-deploy.pub | ssh root@<OCI_HOST> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

#### 4. Testar Conexão
```bash
# Testar conexão SSH
ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST>

# Testar com timeout
ssh -o ConnectTimeout=10 -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST> "echo 'Conexão OK'"
```

### 🔒 Configuração SSH na OCI

#### 1. Configurar SSH Daemon
```bash
# Editar configuração SSH
sudo nano /etc/ssh/sshd_config

# Configurações recomendadas:
Port 22
PermitRootLogin yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server

# Reiniciar SSH
sudo systemctl restart sshd
```

#### 2. Configurar Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3500/tcp
sudo ufw enable

# Oracle Linux/CentOS
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3500/tcp
sudo firewall-cmd --reload
```

---

## 👥 Permissões e Acessos

### 🏢 GitHub Actions Permissions

Configure as seguintes permissões no workflow:

```yaml
permissions:
  contents: read          # Leitura do repositório
  actions: write         # Upload de artefatos
  deployments: write     # Status de deploy
  packages: read         # Leitura de packages (se necessário)
```

### 🖥️ Permissões na OCI

#### 1. Usuário Root (Recomendado para Deploy)
```bash
# Vantagens:
- Acesso completo ao sistema
- Não requer sudo para Docker
- Simplifica configuração

# Configuração:
- Use chave SSH dedicada
- Desabilite login por senha
- Configure firewall restritivo
```

#### 2. Usuário Não-Root (Alternativa)
```bash
# Criar usuário dedicado
sudo useradd -m -s /bin/bash deploy-user
sudo usermod -aG docker deploy-user
sudo usermod -aG sudo deploy-user

# Configurar sudo sem senha para Docker
echo "deploy-user ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose" | sudo tee /etc/sudoers.d/deploy-user

# Configurar SSH
sudo mkdir -p /home/deploy-user/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy-user/.ssh/
sudo chown -R deploy-user:deploy-user /home/deploy-user/.ssh
sudo chmod 700 /home/deploy-user/.ssh
sudo chmod 600 /home/deploy-user/.ssh/authorized_keys
```

### 📁 Permissões de Diretório

```bash
# Criar estrutura de diretórios
sudo mkdir -p /var/www/barbear-ia
sudo mkdir -p /var/backups/barbear-ia-snapshots
sudo mkdir -p /var/log/barbear-ia

# Definir proprietário
sudo chown -R root:root /var/www/barbear-ia
sudo chown -R root:root /var/backups/barbear-ia-snapshots

# Definir permissões
sudo chmod 755 /var/www/barbear-ia
sudo chmod 755 /var/backups/barbear-ia-snapshots
sudo chmod 644 /var/www/barbear-ia/*
```

---

## ✅ Boas Práticas

### 🔐 Gestão de Secrets

1. **Rotação Regular**
   - Renovar chaves SSH a cada 90 dias
   - Documentar datas de renovação
   - Testar novas chaves antes de remover antigas

2. **Princípio do Menor Privilégio**
   - Usar permissões mínimas necessárias
   - Revisar acessos periodicamente
   - Remover acessos não utilizados

3. **Segregação de Ambientes**
   - Chaves diferentes para dev/staging/prod
   - Secrets separados por ambiente
   - Workflows isolados

### 🛡️ Segurança de Infraestrutura

1. **Firewall**
   ```bash
   # Permitir apenas portas necessárias
   - 22 (SSH) - apenas IPs confiáveis
   - 80 (HTTP) - público
   - 443 (HTTPS) - público
   - 3500 (App) - público ou restrito
   ```

2. **Monitoramento**
   ```bash
   # Logs de acesso SSH
   sudo tail -f /var/log/auth.log
   
   # Logs de deploy
   sudo tail -f /var/log/barbear-ia/deploy.log
   
   # Conexões ativas
   sudo netstat -tulpn
   ```

3. **Backup de Segurança**
   ```bash
   # Backup de chaves SSH
   cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup
   
   # Backup de configurações
   sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
   ```

### 🔍 Validação de Segurança

#### 1. Checklist de Segurança

- [ ] Chaves SSH configuradas corretamente
- [ ] Secrets do GitHub configurados
- [ ] Firewall configurado
- [ ] Login por senha desabilitado
- [ ] Permissões de arquivo corretas
- [ ] Logs de auditoria habilitados
- [ ] Backup de configurações realizado

#### 2. Testes de Segurança

```bash
# Testar conexão SSH
ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST> "echo 'SSH OK'"

# Testar permissões Docker
ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST> "docker --version"

# Testar acesso a diretórios
ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST> "ls -la /var/www/barbear-ia"

# Testar conectividade HTTP
curl -I http://<OCI_HOST>:3500/
```

---

## 📊 Auditoria e Monitoramento

### 📝 Logs de Auditoria

#### 1. Logs do Sistema
```bash
# Logs de autenticação SSH
sudo tail -f /var/log/auth.log | grep ssh

# Logs do Docker
sudo journalctl -u docker -f

# Logs da aplicação
docker-compose logs -f barbear-ia-app
```

#### 2. Logs do Deploy
```bash
# Logs do GitHub Actions
- Disponíveis na interface do GitHub
- Armazenados por 90 dias
- Incluem todos os comandos executados

# Logs locais na OCI
sudo tail -f /var/log/barbear-ia/deploy.log
```

### 🔍 Monitoramento de Segurança

#### 1. Alertas Automáticos
```bash
# Configurar alertas para:
- Tentativas de login SSH falhadas
- Uso excessivo de recursos
- Falhas no deploy
- Acessos não autorizados
```

#### 2. Métricas de Segurança
```bash
# Monitorar:
- Número de conexões SSH
- Tentativas de autenticação
- Uso de recursos do sistema
- Status dos containers
```

---

## 🚨 Procedimentos de Emergência

### 🔒 Comprometimento de Chaves

#### 1. Ação Imediata
```bash
# 1. Revogar acesso SSH
sudo nano /root/.ssh/authorized_keys
# Remover chave comprometida

# 2. Gerar novas chaves
ssh-keygen -t rsa -b 4096 -C "deploy@barbear-ia-new" -f ~/.ssh/barbear-ia-deploy-new

# 3. Atualizar GitHub Secrets
# Substituir OCI_SSH_KEY com nova chave privada

# 4. Testar nova configuração
ssh -i ~/.ssh/barbear-ia-deploy-new root@<OCI_HOST>
```

#### 2. Investigação
```bash
# Verificar logs de acesso
sudo grep "ssh" /var/log/auth.log | tail -50

# Verificar conexões ativas
sudo netstat -tulpn | grep :22

# Verificar processos suspeitos
sudo ps aux | grep -v grep
```

### 🛡️ Bloqueio de Acesso

#### 1. Bloqueio Temporário
```bash
# Bloquear IP específico
sudo iptables -A INPUT -s <IP_SUSPEITO> -j DROP

# Desabilitar SSH temporariamente
sudo systemctl stop sshd
```

#### 2. Recuperação de Acesso
```bash
# Via Console OCI
1. Acesse o Console da Oracle Cloud
2. Navegue para Compute > Instances
3. Conecte via Console Connection
4. Execute comandos de recuperação
```

### 📞 Contatos de Emergência

- **Administrador do Sistema**: [Inserir contato]
- **Equipe de Segurança**: [Inserir contato]
- **Suporte OCI**: [Inserir contato]
- **GitHub Support**: support@github.com

---

## 📋 Checklist de Implementação

### ✅ Configuração Inicial

- [ ] Gerar par de chaves SSH
- [ ] Configurar chave pública na OCI
- [ ] Configurar secrets no GitHub
- [ ] Testar conexão SSH
- [ ] Configurar firewall na OCI
- [ ] Desabilitar login por senha
- [ ] Configurar permissões de diretório
- [ ] Testar deploy manual

### ✅ Validação de Segurança

- [ ] Executar checklist de segurança
- [ ] Testar todos os cenários de deploy
- [ ] Verificar logs de auditoria
- [ ] Testar procedimentos de rollback
- [ ] Documentar configurações
- [ ] Treinar equipe nos procedimentos

### ✅ Monitoramento Contínuo

- [ ] Configurar alertas de segurança
- [ ] Estabelecer rotina de auditoria
- [ ] Planejar rotação de chaves
- [ ] Manter documentação atualizada
- [ ] Revisar acessos periodicamente

---

**🔒 Lembre-se**: A segurança é um processo contínuo. Revise e atualize estas configurações regularmente.

**📅 Última Atualização**: Janeiro 2025