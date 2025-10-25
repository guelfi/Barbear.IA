# 🚀 Processo Completo de Deploy - Barbear.IA

## 📋 Visão Geral

Este documento descreve o processo completo de implantação automatizada do Barbear.IA na Oracle Cloud Infrastructure (OCI), implementado através do GitHub Actions.

## 🔄 Triggers de Deploy

### Automático
- **Push para branch `main`**: Deploy automático sempre que código é enviado para a branch principal
- **Deploy semanal**: Execução automática todo domingo às 2h (manutenção preventiva)

### Manual
- **Workflow Dispatch**: Permite execução manual através da interface do GitHub

## 🏗️ Etapas do Deploy

### 1. 🧪 Testes e Build
- Limpeza completa do cache npm
- Instalação limpa de dependências
- Execução de linting e testes
- Build da aplicação com debug completo
- Upload dos artefatos de build

### 2. 🚀 Deploy na OCI
- Sincronização de arquivos do projeto
- Backup da configuração atual
- Limpeza completa de caches:
  - Cache do Docker (sistema completo)
  - Cache do Nginx
  - Cache do Frontend
- Build limpo da nova imagem Docker
- Reinicialização de serviços:
  - Container principal
  - Nginx
  - Serviços auxiliares
- Health check com retry automático
- Rollback automático em caso de falha

### 3. 🧪 Testes Automatizados em Produção
- **Teste de Login**: Verificação de conectividade e carregamento da página
- **Teste de Performance**: Medição de tempo de resposta (limite: 3000ms)
- **Teste de Estabilidade**: 30 requisições em 30 segundos (taxa mínima: 90%)

### 4. 📊 Monitoramento Pós-Deploy
- Monitoramento contínuo por 5 minutos
- Verificações de saúde a cada 30 segundos
- Análise de estabilidade do sistema
- Geração de relatório detalhado

## 🔧 Configurações Técnicas

### Variáveis de Ambiente
```yaml
PROJECT_NAME: "Barbear.IA"
CONTAINER_NAME: "barbear-ia-frontend"
PORT: 3500
NGINX_CONTAINER: "nginx-proxy"
HEALTH_CHECK_TIMEOUT: 300
PERFORMANCE_THRESHOLD: 3000
```

### Secrets Necessários
- `OCI_HOST`: Endereço do servidor OCI
- `OCI_USERNAME`: Usuário SSH para acesso ao servidor
- `OCI_SSH_KEY`: Chave SSH privada para autenticação
- `GITHUB_TOKEN`: Token para acesso à API do GitHub

## 📈 Métricas e Monitoramento

### Critérios de Sucesso
- **Health Check**: Taxa de sucesso ≥ 95%
- **Performance**: Tempo de resposta < 3000ms
- **Estabilidade**: Taxa de sucesso ≥ 90% em testes contínuos
- **Monitoramento**: Taxa de sucesso ≥ 95% no período pós-deploy

### Relatórios Gerados
- Relatório detalhado de deploy em formato Markdown
- Métricas de performance e estabilidade
- Logs completos de todas as etapas
- Recomendações para próximos passos

## 🛡️ Segurança e Rollback

### Backup Automático
- Backup da configuração atual antes do deploy
- Preservação de configurações por data/hora

### Rollback Automático
- Ativado automaticamente em caso de falha no health check
- Restauração da configuração anterior
- Verificação de funcionamento pós-rollback

### Limpeza de Segurança
- Remoção de imagens Docker não utilizadas
- Limpeza de volumes órfãos
- Otimização de espaço em disco

## 📋 Checklist Pré-Deploy

Antes de fazer push para a branch `main`, verifique:

- [ ] Código testado localmente
- [ ] Testes unitários passando
- [ ] Build local funcionando
- [ ] Secrets configurados no GitHub
- [ ] Servidor OCI acessível
- [ ] Docker e Docker Compose funcionando no servidor

## 🔍 Troubleshooting

### Falha no Build
1. Verificar logs do GitHub Actions
2. Testar build localmente
3. Verificar dependências no package.json
4. Limpar cache local e tentar novamente

### Falha no Deploy
1. Verificar conectividade SSH com OCI
2. Verificar espaço em disco no servidor
3. Verificar logs do Docker no servidor
4. Verificar configuração do nginx

### Falha nos Testes
1. Verificar se aplicação está respondendo
2. Verificar configuração de rede/firewall
3. Verificar logs da aplicação
4. Ajustar thresholds se necessário

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do GitHub Actions
2. Acessar servidor OCI via SSH para diagnóstico
3. Verificar status dos containers: `docker-compose ps`
4. Verificar logs da aplicação: `docker-compose logs`

## 🔄 Atualizações Futuras

Este processo pode ser expandido com:
- Testes de integração mais complexos
- Monitoramento de métricas de negócio
- Notificações via Slack/Discord
- Integração com ferramentas de APM
- Testes de carga automatizados

---

*Documentação atualizada em: $(date '+%Y-%m-%d')*
*Versão do workflow: v2.0*