# 🚀 Configuração do GitHub Actions para Deploy Automático na OCI

Este documento descreve como configurar o GitHub Actions para deploy automático do **Barbear.IA** na Oracle Cloud Infrastructure (OCI).

## 📋 Pré-requisitos

- Repositório GitHub com o código do Barbear.IA
- Instância OCI configurada e funcionando
- Acesso SSH à instância OCI
- Docker e Docker Compose instalados na OCI

## 🔐 Secrets Necessários no GitHub

Configure os seguintes secrets no seu repositório GitHub:

### Navegação: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### ✅ **Secrets que VOCÊ deve configurar:**

| Secret Name | Descrição | Exemplo |
|-------------|-----------|---------|
| `OCI_HOST` | IP público da instância OCI | `129.153.86.168` |
| `OCI_USERNAME` | Usuário SSH (geralmente `ubuntu`) | `ubuntu` |
| `OCI_SSH_KEY` | Chave SSH privada para acesso à OCI | Conteúdo do arquivo `.key` |

#### 🤖 **Secrets automáticos (NÃO configurar):**

| Secret Name | Descrição |
|-------------|-----------||
| `GITHUB_TOKEN` | ❌ **Automático** - Fornecido automaticamente pelo GitHub Actions |

> **⚠️ Importante:** O `GITHUB_TOKEN` é criado automaticamente pelo GitHub em cada execução do workflow. Você NÃO precisa configurá-lo manualmente!

### 🔑 Como obter a chave SSH privada:

```bash
# No seu computador local, visualize o conteúdo da chave privada:
cat ssh-key-2025-08-28.key

# Copie TODO o conteúdo (incluindo -----BEGIN e -----END)
# Cole no secret OCI_SSH_KEY
```

## ⚙️ Configuração do Workflow

O workflow está configurado em `.github/workflows/deploy.yml` e inclui:

### 🧪 **Job de Teste (`test`)**
- ✅ Checkout do código
- ✅ Setup do Node.js 18
- ✅ Instalação de dependências
- ✅ Execução de linting
- ✅ Execução de testes com cobertura
- ✅ Build da aplicação
- ✅ Upload dos artifacts de build

### 🚀 **Job de Deploy (`deploy`)**
- ✅ Sincronização automática de arquivos do GitHub para OCI
- ✅ Deploy com zero downtime
- ✅ Health check com retry automático
- ✅ Rollback automático em caso de falha
- ✅ Limpeza de imagens não utilizadas

## 🎯 Triggers do Workflow

O workflow é executado automaticamente quando:

- **Push para branch `freezer-project`**: Deploy automático
- **Pull Request para `freezer-project`**: Apenas testes
- **Execução manual**: Via interface do GitHub Actions

## 📁 Arquivos Sincronizados

Os seguintes arquivos são automaticamente sincronizados do GitHub para a OCI:

- `docker-compose.yml`
- `Dockerfile`
- `nginx.conf`
- `package.json`
- `.dockerignore`

## 🔄 Processo de Deploy

### 1. **Sincronização**
- Backup da configuração atual
- Download dos arquivos atualizados do GitHub
- Validação dos downloads

### 2. **Build e Deploy**
- Verificação do container atual
- Build da nova imagem Docker
- Parada graceful do container atual
- Inicialização da nova versão

### 3. **Validação**
- Health check com 5 tentativas
- Teste de conectividade na porta 3500
- Rollback automático se falhar

### 4. **Finalização**
- Limpeza de imagens antigas
- Relatório de status final

## 🌐 URLs de Acesso

Após o deploy bem-sucedido:

- **Aplicação**: `http://[OCI_HOST]:3500`
- **Health Check**: `http://[OCI_HOST]:3500/health`

## 🛠️ Comandos Úteis

### Verificar status na OCI:
```bash
ssh -i ssh-key-2025-08-28.key ubuntu@[OCI_HOST]
cd /var/www/Barbear.IA
docker-compose ps
docker-compose logs barbear-ia-frontend
```

### Executar deploy manual:
```bash
# Via GitHub Actions (interface web)
# Ou via SSH direto na OCI:
cd /var/www/Barbear.IA
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🚨 Troubleshooting

### ❌ **Erro mais comum: Dessincronização de Dependências**

**Sintoma:** `npm ci` falha com erro sobre package-lock.json desatualizado

**Causa:** Versões no `package.json` e `package-lock.json` não estão sincronizadas

**Solução:**
```bash
# 1. Regenerar package-lock.json
rm package-lock.json
npm install

# 2. Commitar as alterações
git add package-lock.json
git commit -m "fix: regenerar package-lock.json para sincronizar dependências"
git push

# 3. Validar sincronização
npm ci --dry-run
```

**Prevenção:** Sempre execute `npm ci --dry-run` antes de fazer push

### 🐳 **Erro de Permissão Docker Buildx**

**Sintoma:** `ERROR: open /home/***/.docker/buildx/.lock: permission denied`

**Solução:**
```bash
# Via SSH na instância OCI
sudo chown -R ubuntu:ubuntu /home/ubuntu/.docker/
sudo chmod -R 755 /home/ubuntu/.docker/
sudo systemctl restart docker
```

### 💾 **Problemas de Memória/Swap**

**Sintoma:** Build falha por falta de memória

**Solução:** Configurar swap na OCI:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 🏥 **Deploy falha no health check:**
1. Verifique os logs: `docker-compose logs barbear-ia-frontend`
2. Verifique se a porta 3500 está aberta no firewall
3. Teste conectividade local: `curl http://localhost:3500/`

### 🔐 **Erro de permissão SSH:**
1. Verifique se a chave SSH está correta no secret
2. Teste conexão manual: `ssh -i ssh-key-2025-08-28.key ubuntu@[OCI_HOST]`

### 📁 **Arquivos não sincronizam:**
1. Verifique se o `GITHUB_TOKEN` tem permissões adequadas
2. Confirme se os arquivos existem no repositório

### 🔍 **Comandos de Diagnóstico Avançado:**

```bash
# Verificar sincronização de dependências
npm ci --dry-run

# Verificar espaço em disco na OCI
df -h

# Verificar memória disponível
free -h

# Verificar logs detalhados do Docker
docker-compose logs --tail=50 barbear-ia-frontend

# Verificar status dos contêineres
docker-compose ps

# Testar build local
docker-compose build --no-cache barbear-ia-frontend
```

## 📊 Monitoramento

O workflow fornece logs detalhados com emojis para fácil identificação:

- 🚀 Início de processos
- ✅ Operações bem-sucedidas
- ❌ Erros e falhas
- ⏳ Operações em andamento
- 📦 Backups e restaurações
- 🔄 Rollbacks

## 🔒 Segurança

- Chaves SSH são armazenadas como secrets criptografados
- Backups automáticos antes de cada deploy
- Rollback automático em caso de falha
- Limpeza automática de imagens antigas