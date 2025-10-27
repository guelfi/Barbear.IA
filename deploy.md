# 🚀 DOCUMENTAÇÃO DE DEPLOY - BARBEAR.IA

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Deploy](#arquitetura-de-deploy)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração de Segurança](#configuração-de-segurança)
5. [Deploy Automatizado](#deploy-automatizado)
6. [Scripts de Fallback Manual](#scripts-de-fallback-manual)
7. [Procedimentos de Rollback](#procedimentos-de-rollback)
8. [Monitoramento e Logs](#monitoramento-e-logs)
9. [Troubleshooting](#troubleshooting)
10. [Changelog](#changelog)

---

## 🎯 Visão Geral

O sistema de deploy do Barbear.IA utiliza GitHub Actions para automatizar o processo de build, teste e deploy na Oracle Cloud Infrastructure (OCI). O workflow implementa verificações robustas de integridade, sistema de rollback automático e procedimentos de fallback manual.

### ⏱️ Tempos de Execução dos Jobs

| Job | Tempo Médio | Descrição |
|-----|-------------|-----------|
| `integrity-check` | 30s | Validação de integridade e preparação |
| `test` | 38s | Testes automatizados e linting |
| `deploy` | 4m 30s | Build e deploy completo com verificações |
| `production-tests` | 1m 57s | Testes de produção |
| `cleanup-and-verify` | 45s | Limpeza final e verificação |
| **Total** | **~8m** | Tempo total do pipeline |

---

## 🏗️ Arquitetura de Deploy

```mermaid
graph TD
    A[Push/Manual Trigger] --> B[Integrity Check]
    B --> C[Tests & Linting]
    C --> D[Deploy Job]
    D --> E[Health Check]
    E --> F{Deploy OK?}
    F -->|Sim| G[Production Tests]
    F -->|Não| H[Rollback Automático]
    G --> I[Cleanup & Verify]
    H --> J[Notificação de Falha]
    
    subgraph "Deploy Job Details"
        D1[Backup Atual]
        D2[Limpeza Completa]
        D3[Build Nova Imagem]
        D4[Deploy Container]
        D5[Health Check]
    end
    
    D --> D1 --> D2 --> D3 --> D4 --> D5
```

### 🔄 Fluxo de Deploy Detalhado

1. **Preparação e Validação**
   - Captura informações do commit (SHA, timestamp)
   - Gera checksums SHA-256 de arquivos críticos
   - Valida integridade do código-fonte

2. **Backup e Limpeza**
   - Backup da configuração atual
   - Backup da imagem Docker em execução
   - Limpeza completa do sistema Docker (opcional)

3. **Build e Deploy**
   - Build da nova imagem sem cache (force rebuild)
   - Teste da imagem antes do deploy
   - Deploy com zero downtime
   - Verificações de saúde robustas

4. **Verificação e Rollback**
   - Health checks com retentativas
   - Rollback automático em caso de falha
   - Notificações de status

---

## ✅ Pré-requisitos

### 🖥️ Ambiente Local

- **Git**: Versão 2.25+
- **Docker**: Versão 20.10+
- **Docker Compose**: Versão 2.0+
- **Node.js**: Versão 18.x (para desenvolvimento)
- **SSH Client**: Para acesso à OCI

### ☁️ Oracle Cloud Infrastructure (OCI)

- **Instância Compute**: VM.Standard.E2.1.Micro (ou superior)
- **Sistema Operacional**: Ubuntu 20.04+ ou Oracle Linux 8+
- **Recursos Mínimos**:
  - CPU: 1 vCPU
  - RAM: 1GB
  - Armazenamento: 50GB
  - Rede: Acesso HTTP/HTTPS (portas 80, 443, 3500)

### 🔐 Configurações de Segurança

- **Firewall**: Portas 22 (SSH), 80 (HTTP), 443 (HTTPS), 3500 (App)
- **SSH**: Acesso por chave pública/privada
- **Docker**: Instalado e configurado
- **Usuário**: Acesso root ou sudo

---

## 🔒 Configuração de Segurança

### 🗝️ Secrets do GitHub

Configure os seguintes secrets no repositório GitHub:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `OCI_HOST` | IP ou hostname da instância OCI | `123.456.789.012` |
| `OCI_USERNAME` | Usuário SSH (recomendado: root) | `root` |
| `OCI_SSH_KEY` | Chave SSH privada (formato PEM) | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `DEPLOY_TIMEOUT` | Timeout para operações (segundos) | `1800` |
| `ROLLBACK_ENABLED` | Habilitar rollback automático | `true` |
| `LOG_LEVEL` | Nível de log (debug/info/warn/error) | `info` |

### 🔑 Configuração SSH

1. **Gerar par de chaves SSH**:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "deploy@barbear-ia" -f ~/.ssh/barbear-ia-deploy
   ```

2. **Copiar chave pública para OCI**:
   ```bash
   ssh-copy-id -i ~/.ssh/barbear-ia-deploy.pub root@<OCI_HOST>
   ```

3. **Testar conexão**:
   ```bash
   ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST>
   ```

### 🛡️ Permissões Mínimas

**No GitHub Actions**:
- `contents: read` - Leitura do repositório
- `actions: write` - Upload de artefatos
- `deployments: write` - Status de deploy

**Na OCI**:
- Acesso root ou usuário com sudo
- Permissões para Docker (grupo `docker`)
- Acesso de escrita em `/var/www/barbear-ia`

---

## 🤖 Deploy Automatizado

### 🚀 Triggers de Deploy

O deploy é executado automaticamente nos seguintes casos:

1. **Push na branch `main`**
2. **Execução manual** (workflow_dispatch)
3. **Cron semanal** (domingos às 02:00 UTC)

### ⚙️ Parâmetros de Execução Manual

Ao executar manualmente, você pode configurar:

- **Force Rebuild**: Força rebuild completo sem cache
- **Skip Tests**: Pula execução de testes (não recomendado)

### 📊 Verificações de Integridade

O sistema implementa múltiplas verificações:

1. **Checksum SHA-256**: Arquivos críticos (`package.json`, `Dockerfile`, etc.)
2. **Git Commit**: Validação do commit exato
3. **Timestamp**: Controle de versão temporal
4. **Health Check**: Verificação de funcionamento da aplicação
5. **Container Status**: Status do container Docker

### 🔄 Processo de Deploy

```bash
# 1. Preparação
- Captura commit SHA e timestamp
- Gera checksums de integridade
- Valida pré-requisitos

# 2. Backup
- Backup da configuração atual
- Backup da imagem Docker
- Backup de volumes (se existirem)

# 3. Limpeza (se force rebuild)
- Remove containers antigos
- Remove imagens não utilizadas
- Limpa cache do Docker

# 4. Build
- Build da nova imagem
- Teste da imagem
- Validação de integridade

# 5. Deploy
- Para versão atual
- Inicia nova versão
- Aguarda inicialização

# 6. Verificação
- Health checks HTTP
- Verificação de logs
- Validação de funcionamento

# 7. Finalização
- Limpeza de recursos
- Salvamento de metadados
- Notificação de sucesso
```

---

## 🛠️ Scripts de Fallback Manual

Em caso de falha do GitHub Actions, utilize os scripts de fallback manual:

### 📜 Script Bash (`scripts/deploy-fallback.sh`)

```bash
# Deploy completo
./scripts/deploy-fallback.sh --force-rebuild

# Deploy sem backup
./scripts/deploy-fallback.sh --skip-backup

# Rollback
./scripts/deploy-fallback.sh --rollback

# Simulação (dry run)
./scripts/deploy-fallback.sh --dry-run
```

### 🐍 Script Python (`scripts/deploy-fallback.py`)

```bash
# Instalar dependências
pip install paramiko requests

# Deploy completo
python scripts/deploy-fallback.py --force-rebuild

# Deploy sem backup
python scripts/deploy-fallback.py --skip-backup

# Rollback
python scripts/deploy-fallback.py --rollback

# Simulação (dry run)
python scripts/deploy-fallback.py --dry-run
```

### ⚙️ Configuração dos Scripts

Crie um arquivo `.env` na raiz do projeto:

```env
OCI_HOST=123.456.789.012
OCI_USERNAME=root
OCI_SSH_KEY=~/.ssh/barbear-ia-deploy
PROJECT_NAME=barbear-ia
CONTAINER_NAME=barbear-ia-app
PORT=3500
REMOTE_PATH=/var/www/barbear-ia
```

---

## ↩️ Procedimentos de Rollback

### 🔄 Rollback Automático

O sistema implementa rollback automático em caso de:

- Falha no health check após deploy
- Container não inicia corretamente
- Aplicação não responde HTTP
- Erros críticos detectados nos logs

### 🔧 Rollback Manual

#### Via GitHub Actions:
1. Execute o workflow manualmente
2. Marque a opção "Rollback Mode"
3. Aguarde a conclusão

#### Via Script:
```bash
# Bash
./scripts/deploy-fallback.sh --rollback

# Python
python scripts/deploy-fallback.py --rollback
```

#### Via SSH Direto:
```bash
# Conectar à OCI
ssh -i ~/.ssh/barbear-ia-deploy root@<OCI_HOST>

# Navegar para o diretório
cd /var/www/barbear-ia

# Restaurar backup mais recente
LATEST_BACKUP=$(ls -t /var/backups/barbear-ia-snapshots/backup-*-docker-compose.yml | head -1)
cp "$LATEST_BACKUP" docker-compose.yml

# Reiniciar aplicação
docker-compose down
docker-compose up -d
```

### 📋 Verificação de Rollback

Após o rollback, verifique:

1. **Status do container**: `docker-compose ps`
2. **Logs da aplicação**: `docker-compose logs -f barbear-ia-app`
3. **Acesso HTTP**: `curl http://localhost:3500/`
4. **Funcionalidade**: Teste manual da aplicação

---

## 📊 Monitoramento e Logs

### 📈 Métricas de Deploy

O sistema coleta as seguintes métricas:

- **Tempo de deploy**: Duração total do processo
- **Taxa de sucesso**: Percentual de deploys bem-sucedidos
- **Frequência de rollback**: Número de rollbacks executados
- **Tempo de downtime**: Tempo de indisponibilidade (objetivo: 0s)

### 📝 Logs Disponíveis

1. **GitHub Actions**: Logs detalhados de cada job
2. **Container Logs**: `docker-compose logs barbear-ia-app`
3. **Sistema**: `/var/log/syslog` na OCI
4. **Deploy Metadata**: Arquivos JSON com informações do deploy

### 🔍 Comandos de Monitoramento

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f barbear-ia-app

# Uso de recursos
docker stats

# Espaço em disco
df -h

# Verificar saúde da aplicação
curl -I http://localhost:3500/

# Últimos deploys
ls -la /var/backups/barbear-ia-snapshots/
```

---

## 🔧 Troubleshooting

### ❌ Problemas Comuns

#### 1. **Falha na Conexão SSH**
```
Erro: Permission denied (publickey)
```
**Solução**:
- Verificar se a chave SSH está correta no GitHub Secrets
- Testar conexão manual: `ssh -i ~/.ssh/key root@host`
- Verificar permissões da chave: `chmod 600 ~/.ssh/key`

#### 2. **Falha no Build Docker**
```
Erro: failed to solve: process "/bin/sh -c npm install" didn't complete successfully
```
**Solução**:
- Verificar `package.json` e dependências
- Limpar cache: `docker system prune -a`
- Verificar espaço em disco na OCI

#### 3. **Health Check Falha**
```
Erro: Health check failed after 10 retries
```
**Solução**:
- Verificar logs do container: `docker-compose logs barbear-ia-app`
- Verificar porta da aplicação (3500)
- Verificar configuração do Nginx
- Testar acesso local: `curl http://localhost:3500/`

#### 4. **Rollback Falha**
```
Erro: No backup found for rollback
```
**Solução**:
- Verificar backups disponíveis: `ls /var/backups/barbear-ia-snapshots/`
- Deploy manual com versão anterior
- Restaurar snapshot da OCI (se disponível)

### 🆘 Procedimentos de Emergência

#### 1. **Acesso Direto à OCI**
```bash
# Via Console OCI
1. Acesse o Console da Oracle Cloud
2. Navegue para Compute > Instances
3. Conecte via Console Connection
4. Execute comandos de recuperação
```

#### 2. **Restauração Manual**
```bash
# Parar todos os containers
docker stop $(docker ps -q)

# Remover containers problemáticos
docker rm $(docker ps -aq)

# Restaurar imagem de backup
docker load -i /var/backups/barbear-ia-snapshots/backup-latest-image.tar

# Reiniciar aplicação
cd /var/www/barbear-ia
docker-compose up -d
```

#### 3. **Contatos de Emergência**
- **Desenvolvedor Principal**: [Inserir contato]
- **DevOps**: [Inserir contato]
- **Suporte OCI**: [Inserir contato]

---

## 📋 Changelog

### Versão 2.0.0 (2025-01-XX)
- ✅ Implementação de verificações de integridade robustas
- ✅ Sistema de rollback automático
- ✅ Scripts de fallback manual (Bash e Python)
- ✅ Documentação completa de deploy
- ✅ Melhorias na segurança SSH
- ✅ Timeout configurável para operações
- ✅ Limpeza completa opcional do Docker

### Versão 1.0.0 (2024-XX-XX)
- ✅ Deploy básico via GitHub Actions
- ✅ Build e deploy na OCI
- ✅ Testes automatizados
- ✅ Configuração inicial do Docker

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Oracle Cloud Infrastructure](https://docs.oracle.com/en-us/iaas/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

**📞 Suporte**: Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

**🔄 Última Atualização**: Janeiro 2025

test:
Current runner version: '2.329.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
Complete job name: test
0s
Run actions/checkout@v4
Syncing repository: guelfi/Barbear.IA
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/14acd524-f1b5-491e-a9e4-67f3eb43c234' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
Deleting the contents of '/home/runner/work/Barbear.IA/Barbear.IA'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
af537209c33a8b05e2c0498ede43609c90dbab5b
3s
Run actions/setup-node@v4
Found in cache @ /opt/hostedtoolcache/node/18.20.8/x64
Environment details
4s
Run npm cache clean --force
npm warn using --force Recommended protections disabled.
Cache verified and compressed (~/.npm/_cacache)
Content verified: 0 (0 bytes)
Index entries: 0
Finished in 0.017s
18s
Run rm -rf node_modules package-lock.json

added 169 packages in 17s
0s
Run rm -rf node_modules/.vite
0s
Run npm run lint || echo "Linting completed with warnings"

> barbear-ia@0.1.0 lint
> echo "No linting configured" && exit 0

No linting configured
0s
Run npm test -- --coverage --watchAll=false

> barbear-ia@0.1.0 test
> echo "No tests specified" && exit 0 --coverage --watchAll=false

No tests specified
9s
Run echo "=== Node / npm versions ==="
=== Node / npm versions ===
v18.20.8
10.8.2
=== Listing project files ===
total 288
drwxr-xr-x  8 runner runner   4096 Oct 25 17:03 .
drwxr-xr-x  3 runner runner   4096 Oct 25 17:03 ..
-rw-r--r--  1 runner runner   1155 Oct 25 17:03 .dockerignore
drwxr-xr-x  7 runner runner   4096 Oct 25 17:03 .git
drwxr-xr-x  3 runner runner   4096 Oct 25 17:03 .github
-rw-r--r--  1 runner runner   2712 Oct 25 17:03 .gitignore
-rw-r--r--  1 runner runner    820 Oct 25 17:03 .gitmessage
drwxr-xr-x  3 runner runner   4096 Oct 25 17:03 .kiro
-rw-r--r--  1 runner runner   4560 Oct 25 17:03 DEPLOY-PROCESS.md
-rw-r--r--  1 runner runner   1186 Oct 25 17:03 Dockerfile
-rw-r--r--  1 runner runner  16685 Oct 25 17:03 README.md
-rw-r--r--  1 runner runner    428 Oct 25 17:03 docker-compose.yml
-rw-r--r--  1 runner runner    910 Oct 25 17:03 index.html
-rw-r--r--  1 runner runner    308 Oct 25 17:03 nginx-proxy-config.conf
-rw-r--r--  1 runner runner   1903 Oct 25 17:03 nginx.conf
drwxr-xr-x 96 runner runner   4096 Oct 25 17:03 node_modules
-rw-r--r--  1 runner runner 178090 Oct 25 17:03 package-lock.json
-rw-r--r--  1 runner runner   2745 Oct 25 17:03 package.json
drwxr-xr-x  2 runner runner   4096 Oct 25 17:03 public
drwxr-xr-x 10 runner runner   4096 Oct 25 17:03 src
-rw-r--r--  1 runner runner   1679 Oct 25 17:03 ssh-key-2025-08-28.key
-rw-r--r--  1 runner runner   1016 Oct 25 17:03 tsconfig.json
-rw-r--r--  1 runner runner    252 Oct 25 17:03 tsconfig.node.json
-rw-r--r--  1 runner runner   1413 Oct 25 17:03 vite.config.ts
=== Running Vite build with DEBUG=vite:* ===

> barbear-ia@0.1.0 build
> vite build

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
2025-10-25T17:03:29.195Z vite:config bundled config file loaded in 33.10ms
2025-10-25T17:03:29.220Z vite:config using resolved config: {
  plugins: [
    'vite:build-metadata',
    'vite:watch-package-data',
    'vite:pre-alias',
    'alias',
    'vite:modulepreload-polyfill',
    'vite:resolve',
    'vite:html-inline-proxy',
    'vite:css',
    'vite:esbuild',
    'vite:json',
    'vite:wasm-helper',
    'vite:worker',
    'vite:asset',
    'vite:react-swc',
    'vite:wasm-fallback',
    'vite:define',
    'vite:css-post',
    'vite:build-html',
    'vite:worker-import-meta-url',
    'vite:asset-import-meta-url',
    'vite:force-systemjs-wrap-complete',
    'commonjs',
    'vite:data-uri',
    'vite:dynamic-import-vars',
    'vite:import-glob',
    'vite:build-import-analysis',
    'vite:esbuild-transpile',
    'vite:terser',
    'vite:reporter',
    'vite:load-fallback'
  ],
  resolve: {
    mainFields: [ 'browser', 'module', 'jsnext:main', 'jsnext' ],
    conditions: [],
    extensions: [ '.js', '.jsx', '.ts', '.tsx', '.json' ],
    dedupe: [],
    preserveSymlinks: false,
    alias: [ [Object], [Object], [Object] ]
  },
  build: {
    target: 'esnext',
    cssTarget: 'esnext',
    outDir: 'build',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: { output: [Object], onwarn: [Function: onwarn] },
    minify: 'terser',
    terserOptions: { compress: [Object] },
    write: true,
    emptyOutDir: true,
    copyPublicDir: true,
    manifest: false,
    lib: false,
    ssr: false,
    ssrManifest: false,
    ssrEmitAssets: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    watch: null,
    commonjsOptions: { include: [Array], extensions: [Array] },
    dynamicImportVarsOptions: { warnOnError: true, exclude: [Array] },
    modulePreload: { polyfill: true },
    cssMinify: true
  },
  server: {
    preTransformRequests: true,
    port: 3500,
    host: '0.0.0.0',
    open: true,
    hmr: { port: 3501, host: 'localhost' },
    watch: { usePolling: true, interval: 100 },
    cors: true,
    strictPort: false,
    sourcemapIgnoreList: [Function: isInNodeModules$1],
    middlewareMode: false,
    fs: {
      strict: true,
      allow: [Array],
      deny: [Array],
      cachedChecks: undefined
    }
  },
  esbuild: {
    jsxDev: false,
    jsx: 'automatic',
    jsxImportSource: 'react',
    tsconfigRaw: { compilerOptions: [Object] }
  },
  configFile: '/home/runner/work/Barbear.IA/Barbear.IA/vite.config.ts',
  configFileDependencies: [ '/home/runner/work/Barbear.IA/Barbear.IA/vite.config.ts' ],
  inlineConfig: {
    root: undefined,
    base: undefined,
    mode: undefined,
    configFile: undefined,
    logLevel: undefined,
    clearScreen: undefined,
    build: {}
  },
  root: '/home/runner/work/Barbear.IA/Barbear.IA',
  base: '/',
  decodedBase: '/',
  rawBase: '/',
  publicDir: '/home/runner/work/Barbear.IA/Barbear.IA/public',
  cacheDir: '/home/runner/work/Barbear.IA/Barbear.IA/node_modules/.vite',
  command: 'build',
  mode: 'production',
  ssr: {
    target: 'node',
    optimizeDeps: { noDiscovery: true, esbuildOptions: [Object] }
  },
  isWorker: false,
  mainConfig: null,
  bundleChain: [],
  isProduction: true,
  css: { lightningcss: undefined },
  preview: {
    port: undefined,
    strictPort: false,
    host: '0.0.0.0',
    allowedHosts: undefined,
    https: undefined,
    open: true,
    proxy: undefined,
    cors: true,
    headers: undefined
  },
  envDir: '/home/runner/work/Barbear.IA/Barbear.IA',
  env: { BASE_URL: '/', MODE: 'production', DEV: false, PROD: true },
  assetsInclude: [Function: assetsInclude],
  logger: {
    hasWarned: false,
    info: [Function: info],
    warn: [Function: warn],
    warnOnce: [Function: warnOnce],
    error: [Function: error],
    clearScreen: [Function: clearScreen],
    hasErrorLogged: [Function: hasErrorLogged]
  },
  packageCache: Map(1) {
    'fnpd_/home/runner/work/Barbear.IA/Barbear.IA' => {
      dir: '/home/runner/work/Barbear.IA/Barbear.IA',
      data: [Object],
      hasSideEffects: [Function: hasSideEffects],
      webResolvedImports: {},
      nodeResolvedImports: {},
      setResolvedCache: [Function: setResolvedCache],
      getResolvedCache: [Function: getResolvedCache]
    },
    set: [Function (anonymous)]
  },
  createResolver: [Function: createResolver],
  optimizeDeps: {
    holdUntilCrawlEnd: true,
    esbuildOptions: { preserveSymlinks: false }
  },
  worker: { format: 'iife', plugins: '() => plugins', rollupOptions: {} },
  appType: 'spa',
  experimental: { importGlobRestoreExtension: false, hmrPartialAccept: false },
  webSocketToken: '1S_sReV_P21z',
  additionalAllowedHosts: [ '0.0.0.0', 'localhost', '0.0.0.0' ],
  getSortedPlugins: [Function: getSortedPlugins],
  getSortedPluginHooks: [Function: getSortedPluginHooks]
}
vite v5.4.21 building for production...
transforming...
✓ 2924 modules transformed.
rendering chunks...
[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/dashboard/Dashboard.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx, /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/dashboard/SuperAdminDashboard.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/appointments/AppointmentCalendar.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx, /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/appointments/AppointmentForm.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/clients/ClientList.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx, /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/clients/ClientForm.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/clients/ClientProfile.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/barbers/BarberList.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx, /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/barbers/BarberForm.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/barbers/BarberProfile.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/barbershop/BarbershopProfile.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/services/ServiceList.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx, /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

[plugin:vite:reporter] [plugin vite:reporter] 
(!) /home/runner/work/Barbear.IA/Barbear.IA/src/components/services/ServiceForm.tsx is dynamically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/components/lazy/LazyComponents.tsx but also statically imported by /home/runner/work/Barbear.IA/Barbear.IA/src/App.tsx, dynamic import will not move module into another chunk.

computing gzip size...
build/index.html                   1.16 kB │ gzip:   0.50 kB
build/assets/index-C22MMgxc.css   74.93 kB │ gzip:  13.52 kB
build/assets/ui-DjohIiad.js       81.57 kB │ gzip:  27.42 kB
build/assets/vendor-fsMkNaLw.js  139.87 kB │ gzip:  44.91 kB
build/assets/index-DXRuvu0J.js   440.52 kB │ gzip: 115.15 kB
✓ built in 7.83s
✅ Build concluído com sucesso
0s
Run actions/upload-artifact@v4
With the provided path, there will be 11 files uploaded
Artifact name is valid!
Root directory input is valid!
Beginning upload of artifact content to blob storage
Uploaded bytes 206040
Finished uploading artifact content to blob storage!
SHA256 digest of uploaded artifact zip is 835379b0cca937897776cb2b77ac393565f5a5eabbd54ec66ac1a67f2f6688d2
Finalizing artifact upload
Artifact build-files.zip successfully finalized. Artifact ID 4371373081
Artifact build-files has been successfully uploaded! Final size is 206040 bytes. Artifact ID is 4371373081
Artifact download URL: https://github.com/guelfi/Barbear.IA/actions/runs/18805954593/artifacts/4371373081
1s
Post job cleanup.
0s
Post job cleanup.
/usr/bin/git version
git version 2.51.0
Temporarily overriding HOME='/home/runner/work/_temp/47ec1f33-8ea9-44c3-b679-234fd004823f' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
0s
Cleaning up orphan processes
deploy:
Current runner version: '2.329.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
Download action repository 'appleboy/ssh-action@v1.0.0' (SHA:55dabf81b49d4120609345970c91507e2d734799)
Complete job name: deploy
4s
Build container for action use: '/home/runner/work/_actions/appleboy/ssh-action/v1.0.0/Dockerfile'.
0s
Run actions/checkout@v4
Syncing repository: guelfi/Barbear.IA
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/73bf834f-0e16-44ff-b17b-e13b5392b7f4' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
Deleting the contents of '/home/runner/work/Barbear.IA/Barbear.IA'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
af537209c33a8b05e2c0498ede43609c90dbab5b
5s
Run appleboy/ssh-action@v1.0.0
/usr/bin/docker run --name ff6122ac677994d954206a9a3fd852a23857a_d792d3 --label 3ff612 --workdir /github/workspace --rm -e "PROJECT_NAME" -e "CONTAINER_NAME" -e "PORT" -e "NGINX_CONTAINER" -e "HEALTH_CHECK_TIMEOUT" -e "PERFORMANCE_THRESHOLD" -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_SCRIPT" -e "INPUT_PORT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION_DAYS" -e "GITHUB_RUN_ATTEMPT" -e "GITHUB_ACTOR_ID" -e "GITHUB_ACTOR" -e "GITHUB_WORKFLOW" -e "GITHUB_HEAD_REF" -e "GITHUB_BASE_REF" -e "GITHUB_EVENT_NAME" -e "GITHUB_SERVER_URL" -e "GITHUB_API_URL" -e "GITHUB_GRAPHQL_URL" -e "GITHUB_REF_NAME" -e "GITHUB_REF_PROTECTED" -e "GITHUB_REF_TYPE" -e "GITHUB_WORKFLOW_REF" -e "GITHUB_WORKFLOW_SHA" -e "GITHUB_REPOSITORY_ID" -e "GITHUB_TRIGGERING_ACTOR" -e "GITHUB_WORKSPACE" -e "GITHUB_ACTION" -e "GITHUB_EVENT_PATH" -e "GITHUB_ACTION_REPOSITORY" -e "GITHUB_ACTION_REF" -e "GITHUB_PATH" -e "GITHUB_ENV" -e "GITHUB_STEP_SUMMARY" -e "GITHUB_STATE" -e "GITHUB_OUTPUT" -e "RUNNER_OS" -e "RUNNER_ARCH" -e "RUNNER_NAME" -e "RUNNER_ENVIRONMENT" -e "RUNNER_TOOL_CACHE" -e "RUNNER_TEMP" -e "RUNNER_WORKSPACE" -e "ACTIONS_RUNTIME_URL" -e "ACTIONS_RUNTIME_TOKEN" -e "ACTIONS_CACHE_URL" -e "ACTIONS_RESULTS_URL" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" -v "/home/runner/work/_temp/_runner_file_commands":"/github/file_commands" -v "/home/runner/work/Barbear.IA/Barbear.IA":"/github/workspace" 3ff612:2ac677994d954206a9a3fd852a23857a
======CMD======
echo "🚀 Iniciando sincronização do Barbear.IA..."

# Create project directory if not exists
sudo mkdir -p /var/www/Barbear.IA
sudo chown ***:*** /var/www/Barbear.IA
cd /var/www/Barbear.IA

# Backup current setup
if [ -f docker-compose.yml ]; then
  echo "📦 Criando backup da configuração atual..."
  cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
fi

# Download essential project files from GitHub
echo "📥 Baixando arquivos do repositório..."

# Function to download file with error handling
download_file() {
  local file=$1
  echo "Baixando $file..."
  if curl -H "Authorization: token ***" \
          -H "Accept: application/vnd.github.v3.raw" \
          -o "$file" \
          -L "https://api.github.com/repos/guelfi/Barbear.IA/contents/$file" \
          --fail --silent --show-error; then
    echo "✅ $file baixado com sucesso"
  else
    echo "❌ Erro ao baixar $file"
    return 1
  fi
}

# Download required files
download_file "docker-compose.yml"
download_file "Dockerfile"
download_file "nginx.conf"
download_file "package.json"
download_file "package-lock.json"
download_file ".dockerignore"

echo "✅ Sincronização de arquivos concluída"

======END======
out: 🚀 Iniciando sincronização do Barbear.IA...
out: 📦 Criando backup da configuração atual...
out: 📥 Baixando arquivos do repositório...
out: Baixando docker-compose.yml...
out: ✅ docker-compose.yml baixado com sucesso
out: Baixando Dockerfile...
out: ✅ Dockerfile baixado com sucesso
out: Baixando nginx.conf...
out: ✅ nginx.conf baixado com sucesso
out: Baixando package.json...
out: ✅ package.json baixado com sucesso
out: Baixando package-lock.json...
out: ✅ package-lock.json baixado com sucesso
out: Baixando .dockerignore...
out: ✅ .dockerignore baixado com sucesso
out: ✅ Sincronização de arquivos concluída
==============================================
✅ Successfully executed commands to all host.
==============================================
2m 8s
Run appleboy/ssh-action@v1.0.0
/usr/bin/docker run --name ff6122ac677994d954206a9a3fd852a23857a_55e7d6 --label 3ff612 --workdir /github/workspace --rm -e "PROJECT_NAME" -e "CONTAINER_NAME" -e "PORT" -e "NGINX_CONTAINER" -e "HEALTH_CHECK_TIMEOUT" -e "PERFORMANCE_THRESHOLD" -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_SCRIPT" -e "INPUT_PORT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION_DAYS" -e "GITHUB_RUN_ATTEMPT" -e "GITHUB_ACTOR_ID" -e "GITHUB_ACTOR" -e "GITHUB_WORKFLOW" -e "GITHUB_HEAD_REF" -e "GITHUB_BASE_REF" -e "GITHUB_EVENT_NAME" -e "GITHUB_SERVER_URL" -e "GITHUB_API_URL" -e "GITHUB_GRAPHQL_URL" -e "GITHUB_REF_NAME" -e "GITHUB_REF_PROTECTED" -e "GITHUB_REF_TYPE" -e "GITHUB_WORKFLOW_REF" -e "GITHUB_WORKFLOW_SHA" -e "GITHUB_REPOSITORY_ID" -e "GITHUB_TRIGGERING_ACTOR" -e "GITHUB_WORKSPACE" -e "GITHUB_ACTION" -e "GITHUB_EVENT_PATH" -e "GITHUB_ACTION_REPOSITORY" -e "GITHUB_ACTION_REF" -e "GITHUB_PATH" -e "GITHUB_ENV" -e "GITHUB_STEP_SUMMARY" -e "GITHUB_STATE" -e "GITHUB_OUTPUT" -e "RUNNER_OS" -e "RUNNER_ARCH" -e "RUNNER_NAME" -e "RUNNER_ENVIRONMENT" -e "RUNNER_TOOL_CACHE" -e "RUNNER_TEMP" -e "RUNNER_WORKSPACE" -e "ACTIONS_RUNTIME_URL" -e "ACTIONS_RUNTIME_TOKEN" -e "ACTIONS_CACHE_URL" -e "ACTIONS_RESULTS_URL" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" -v "/home/runner/work/_temp/_runner_file_commands":"/github/file_commands" -v "/home/runner/work/Barbear.IA/Barbear.IA":"/github/workspace" 3ff612:2ac677994d954206a9a3fd852a23857a
======CMD======
cd /var/www/Barbear.IA

echo "🔄 Iniciando deploy do Barbear.IA..."

# Check if container is currently running
CONTAINER_RUNNING=$(docker-compose ps -q barbear-ia-frontend 2>/dev/null)

if [ ! -z "$CONTAINER_RUNNING" ]; then
  echo "📊 Container atual detectado, preparando para atualização..."
  
  # Health check before deploy
  if curl -f http://localhost:3500/ > /dev/null 2>&1; then
    echo "✅ Aplicação atual está saudável"
  else
    echo "⚠️ Aplicação atual não está respondendo"
  fi
fi

# Build new image with cache optimization
echo "🏗️ Construindo nova imagem com build limpo..."

# FORÇA BUILD ULTRA LIMPO - Remove TUDO
echo "🧹 Limpeza completa do Docker..."
docker system prune -a -f --volumes
docker builder prune -a -f
docker image prune -a -f

# Limpeza completa do cache do Nginx
echo "🧹 Limpando cache completo do Nginx..."
if docker ps --format "table {{.Names}}" | grep -q "nginx-proxy"; then
  docker exec nginx-proxy nginx -s reload || true
  docker exec nginx-proxy find /var/cache/nginx -type f -delete || true
  docker exec nginx-proxy find /tmp -name "nginx*" -type f -delete || true
fi

# Limpeza completa do cache do frontend
echo "🧹 Limpeza completa do cache do frontend..."
rm -rf /tmp/barbear-ia-cache/* || true
rm -rf /var/cache/barbear-ia/* || true

# Remove container antigo se existir
docker-compose down --remove-orphans
docker-compose rm -f barbear-ia-frontend

# Build completamente limpo
echo "🏗️ Build ultra limpo sem cache..."
docker-compose build --no-cache --pull --force-rm barbear-ia-frontend

if [ $? -ne 0 ]; then
  echo "❌ Erro no build da imagem"
  exit 1
fi

# Stop current container gracefully
if [ ! -z "$CONTAINER_RUNNING" ]; then
  echo "🛑 Parando container atual..."
  docker-compose stop barbear-ia-frontend
fi

# Start new version
echo "🚀 Iniciando nova versão..."
docker-compose up -d barbear-ia-frontend

# Reinicialização de serviços necessários
echo "🔄 Reinicializando serviços necessários..."

# Reiniciar Nginx se estiver rodando
if docker ps --format "table {{.Names}}" | grep -q "nginx-proxy"; then
  echo "🔄 Reiniciando Nginx..."
  docker restart nginx-proxy
  sleep 5
fi

# Verificar e reiniciar outros serviços se necessário
echo "🔍 Verificando outros serviços..."
docker-compose restart || true

# Wait for container to be ready
echo "⏳ Aguardando inicialização (30 segundos)..."
sleep 30

# Health check with retry
echo "🔍 Executando health check..."
RETRY_COUNT=0
MAX_RETRIES=5

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f http://localhost:3500/ > /dev/null 2>&1; then
    echo "✅ Health check passou! Aplicação está funcionando"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Tentativa $RETRY_COUNT/$MAX_RETRIES falhou, aguardando 10 segundos..."
    sleep 10
  fi
done

# Final health check
if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Health check falhou após $MAX_RETRIES tentativas"
  echo "📋 Logs do container:"
  docker-compose logs --tail=20 barbear-ia-frontend
  
  echo "🔄 Tentando rollback..."
  docker-compose down
  
  # Restore from backup if available
  if [ -f docker-compose.yml.backup.* ]; then
    latest_backup=$(ls -t docker-compose.yml.backup.* | head -1)
    echo "📦 Restaurando backup: $latest_backup"
    cp "$latest_backup" docker-compose.yml
    docker-compose up -d barbear-ia-frontend
    sleep 15
    
    if curl -f http://localhost:3500/ > /dev/null 2>&1; then
      echo "✅ Rollback realizado com sucesso"
    else
      echo "❌ Rollback também falhou"
    fi
  fi
  exit 1
fi

# Show final status
echo "📊 Status final dos containers:"
docker-compose ps

echo "🧹 Limpando imagens não utilizadas..."
docker image prune -f

echo "🎉 Deploy do Barbear.IA realizado com sucesso!"
echo "🌐 Aplicação disponível em: http://***:3500"

======END======
out: 🔄 Iniciando deploy do Barbear.IA...
out: 📊 Container atual detectado, preparando para atualização...
out: ✅ Aplicação atual está saudável
out: 🏗️ Construindo nova imagem com build limpo...
out: 🧹 Limpeza completa do Docker...
out: Deleted Images:
out: untagged: node:18-alpine
out: untagged: node@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
out: deleted: sha256:c5914b9dd279c0f596933e65906cb3c6d2da5aae71e863e819e9b963997b1c17
out: deleted: sha256:cbf7fec1562e4f39fe631fafbcc399c19255f91e3a7131138881d98e4dcc8d72
out: deleted: sha256:e50b4f5bee7e6786b7d8866e44407e9c3acd03512a9b795904f2e638241235aa
out: deleted: sha256:62c28f64e5ebb9d1739355f80bc759cd4fd2e5b41397b45bc5a99bb382851f6f
out: deleted: sha256:a16e98724c05975ee8c40d8fe389c3481373d34ab20a1cf52ea2accc43f71f4c
out: untagged: nginx:alpine
out: untagged: nginx@sha256:61e01287e546aac28a3f56839c136b31f590273f3b41187a36f46f6a03bbfe22
out: Total reclaimed space: 125.6MB
err: ERROR: open /home/***/.docker/buildx/.lock: permission denied
out: Total reclaimed space: 0B
out: 🧹 Limpando cache completo do Nginx...
out: 🧹 Limpeza completa do cache do frontend...
err: Stopping barbear-ia-frontend ... 
err: 
Stopping barbear-ia-frontend ... done
Removing barbear-ia-frontend ... 
err: 
Removing barbear-ia-frontend ... done
Removing network barbearia_barbear-ia-net
out: No stopped containers
out: 🏗️ Build ultra limpo sem cache...
err: Building barbear-ia-frontend
out: Step 1/13 : FROM node:18-alpine AS builder
out: 18-alpine: Pulling from library/node
out: Digest: sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
out: Status: Downloaded newer image for node:18-alpine
out:  ---> c5914b9dd279
out: Step 2/13 : WORKDIR /app
out:  ---> Running in 57e0d25feafc
out:  ---> Removed intermediate container 57e0d25feafc
out:  ---> 2ee5c305ad48
out: Step 3/13 : RUN npm install -g npm@10
out:  ---> Running in a1952cfa8f90
out: removed 14 packages, and changed 100 packages in 11s
out: 25 packages are looking for funding
out:   run `npm fund` for details
out:  ---> Removed intermediate container a1952cfa8f90
out:  ---> 42305d5f5c3e
out: Step 4/13 : COPY package*.json ./
out:  ---> edc3249b1e2a
out: Step 5/13 : RUN echo "📦 Removendo package-lock.json e usando npm install limpo" &&     rm -f package-lock.json &&     npm install --no-audit --no-fund
out:  ---> Running in cbdcd21f2035
out: 📦 Removendo package-lock.json e usando npm install limpo
out: added 169 packages in 33s
out: npm notice
out: npm notice New major version of npm available! 10.9.4 -> 11.6.2
out: npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.2
out: npm notice To update run: npm install -g npm@11.6.2
out: npm notice
out:  ---> Removed intermediate container cbdcd21f2035
out:  ---> 0320ec5c0e8c
out: Step 6/13 : COPY . .
out:  ---> 681ec13a3583
out: Step 7/13 : RUN echo "🏗️ Iniciando build de produção..." &&     npm run build &&     echo "✅ Build concluído. Verificando arquivos gerados:" &&     ls -la build/ &&     echo "📄 Conteúdo do index.html:" &&     head -20 build/index.html
out:  ---> Running in 6bfb0558264b
out: 🏗️ Iniciando build de produção...
out: > barbear-ia@0.1.0 build
out: > vite build
out: The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
out: vite v5.4.21 building for production...
out: transforming...
out: ✓ 2924 modules transformed.
out: rendering chunks...
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/dashboard/SuperAdminDashboard.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, /app/src/components/dashboard/Dashboard.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/dashboard/Dashboard.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx, /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/appointments/AppointmentCalendar.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx, /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/appointments/AppointmentForm.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/clients/ClientList.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx, /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/clients/ClientForm.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/clients/ClientProfile.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/barbers/BarberList.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx, /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/barbers/BarberForm.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/barbers/BarberProfile.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/barbershop/BarbershopProfile.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/services/ServiceList.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx, /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: [plugin:vite:reporter] [plugin vite:reporter] 
out: (!) /app/src/components/services/ServiceForm.tsx is dynamically imported by /app/src/components/lazy/LazyComponents.tsx but also statically imported by /app/src/App.tsx, dynamic import will not move module into another chunk.
out: computing gzip size...
out: build/index.html                   1.09 kB │ gzip:   0.49 kB
out: build/assets/index-CRQcUmcS.css   74.73 kB │ gzip:  13.49 kB
out: build/assets/ui-DjohIiad.js       81.57 kB │ gzip:  27.42 kB
out: build/assets/vendor-fsMkNaLw.js  139.87 kB │ gzip:  44.91 kB
out: build/assets/index-Dpq2AHyK.js   439.53 kB │ gzip: 114.92 kB
out: ✓ built in 20.21s
out: ✅ Build concluído. Verificando arquivos gerados:
out: total 44
out: drwxr-xr-x    3 root     root          4096 Oct 25 17:05 .
out: drwxr-xr-x    1 root     root          4096 Oct 25 17:05 ..
out: drwxr-xr-x    2 root     root          4096 Oct 25 17:05 assets
out: -rw-rw-r--    1 root     root           395 Oct 25 17:05 favicon.svg
out: -rw-rw-r--    1 root     root           563 Oct 25 17:05 icon-192x192.png
out: -rw-rw-r--    1 root     root           563 Oct 25 17:05 icon-192x192.svg
out: -rw-rw-r--    1 root     root           590 Oct 25 17:05 icon-512x512.svg
out: -rw-r--r--    1 root     root          1092 Oct 25 17:05 index.html
out: -rw-rw-r--    1 root     root          1676 Oct 25 17:05 manifest.json
out: -rw-rw-r--    1 root     root          4749 Oct 25 17:05 sw.js
out: 📄 Conteúdo do index.html:
out: <!DOCTYPE html>
out: <html lang="pt-BR">
out:   <head>
out:     <meta charset="UTF-8" />
out:     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
out:     <meta name="description" content="Sistema completo de gestão para barbearias - Barbear.IA" />
out:     <meta name="theme-color" content="#000000" />
out:     <meta name="apple-mobile-web-app-capable" content="yes" />
out:     <meta name="apple-mobile-web-app-status-bar-style" content="default" />
out:     <meta name="apple-mobile-web-app-title" content="Barbear.IA" />
out:     <link rel="manifest" href="/manifest.json" />
out:     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
out:     <link rel="apple-touch-icon" href="/icon-192x192.svg" />
out:     <title>Barbear.IA</title>
out:     <script type="module" crossorigin src="/assets/index-Dpq2AHyK.js"></script>
out:     <link rel="modulepreload" crossorigin href="/assets/vendor-fsMkNaLw.js">
out:     <link rel="modulepreload" crossorigin href="/assets/ui-DjohIiad.js">
out:     <link rel="stylesheet" crossorigin href="/assets/index-CRQcUmcS.css">
out:   </head>
out:  ---> Removed intermediate container 6bfb0558264b
out:  ---> 2b608ac7d433
out: Step 8/13 : FROM nginx:alpine
out: alpine: Pulling from library/nginx
out: Digest: sha256:61e01287e546aac28a3f56839c136b31f590273f3b41187a36f46f6a03bbfe22
out: Status: Downloaded newer image for nginx:alpine
out:  ---> 9c92f55c0336
out: Step 9/13 : COPY --from=builder /app/build /usr/share/nginx/html
out:  ---> d833cded7315
out: Step 10/13 : COPY nginx.conf /etc/nginx/conf.d/default.conf
out:  ---> 7bd9f1baef5b
out: Step 11/13 : EXPOSE 80
out:  ---> Running in 16698a2b3539
out:  ---> Removed intermediate container 16698a2b3539
out:  ---> c98dbf24b146
out: Step 12/13 : HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3   CMD curl -f http://localhost/ || exit 1
out:  ---> Running in e5cf5058b19b
out:  ---> Removed intermediate container e5cf5058b19b
out:  ---> b25110be8654
out: Step 13/13 : CMD ["nginx", "-g", "daemon off;"]
out:  ---> Running in 397d984a32af
out:  ---> Removed intermediate container 397d984a32af
out:  ---> 19dbbba7bc7b
out: Successfully built 19dbbba7bc7b
out: Successfully tagged barbearia_barbear-ia-frontend:latest
out: 🛑 Parando container atual...
out: 🚀 Iniciando nova versão...
err: Creating network "barbearia_barbear-ia-net" with driver "bridge"
err: Creating barbear-ia-frontend ... 
out: 🔄 Reinicializando serviços necessários...
out: 🔍 Verificando outros serviços...
err: 
Creating barbear-ia-frontend ... done
Restarting barbear-ia-frontend ... 
out: ⏳ Aguardando inicialização (30 segundos)...
out: 🔍 Executando health check...
out: ✅ Health check passou! Aplicação está funcionando
out: 📊 Status final dos containers:
out:        Name                 Command             State              Ports        
out: --------------------------------------------------------------------------------
out: barbear-ia-frontend   /docker-               Up (healthy)   0.0.0.0:3500->80/tcp
out:                       entrypoint.sh ngin                    ,:::3500->80/tcp    
out:                       ...                                                       
out: 🧹 Limpando imagens não utilizadas...
out: Deleted Images:
out: deleted: sha256:2b608ac7d43325c62eadffa6e4bd13b227b827591bb89190d6a9af3750d4361c
out: deleted: sha256:0da2d4e7926b583be10bf3f4e75898d4d529b785229bd2157662cafaba7a9e4d
out: deleted: sha256:681ec13a3583d8af139907e376e14fed7475c00c89b7740ee2f72e2467db604d
out: deleted: sha256:6df8568280dcc16a9bdc23fc7c920a1a0c4af6d27aa1c3d9d019edbbdfe86aaa
out: deleted: sha256:0320ec5c0e8c5e2ef702c26693b10dfe9009798d130645382fc2e946c0b5ad4d
out: deleted: sha256:4c7aaa1d5c5fd8745cb77bc4395d7c9acbb133d5491eea96e079209c1bf43fe5
out: deleted: sha256:edc3249b1e2aa14bed854e4812758e3aa9e747d2b1ab30e78c77f7f0f0cc9d57
out: deleted: sha256:91ba60a0617f67d15976432d68b08c6cc746004a35592bab6f4221baf79e134d
out: deleted: sha256:42305d5f5c3e8cef85ce2f1161553ccf176b93cf881a368de9db15f507246216
out: deleted: sha256:8c1db53901f411faeca42c73f4fe66a956445d619ed06381ed8fe7b2fdff42ed
out: deleted: sha256:2ee5c305ad48242513ccad1fb4bdfa8e0ecf5c798dfec65ae156ae1723962b68
out: deleted: sha256:68af5f2feea43554ff2280519445d791b7314fe9a2172de00b71e38e428e6ecb
out: deleted: sha256:835ad2cd63b8c94fdc97a8eb8e22ae2877b167ad51283b7cb426fde5f4be202a
out: deleted: sha256:ae89caff0c64dd01954e09d056930ec648c83492b88e0ea50b15f643788838a1
out: deleted: sha256:8545e8f65d8d6bb19dfd64817fb495196768d7e7d9aa648c266f8397113da48d
out: deleted: sha256:736a1a649efbe54acc3a8b306604ad676a96738c349fea388bed41d243197222
out: deleted: sha256:74a1b45adaf8b98df4074bf00b74209c4728b003d3c555023856566cae06f4e2
out: deleted: sha256:259f8cec839c5bfd64a394515882b794b7460870a79148572c9cf397203c5b2c
out: deleted: sha256:1ac7f0e0a5a7c039cd832b3a80f659deaac95cd0e48cf988874c301d12aecf18
out: Total reclaimed space: 460.8MB
out: 🎉 Deploy do Barbear.IA realizado com sucesso!
out: 🌐 Aplicação disponível em: http://***:3500
err: 
Restarting barbear-ia-frontend ... done

==============================================
✅ Successfully executed commands to all host.
==============================================
0s
Post job cleanup.
/usr/bin/git version
git version 2.51.0
Temporarily overriding HOME='/home/runner/work/_temp/f1a3f5fc-73e9-469d-9fd9-2b82333d0ed4' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
0s
Cleaning up orphan processes
production-tests:
Current runner version: '2.329.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
Complete job name: production-tests
0s
Run actions/checkout@v4
Syncing repository: guelfi/Barbear.IA
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/2c262c3c-c2e1-4b9c-bef0-45691d12801f' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
Deleting the contents of '/home/runner/work/Barbear.IA/Barbear.IA'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
af537209c33a8b05e2c0498ede43609c90dbab5b
3s
Run actions/setup-node@v4
Found in cache @ /opt/hostedtoolcache/node/18.20.8/x64
Environment details
/opt/hostedtoolcache/node/18.20.8/x64/bin/npm config get cache
/home/runner/.npm
npm cache is not found
14s
Run npm install --only=dev
npm warn invalid config only="dev" set in command line options
npm warn invalid config Must be one of: null, prod, production

added 167 packages, and audited 168 packages in 12s

9 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

added 3 packages, removed 1 package, and audited 171 packages in 2s

9 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
1m 0s
Run echo "⏳ Aguardando aplicação estar completamente pronta..."
⏳ Aguardando aplicação estar completamente pronta...
1s
Run echo "🔐 Testando funcionamento dos logins..."
🔐 Testando funcionamento dos logins...
✅ Aplicação está respondendo
✅ Página de login carregou com sucesso (HTTP 200)
🎨 Verificando carregamento de recursos estáticos...
✅ Recursos estáticos detectados na página
0s
Run echo "⚡ Testando performance do sistema..."
⚡ Testando performance do sistema...
📊 Tempo de resposta: 117ms
✅ Performance dentro do limite aceitável (< 3000ms)
🔄 Testando carga com múltiplas requisições...
✅ Teste de carga básico concluído
33s
Run echo "🛡️ Testando estabilidade da aplicação..."
🛡️ Testando estabilidade da aplicação...
🔄 Executando teste de estabilidade (30 requisições em 30 segundos)...
📊 Taxa de sucesso: 100% (30/30)
✅ Aplicação demonstrou alta estabilidade (≥95%)
📋 Verificando logs para erros críticos...
2s
Post job cleanup.
/usr/bin/tar --posix -cf cache.tzst --exclude cache.tzst -P -C /home/runner/work/Barbear.IA/Barbear.IA --files-from manifest.txt --use-compress-program zstdmt
Sent 58679797 of 58679797 (100.0%), 55.9 MBs/sec
Cache saved with the key: node-cache-Linux-x64-npm-ee660b04d9429f6ef1da240a25125b4493baf29d7ec1cd00e72edd03b248d4b9
0s
Post job cleanup.
/usr/bin/git version
git version 2.51.0
Temporarily overriding HOME='/home/runner/work/_temp/acbf187d-643d-49e1-95bc-abd878d53b6c' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
1s
Cleaning up orphan processes
post-deploy-monitoring:
Current runner version: '2.329.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
Download action repository 'actions/upload-artifact@v4' (SHA:ea165f8d65b6e75b540449e92b4886f43607fa02)
Complete job name: post-deploy-monitoring
0s
Run actions/checkout@v4
Syncing repository: guelfi/Barbear.IA
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/cddc34dd-f0ba-4689-ac5f-0ce790ddb8b1' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
Deleting the contents of '/home/runner/work/Barbear.IA/Barbear.IA'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
af537209c33a8b05e2c0498ede43609c90dbab5b
4m 31s
Run echo "📊 Iniciando monitoramento pós-deploy..."
📊 Iniciando monitoramento pós-deploy...
🔍 Executando 10 verificações de saúde em 300 segundos...
📋 Verificação 1/10...
✅ Check 1: OK
📋 Verificação 2/10...
✅ Check 2: OK
📋 Verificação 3/10...
✅ Check 3: OK
📋 Verificação 4/10...
✅ Check 4: OK
📋 Verificação 5/10...
✅ Check 5: OK
📋 Verificação 6/10...
✅ Check 6: OK
📋 Verificação 7/10...
✅ Check 7: OK
📋 Verificação 8/10...
✅ Check 8: OK
📋 Verificação 9/10...
✅ Check 9: OK
📋 Verificação 10/10...
✅ Check 10: OK
📊 Resultado do monitoramento:
   - Verificações totais: 10
   - Verificações com sucesso: 10
   - Verificações falharam: 0
   - Taxa de sucesso: 100%
✅ Sistema demonstrou excelente estabilidade pós-deploy
0s
Run echo "📄 Gerando relatório de deploy..."
📄 Gerando relatório de deploy...
✅ Relatório de deploy gerado com sucesso
# 📋 Relatório de Deploy - Barbear.IA

**Data/Hora:** 2025-10-25 17:12:55 UTC
**Commit:** af537209c33a8b05e2c0498ede43609c90dbab5b
**Branch:** main
**Workflow:** 18805954593

## ✅ Etapas Concluídas

### 🧹 Limpeza de Cache
- ✅ Cache do Docker limpo completamente
- ✅ Cache do Nginx limpo
- ✅ Cache do Frontend limpo

### 🔄 Reinicialização de Serviços
- ✅ Container principal reiniciado
- ✅ Nginx reiniciado
- ✅ Serviços auxiliares verificados

### 🧪 Testes Automatizados
- ✅ Teste de funcionamento dos logins
- ✅ Teste de performance do sistema
- ✅ Teste de estabilidade da aplicação

### 📊 Monitoramento Pós-Deploy
- ✅ Monitoramento de 5 minutos executado
- ✅ Verificações de saúde realizadas

## 🌐 Informações de Acesso

**URL da Aplicação:** http://***:3500
**Status:** ✅ Online e Funcionando

## 📈 Métricas de Performance

- **Tempo de Build:** Verificar logs do workflow
- **Tempo de Deploy:** Verificar logs do workflow
- **Taxa de Sucesso dos Testes:** ≥95% (conforme logs)

## 🔍 Próximos Passos Recomendados

1. Monitorar logs da aplicação nas próximas 24 horas
2. Verificar métricas de uso e performance
3. Validar funcionalidades críticas manualmente se necessário
4. Documentar qualquer comportamento anômalo observado

---
*Relatório gerado automaticamente pelo GitHub Actions*
1s
Run actions/upload-artifact@v4
With the provided path, there will be 1 file uploaded
Artifact name is valid!
Root directory input is valid!
Beginning upload of artifact content to blob storage
Uploaded bytes 927
Finished uploading artifact content to blob storage!
SHA256 digest of uploaded artifact zip is 80ff592f410b5f57649507052ae0bac514c16520701318d6e2bffef3f293976a
Finalizing artifact upload
Artifact deployment-report-18805954593.zip successfully finalized. Artifact ID 4371401363
Artifact deployment-report-18805954593 has been successfully uploaded! Final size is 927 bytes. Artifact ID is 4371401363
Artifact download URL: https://github.com/guelfi/Barbear.IA/actions/runs/18805954593/artifacts/4371401363
0s
Post job cleanup.
/usr/bin/git version
git version 2.51.0
Temporarily overriding HOME='/home/runner/work/_temp/3c22afeb-1622-4021-be57-d370fcee2d17' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/Barbear.IA/Barbear.IA
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
0s
Cleaning up orphan processes