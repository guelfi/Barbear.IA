# 🚀 Processo de Deploy Manual - Barbear.IA

## ⚠️ IMPORTANTE: Controle de Deploy

Este documento descreve o processo seguro para deploy em produção **SEM usar scripts PowerShell**, utilizando apenas comandos npm e git diretos.

## 🔒 Controle de Concorrência Implementado

✅ **Controle de concorrência configurado no workflow**
- Apenas um deploy por vez será executado
- Deployments paralelos serão automaticamente cancelados
- Configuração: `concurrency: deploy-barbear-ia-${{ github.ref }}`

## 📋 Processo de Deploy Passo a Passo

### 1. 🧪 Testes Locais Obrigatórios

Execute **TODOS** os comandos abaixo na sequência:

```bash
# 1. Limpar cache npm
npm cache clean --force

# 2. Reinstalar dependências (limpo)
npm install

# 3. Executar linting
npm run lint

# 4. Executar testes
npm test -- --coverage --watchAll=false

# 5. Executar build
npm run build
```

### 2. ✅ Validação dos Testes

**APENAS continue se:**
- ✅ Todos os comandos executaram sem erro
- ✅ Build foi gerado na pasta `build/`
- ✅ Não há erros de TypeScript
- ✅ Testes passaram com sucesso

### 3. 🔍 Verificação de Status

Antes de fazer o deploy:

```bash
# Verificar status do repositório
git status

# Ver últimos commits
git log --oneline -5

# Verificar branch atual
git branch
```

### 4. 🌐 Verificar Workflows Ativos

**OBRIGATÓRIO:** Acesse https://github.com/guelfi/Barbear.IA/actions

- ✅ Verifique se há workflows em execução
- ⚠️ Se houver workflows rodando, aguarde a conclusão ou cancele se necessário
- 🔄 O novo deploy cancelará automaticamente workflows em andamento

### 5. 🚀 Deploy para Produção

**APENAS após aprovação manual:**

```bash
# Se houver alterações para commit:
git add .
git commit -m "sua mensagem de commit aqui"

# Push para produção (TRIGGERA O DEPLOY AUTOMÁTICO)
git push origin main
```

## ⚡ Comandos Rápidos de Teste

Para validação rápida antes do deploy:

```bash
# Teste completo em uma linha
npm cache clean --force && npm install && npm run lint && npm test -- --coverage --watchAll=false && npm run build
```

## 🔗 Links Importantes

- **GitHub Actions:** https://github.com/guelfi/Barbear.IA/actions
- **Aplicação em Produção:** [URL da OCI]
- **Logs de Deploy:** Disponíveis no GitHub Actions

## 🚨 Regras de Segurança

1. **NUNCA** faça push direto sem executar os testes locais
2. **SEMPRE** verifique workflows ativos antes do deploy
3. **CONFIRME** que todos os testes passaram
4. **MONITORE** o deploy no GitHub Actions após o push
5. **AGUARDE** a conclusão do deploy antes de novos pushes

## 🛠️ Troubleshooting

### Se os testes falharem:
```bash
# Limpar tudo e tentar novamente
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Se o deploy falhar:
1. Verifique os logs no GitHub Actions
2. Corrija os problemas localmente
3. Execute os testes novamente
4. Faça novo commit e push

## 📊 Status do Controle de Deploy

- ✅ Controle de concorrência: **ATIVO**
- ✅ Testes obrigatórios: **DOCUMENTADOS**
- ✅ Processo manual: **DEFINIDO**
- ✅ Verificações de segurança: **IMPLEMENTADAS**