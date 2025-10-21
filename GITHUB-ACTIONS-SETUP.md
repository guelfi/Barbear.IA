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

| Secret Name | Descrição | Exemplo |
|-------------|-----------|---------|
| `OCI_HOST` | IP público da instância OCI | `129.153.86.168` |
| `OCI_USERNAME` | Usuário SSH (geralmente `ubuntu`) | `ubuntu` |
| `OCI_SSH_KEY` | Chave SSH privada para acesso à OCI | Conteúdo do arquivo `.key` |
| `GITHUB_TOKEN` | Token de acesso ao GitHub (automático) | Gerado automaticamente |

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

- **Push para branch `main`**: Deploy automático
- **Pull Request para `main`**: Apenas testes
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

### Deploy falha no health check:
1. Verifique os logs: `docker-compose logs barbear-ia-frontend`
2. Verifique se a porta 3500 está aberta no firewall
3. Teste conectividade local: `curl http://localhost:3500/`

### Erro de permissão SSH:
1. Verifique se a chave SSH está correta no secret
2. Teste conexão manual: `ssh -i ssh-key-2025-08-28.key ubuntu@[OCI_HOST]`

### Arquivos não sincronizam:
1. Verifique se o `GITHUB_TOKEN` tem permissões adequadas
2. Confirme se os arquivos existem no repositório

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