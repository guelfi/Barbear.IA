# Guia de Commits - Barbear.IA

## Padrão de Mensagens de Commit

Este projeto utiliza mensagens de commit em **português** seguindo o padrão de Conventional Commits adaptado.

### Formato

```
<tipo>: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de Commit

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat: adicionar sistema de agendamento` |
| `fix` | Correção de bug | `fix: corrigir validação de formulário` |
| `docs` | Documentação | `docs: atualizar README com instruções` |
| `style` | Formatação, estilos | `style: ajustar espaçamento dos botões` |
| `refactor` | Refatoração de código | `refactor: reorganizar componentes` |
| `test` | Testes | `test: adicionar testes unitários` |
| `chore` | Tarefas de manutenção | `chore: atualizar dependências` |
| `perf` | Melhorias de performance | `perf: otimizar carregamento de imagens` |
| `ci` | Integração contínua | `ci: configurar GitHub Actions` |
| `build` | Sistema de build | `build: configurar Vite para produção` |

### Regras

1. **Idioma**: Sempre em português
2. **Tamanho**: Máximo 50 caracteres no título
3. **Formato**: Minúsculo, sem ponto final
4. **Imperativo**: Use o modo imperativo ("adicionar" não "adicionado")

### Exemplos Bons

```
feat: implementar autenticação de usuários
fix: corrigir erro na listagem de barbeiros
docs: adicionar documentação da API
style: melhorar responsividade do dashboard
refactor: extrair lógica de validação para hook
test: adicionar testes para componente de agendamento
chore: atualizar dependências do React
```

### Exemplos Ruins

```
❌ Add new feature (inglês)
❌ fixed bug (passado)
❌ Update documentation. (ponto final)
❌ FEAT: NEW AUTHENTICATION SYSTEM (maiúsculo)
❌ feat: implementar sistema de autenticação de usuários com JWT e refresh tokens (muito longo)
```

### Configuração

O projeto já está configurado com:
- Template de commit em português (`.gitmessage`)
- Configurações do VS Code para commits
- Validação de tamanho de mensagem

### Como Usar

1. **No VS Code**: Ao fazer commit, o template em português aparecerá automaticamente
2. **Na linha de comando**: Use `git commit` (sem `-m`) para abrir o template
3. **Commit rápido**: `git commit -m "feat: sua mensagem aqui"`

### Dicas

- Seja específico mas conciso
- Explique o "o que" e "por que", não o "como"
- Use referências de issues quando aplicável: `Closes #123`
- Para mudanças grandes, use o corpo da mensagem para mais detalhes