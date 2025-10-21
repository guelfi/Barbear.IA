# 🚀 Deploy Barbear.IA na OCI

Este documento descreve como configurar e fazer deploy da aplicação Barbear.IA na Oracle Cloud Infrastructure (OCI) usando Docker, nginx e GitHub Actions.

## 📋 Pré-requisitos

### Na OCI:
- Instância compute com Docker e Docker Compose instalados
- Porta 3500 liberada no Security Group
- Nginx configurado como proxy reverso (opcional)
- Usuário com permissões sudo

### No GitHub:
- Repository secrets configurados
- GitHub Actions habilitado

## 🔧 Configuração dos Secrets no GitHub

Configure os seguintes secrets no seu repositório GitHub:

```bash
# Acesso SSH à OCI
OCI_HOST=your-oci-instance-ip
OCI_USERNAME=your-ssh-username
OCI_SSH_KEY=your-private-ssh-key
OCI_PORT=22

# Notificações (opcional)
SLACK_WEBHOOK=your-slack-webhook-url
```

## 🏗️ Estrutura de Deploy

### 1. Dockerfile Multi-stage
- **Stage 1**: Build da aplicação React com Node.js
- **Stage 2**: Servir com nginx otimizado

### 2. Docker Compose
- Expõe a aplicação na porta **3500**
- Configurado para restart automático
- Health checks implementados
- Labels para Traefik (se usado)

### 3. Nginx Configuration
- Otimizado para SPA (Single Page Application)
- Compressão gzip habilitada
- Cache para assets estáticos
- Headers de segurança configurados

## 🚀 Deploy Automático

### Trigger do Deploy:
- Push para branch `main` ou `master`
- Pull requests (apenas build e test)

### Processo do Deploy:
1. **Build & Test**: Instala dependências, roda testes, faz build
2. **Docker Build**: Cria imagem Docker otimizada
3. **Registry Push**: Envia para GitHub Container Registry
4. **OCI Deploy**: SSH na instância e atualiza containers
5. **Health Check**: Verifica se aplicação está funcionando
6. **Cleanup**: Remove imagens antigas

## 🔧 Configuração Manual na OCI

### 1. Preparar diretório:
```bash
sudo mkdir -p /opt/barbear-ia
cd /opt/barbear-ia
```

### 2. Baixar docker-compose:
```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/SEU-USUARIO/SEU-REPO/main/docker-compose.yml
```

### 3. Configurar nginx proxy (opcional):
```nginx
# /etc/nginx/sites-available/barbear-ia
server {
    listen 80;
    server_name barbear-ia.yourdomain.com;

    location / {
        proxy_pass http://localhost:3500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Primeiro deploy:
```bash
# Login no GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Subir aplicação
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## 🔍 Monitoramento

### Health Check:
```bash
curl http://localhost:3500/health
```

### Logs:
```bash
# Logs da aplicação
docker-compose logs barbear-ia-frontend

# Logs em tempo real
docker-compose logs -f barbear-ia-frontend
```

### Status dos containers:
```bash
docker-compose ps
```

## 🛠️ Comandos Úteis

### Restart da aplicação:
```bash
docker-compose restart
```

### Update manual:
```bash
docker-compose pull
docker-compose up -d
```

### Backup antes de update:
```bash
docker-compose down
docker tag current-image backup-image
```

### Rollback:
```bash
docker-compose down
docker tag backup-image current-image
docker-compose up -d
```

## 🌐 Acesso

Após o deploy, a aplicação estará disponível em:
- **Direto**: `http://your-oci-ip:3500`
- **Com proxy**: `http://your-domain.com` (se configurado)

## 🔒 Segurança

- Aplicação roda em container isolado
- Headers de segurança configurados no nginx
- Apenas porta 3500 exposta
- Imagens são escaneadas no registry

## 📊 Performance

- Build otimizado com multi-stage
- Assets com cache de 1 ano
- Compressão gzip habilitada
- Health checks para alta disponibilidade

## 🆘 Troubleshooting

### Container não inicia:
```bash
docker-compose logs barbear-ia-frontend
```

### Porta ocupada:
```bash
sudo netstat -tlnp | grep :3500
```

### Problemas de permissão:
```bash
sudo chown -R $USER:$USER /opt/barbear-ia
```

### Reset completo:
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```