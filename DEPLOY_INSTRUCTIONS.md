# 🚀 Instruções de Deploy - Barbear.IA na OCI

## 📋 Pré-requisitos

### Secrets do GitHub
Configure os seguintes secrets no repositório GitHub:

1. **OCI_HOST**: IP público da instância OCI
2. **OCI_USER**: Usuário SSH (geralmente `ubuntu`)
3. **OCI_SSH_KEY**: Chave privada SSH para acesso à instância

### Instância OCI
- ✅ Docker instalado
- ✅ Docker Compose instalado  
- ✅ Node.js 18+ instalado
- ✅ Git configurado
- ✅ Porta 3500 liberada no Security Group

---

## 🔧 Processo de Deploy

### Opção 1: Deploy Automático via GitHub Actions

1. **Fazer Push para Main**:
   ```bash
   git push origin main
   ```

2. **Ou Executar Manualmente**:
   - Vá para GitHub → Actions
   - Selecione "Deploy to OCI"
   - Clique em "Run workflow"

3. **Monitorar**:
   - Acompanhe os logs no GitHub Actions
   - Deploy leva ~5-10 minutos

### Opção 2: Deploy Manual via SSH

1. **Conectar na OCI**:
   ```bash
   ssh ubuntu@[IP_DA_INSTANCIA]
   ```

2. **Executar Limpeza**:
   ```bash
   # Baixar e executar script de limpeza
   wget https://raw.githubusercontent.com/guelfi/Barbear.IA/main/scripts/cleanup-oci.sh
   chmod +x cleanup-oci.sh
   ./cleanup-oci.sh
   ```

3. **Deploy Manual**:
   ```bash
   cd /home/ubuntu/Barbear.IA
   git pull origin main
   npm ci
   npm run build
   sudo docker-compose up -d --build
   ```

---

## 🔍 Verificação do Deploy

### 1. Verificar Container
```bash
sudo docker ps | grep barbear-ia
```

### 2. Verificar Logs
```bash
sudo docker logs barbear-ia-app
```

### 3. Testar Aplicação
```bash
curl -I http://localhost:3500
```

### 4. Acessar Aplicação
- **URL**: http://[IP_PUBLICO]:3500
- **Usuários de Teste**:
  - Super Admin: admin@barbear.ia / super123
  - Admin: admin@barbearia.com / admin123
  - Barbeiro: barbeiro@barbearia.com / barber123
  - Cliente: cliente@email.com / cliente123

---

## 🐛 Debug em Produção

### Debug Panel
- **Acesso**: Clique no botão 🐛 no canto inferior direito
- **Logs Disponíveis**: Auth, Dashboard, API
- **Exportação**: Download de logs em JSON

### Logs do Container
```bash
# Logs em tempo real
sudo docker logs -f barbear-ia-app

# Últimos 100 logs
sudo docker logs barbear-ia-app --tail 100
```

### Verificar Recursos
```bash
# CPU e Memória
sudo docker stats barbear-ia-app

# Espaço em disco
df -h
```

---

## 🔧 Troubleshooting

### Problema: Container não inicia
```bash
# Verificar logs de erro
sudo docker logs barbear-ia-app

# Verificar se a porta está livre
sudo netstat -tlnp | grep 3500

# Reiniciar container
sudo docker-compose restart
```

### Problema: Aplicação não carrega
```bash
# Verificar nginx
sudo docker exec barbear-ia-app nginx -t

# Verificar arquivos
sudo docker exec barbear-ia-app ls -la /usr/share/nginx/html
```

### Problema: Erro de build
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitoramento

### Métricas Importantes
- **CPU**: < 50% em uso normal
- **Memória**: < 1GB para a aplicação
- **Disco**: Manter > 2GB livres
- **Rede**: Porta 3500 acessível

### Logs a Monitorar
- Erros de autenticação
- Falhas de carregamento de dados
- Problemas de API simulada
- Erros de JavaScript no frontend

### Backup Automático
- Builds anteriores mantidos como backup
- Rollback disponível em caso de problemas

---

## 🎯 Funcionalidades Disponíveis em Produção

### ✅ Autenticação
- Login/logout para todos os perfis
- Sessões persistentes
- Validação de tokens

### ✅ Dashboards
- Super Admin: Visão global da plataforma
- Admin: Dados da barbearia
- Barbeiro: Dados pessoais
- Cliente: Agendamentos pessoais

### ✅ Funcionalidades
- Listagem de agendamentos, clientes, barbeiros, serviços
- Filtros por tenant (isolamento de dados)
- Interface responsiva
- Sistema de debug integrado

### 🔄 Em Desenvolvimento
- CRUD completo para todas as entidades
- Persistência em arquivos JSON
- Formulários aprimorados

---

## 📞 Suporte

### Em Caso de Problemas
1. **Verificar Debug Panel** na aplicação
2. **Exportar logs** para análise
3. **Verificar logs do container** via SSH
4. **Executar rollback** se necessário:
   ```bash
   sudo docker-compose down
   sudo mv build_backup_[DATA] build
   sudo docker-compose up -d
   ```

### Contatos
- **Repositório**: https://github.com/guelfi/Barbear.IA
- **Documentação**: Este arquivo + specs na pasta `.kiro/specs/`

---

## 🎉 Status Atual

**✅ PRONTO PARA DEPLOY EM PRODUÇÃO**

- Interface 100% funcional
- APIs simuladas completas
- Sistema de debug implementado
- Workflow de deploy configurado
- Documentação completa

**🌐 Após o deploy, a aplicação estará disponível em:**
`http://[IP_PUBLICO_OCI]:3500`