# Design Document - Limpeza e Organização do Projeto

## Overview

Este documento detalha o design para realizar uma limpeza completa e sistemática do projeto Barbear.IA, removendo arquivos desnecessários, organizando a estrutura e garantindo que apenas componentes e arquivos essenciais permaneçam no projeto.

## Architecture

### Análise em Fases
1. **Fase de Descoberta**: Identificar todos os arquivos e suas dependências
2. **Fase de Análise**: Determinar quais arquivos são utilizados
3. **Fase de Validação**: Confirmar segurança da remoção
4. **Fase de Execução**: Remover arquivos desnecessários
5. **Fase de Verificação**: Validar funcionamento pós-limpeza

### Estratégia de Segurança
- Criar backup completo antes de qualquer remoção
- Análise de dependências em múltiplas camadas
- Validação através de build e testes
- Rollback automático em caso de problemas

## Components and Interfaces

### 1. Analisador de Componentes React
**Responsabilidade**: Identificar componentes não utilizados
- Escanear todos os arquivos `.tsx` e `.ts`
- Mapear importações e exportações
- Identificar componentes órfãos
- Verificar uso em rotas e lazy loading

### 2. Analisador de Dependências
**Responsabilidade**: Identificar pacotes npm não utilizados
- Analisar `package.json` vs código fonte
- Verificar imports diretos e indiretos
- Identificar dependências de desenvolvimento não usadas
- Validar scripts e configurações

### 3. Analisador de Documentação
**Responsabilidade**: Identificar documentos obsoletos
- Arquivos de instruções de processos concluídos
- Documentação de deploy temporária
- Arquivos de backup e temporários
- Logs e arquivos de debug

### 4. Organizador de Estrutura
**Responsabilidade**: Reorganizar pastas e arquivos
- Consolidar componentes relacionados
- Organizar utilitários e helpers
- Centralizar configurações
- Padronizar nomenclatura

## Data Models

### Arquivo de Análise
```typescript
interface FileAnalysis {
  path: string;
  type: 'component' | 'utility' | 'config' | 'documentation' | 'asset';
  isUsed: boolean;
  dependencies: string[];
  dependents: string[];
  size: number;
  lastModified: Date;
  safeToRemove: boolean;
  reason?: string;
}
```

### Resultado da Limpeza
```typescript
interface CleanupResult {
  filesRemoved: string[];
  filesReorganized: { from: string; to: string }[];
  dependenciesRemoved: string[];
  spaceSaved: number;
  errors: string[];
  warnings: string[];
}
```

## Error Handling

### Estratégias de Recuperação
1. **Backup Automático**: Criar backup completo antes da limpeza
2. **Validação Incremental**: Testar após cada remoção significativa
3. **Rollback Automático**: Restaurar backup se build falhar
4. **Log Detalhado**: Registrar todas as operações para auditoria

### Cenários de Erro
- Arquivo essencial identificado incorretamente como não usado
- Dependência indireta não detectada
- Quebra de build após remoção
- Perda de funcionalidade não detectada em análise estática

## Testing Strategy

### Validação Pré-Limpeza
1. **Build Atual**: Confirmar que projeto builda sem erros
2. **Testes Funcionais**: Executar testes existentes
3. **Análise de Dependências**: Mapear todas as relações

### Validação Pós-Limpeza
1. **Build de Produção**: Confirmar build sem erros
2. **Testes de Regressão**: Validar funcionalidades principais
3. **Análise de Performance**: Verificar melhorias de tamanho/velocidade
4. **Teste Manual**: Verificar rotas e funcionalidades críticas

## Implementation Plan

### Categorias de Arquivos para Análise

#### 1. Componentes React
- `src/components/**/*.tsx`
- Verificar importações em `App.tsx`, rotas, e outros componentes
- Identificar componentes de exemplo ou teste não utilizados

#### 2. Arquivos de Configuração
- Configurações duplicadas ou obsoletas
- Arquivos de setup de processos já concluídos
- Configurações de ferramentas não utilizadas

#### 3. Documentação Temporária
- `DEPLOY_INSTRUCTIONS.md` (processo concluído)
- Arquivos de log de deploy
- Documentação de setup já realizado
- Arquivos README específicos de processos

#### 4. Assets e Recursos
- Imagens não referenciadas
- Fontes não utilizadas
- Ícones duplicados ou obsoletos

#### 5. Dependências NPM
- Pacotes instalados mas não importados
- Dependências de desenvolvimento não utilizadas
- Versões duplicadas ou conflitantes

### Ordem de Execução
1. **Backup**: Criar backup completo do projeto
2. **Análise**: Executar análise completa de dependências
3. **Documentação**: Remover documentação obsoleta (baixo risco)
4. **Assets**: Remover recursos não utilizados
5. **Dependências**: Remover pacotes npm não utilizados
6. **Componentes**: Remover componentes não utilizados (alto risco)
7. **Reorganização**: Reorganizar estrutura de pastas
8. **Validação**: Executar testes e build final

### Ferramentas de Análise
- **depcheck**: Para identificar dependências não utilizadas
- **Análise estática**: Para mapear importações de componentes
- **grep/ripgrep**: Para buscar referências em todo o projeto
- **Análise de bundle**: Para identificar código não utilizado no build final