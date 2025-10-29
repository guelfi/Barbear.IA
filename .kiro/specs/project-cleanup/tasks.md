# Plano de Implementação - Limpeza e Organização do Projeto

- [x] 1. Preparar ambiente para limpeza segura


  - Criar backup completo do projeto atual
  - Verificar que build atual funciona sem erros
  - Documentar estado atual do projeto (tamanho, estrutura)
  - _Requisitos: 2.5_


- [ ] 2. Instalar e configurar ferramentas de análise
  - [ ] 2.1 Instalar depcheck para análise de dependências npm
    - Executar `npm install -g depcheck`
    - Configurar análise para ignorar dependências de desenvolvimento essenciais
    - _Requisitos: 1.3_

  - [ ] 2.2 Configurar análise estática de componentes
    - Criar script para mapear todas as importações de componentes
    - Identificar componentes exportados vs importados
    - _Requisitos: 1.1_

- [ ] 3. Executar análise completa de dependências
  - [ ] 3.1 Analisar dependências npm não utilizadas
    - Executar depcheck no projeto
    - Identificar pacotes instalados mas não importados
    - Verificar dependências indiretas e de build
    - _Requisitos: 1.3_

  - [ ] 3.2 Mapear uso de componentes React
    - Escanear todos os arquivos .tsx/.ts para importações
    - Identificar componentes não referenciados
    - Verificar uso em rotas e lazy loading
    - _Requisitos: 1.1, 2.2_

  - [ ] 3.3 Identificar arquivos de documentação obsoletos
    - Listar arquivos .md relacionados a processos concluídos
    - Identificar arquivos de log e temporários
    - Verificar documentação de deploy já realizado
    - _Requisitos: 1.2_



- [ ] 4. Remover documentação e arquivos temporários (baixo risco)
  - [ ] 4.1 Remover documentação de processos concluídos
    - Remover DEPLOY_INSTRUCTIONS.md (processo concluído)
    - Remover logs de deploy (erro_workflow.log)
    - Remover arquivos de chaves SSH temporárias
    - _Requisitos: 1.2_

  - [ ] 4.2 Limpar arquivos de backup e temporários
    - Remover arquivos com extensões .bak, .tmp, .old
    - Limpar cache de build antigo se existir
    - Remover arquivos de log de desenvolvimento
    - _Requisitos: 1.5_

- [ ] 5. Remover assets não utilizados
  - [ ] 5.1 Analisar uso de imagens e ícones
    - Verificar referências a arquivos em public/
    - Identificar imagens não utilizadas em componentes
    - Verificar ícones duplicados ou obsoletos
    - _Requisitos: 1.1_

  - [ ] 5.2 Remover assets não referenciados
    - Remover imagens não utilizadas
    - Consolidar ícones duplicados
    - Otimizar assets restantes se necessário
    - _Requisitos: 1.1_

- [ ] 6. Remover dependências npm não utilizadas
  - [ ] 6.1 Remover dependências de produção não utilizadas
    - Remover pacotes identificados pelo depcheck
    - Verificar que remoção não quebra build
    - Atualizar package.json
    - _Requisitos: 1.3, 2.3_

  - [ ] 6.2 Limpar dependências de desenvolvimento obsoletas
    - Remover dev dependencies não utilizadas
    - Verificar que scripts npm ainda funcionam
    - Executar npm install para atualizar lock file
    - _Requisitos: 1.3_

- [ ] 7. Analisar e remover componentes não utilizados (alto risco)
  - [ ] 7.1 Identificar componentes órfãos com segurança
    - Verificar dupla checagem de componentes não utilizados


    - Confirmar que não são usados em rotas dinâmicas
    - Verificar uso em lazy loading e imports condicionais
    - _Requisitos: 1.1, 2.1, 2.2_

  - [ ] 7.2 Remover componentes confirmadamente não utilizados
    - Remover apenas componentes com 100% de certeza
    - Executar build após cada remoção significativa
    - Manter log detalhado de componentes removidos
    - _Requisitos: 1.1, 2.1, 4.2_

- [ ] 8. Reorganizar estrutura de pastas
  - [ ] 8.1 Consolidar componentes relacionados
    - Agrupar componentes de funcionalidade similar
    - Organizar utilitários e helpers em pastas apropriadas
    - Centralizar configurações similares
    - _Requisitos: 3.2, 3.3_

  - [ ] 8.2 Padronizar nomenclatura e organização
    - Aplicar convenções consistentes de nomenclatura
    - Organizar imports de forma padronizada
    - Atualizar paths de importação se necessário
    - _Requisitos: 3.5_

- [ ] 9. Executar validação completa pós-limpeza
  - [ ] 9.1 Validar build de produção
    - Executar npm run build sem erros
    - Verificar que não há imports quebrados
    - Confirmar que bundle size foi otimizado
    - _Requisitos: 4.1, 4.2_

  - [ ] 9.2 Testar funcionalidades principais
    - Testar todas as rotas da aplicação
    - Verificar login com diferentes tipos de usuário
    - Confirmar que dashboards carregam corretamente
    - _Requisitos: 4.3, 4.4_

  - [ ]* 9.3 Executar testes automatizados
    - Executar suite de testes se existir
    - Verificar que não há regressões
    - _Requisitos: 4.4_

- [ ] 10. Documentar resultados da limpeza
  - [x] 10.1 Gerar relatório de limpeza


    - Documentar arquivos removidos
    - Calcular espaço economizado
    - Listar melhorias de organização
    - _Requisitos: 2.5_

  - [ ] 10.2 Atualizar documentação do projeto
    - Atualizar README se necessário
    - Documentar nova estrutura de pastas
    - Remover referências a arquivos removidos
    - _Requisitos: 3.5_

  - [x] 10.3 Fazer commit das alterações



    - Fazer commit organizado das mudanças
    - Usar mensagens descritivas para cada tipo de limpeza
    - Criar tag de versão limpa se apropriado
    - _Requisitos: 2.5_