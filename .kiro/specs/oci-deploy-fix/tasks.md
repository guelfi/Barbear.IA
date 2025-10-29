# Plano de Implementação - Correção de Deploy OCI

- [x] 1. Preparar ambiente de desenvolvimento


  - Criar branch dedicada `fix/oci-auth-issues` a partir da branch principal
  - Configurar ambiente local para desenvolvimento e testes
  - Documentar estado atual do sistema de autenticação
  - _Requisitos: 1.1, 1.2, 1.3_



- [x] 2. Criar estrutura completa de database mockado


  - [x] 2.1 Criar diretório `/src/database/` com estrutura organizada

    - Criar pasta `/src/database/` na raiz do projeto src
    - Criar subpasta `/src/database/api/` para simulação de endpoints


    - Criar subpasta `/src/database/data/` para arquivos JSON de dados
    - _Requisitos: 4.1, 4.4_

  - [x] 2.2 Implementar arquivos JSON para todas as entidades do sistema

    - Criar `users.json` com dados completos dos usuários
    - Criar `appointments.json` com dados de agendamentos mockados
    - Criar `clients.json` com dados de clientes da barbearia
    - Criar `barbers.json` com dados dos barbeiros

    - Criar `services.json` com dados dos serviços oferecidos

    - Criar `barbershops.json` com dados das barbearias (tenants)
    - Criar `dashboard-stats.json` com estatísticas para dashboards


    - _Requisitos: 4.1, 4.2_

  - [x] 2.3 Implementar arquivo `sessions.json` com templates de sessão

    - Criar templates de sessão para cada tipo de usuário
    - Definir estrutura de dados de sessão em memória


    - _Requisitos: 4.3, 4.4_

  - [x] 2.4 Estruturar dados relacionais entre entidades

    - Definir relacionamentos entre usuários e barbearias (tenantId)


    - Criar vínculos entre agendamentos, clientes, barbeiros e serviços
    - Implementar dados de exemplo realistas para todos os cenários
    - _Requisitos: 4.1, 4.4_

- [x] 3. Implementar simulação completa de API REST

  - [x] 3.1 Criar módulo de autenticação simulada

    - Implementar `/src/database/api/auth.ts` com endpoints simulados


    - Criar funções para login, logout e validação de sessão
    - Simular delays de rede para comportamento realista
    - _Requisitos: 4.2, 4.3_



  - [x] 3.2 Criar módulos de API para todas as entidades

    - Implementar `/src/database/api/users.ts` com CRUD de usuários
    - Implementar `/src/database/api/appointments.ts` com CRUD de agendamentos
    - Implementar `/src/database/api/clients.ts` com CRUD de clientes
    - Implementar `/src/database/api/barbers.ts` com CRUD de barbeiros


    - Implementar `/src/database/api/services.ts` com CRUD de serviços
    - Implementar `/src/database/api/barbershops.ts` com CRUD de barbearias
    - _Requisitos: 4.1, 4.2_

  - [x] 3.3 Implementar endpoints de dashboard e estatísticas


    - Criar `/src/database/api/dashboard.ts` com dados de dashboard
    - Implementar endpoints para estatísticas por tipo de usuário
    - Criar endpoints para relatórios e métricas
    - _Requisitos: 4.1, 5.2, 5.3_



  - [x] 3.4 Criar sistema de roteamento de API simulada

    - Implementar `/src/database/api/index.ts` como ponto central
    - Criar sistema de roteamento que simula endpoints REST




    - Implementar middleware para autenticação e autorização
    - Adicionar sistema de paginação e filtros
    - _Requisitos: 4.2, 4.4_

  - [x] 3.5 Implementar sistema de gerenciamento de estado em memória

    - Criar store em memória para dados de sessão ativa
    - Implementar lógica de isolamento entre diferentes tipos de usuário
    - Minimizar uso do localStorage apenas para token de sessão
    - _Requisitos: 4.3, 5.5_

- [x] 4. Refatorar AuthContext



  - [x] 4.1 Atualizar AuthContext para usar API simulada

    - Remover objetos mockUsers e mockPasswords hardcoded
    - Integrar chamadas para API simulada em `/src/database/api/`
    - Manter interface existente para compatibilidade
    - _Requisitos: 4.2, 4.3_

  - [x] 4.2 Implementar novo sistema de gerenciamento de sessão

    - Refatorar lógica de login para usar estado em memória
    - Implementar lógica de logout com limpeza completa de estado
    - Adicionar validação de sessão na inicialização da aplicação
    - _Requisitos: 4.3, 5.5_

  - [x] 4.3 Adicionar logs detalhados para debugging

    - Implementar logging estruturado para todas as operações de auth
    - Adicionar logs específicos para identificar problemas de sessão
    - Integrar com ProductionDebugPanel existente
    - _Requisitos: 5.1, 5.2_




- [x] 5. Atualizar componentes para usar nova API simulada

  - [x] 5.1 Refatorar componentes de dashboard para usar API simulada


    - Atualizar Dashboard.tsx para consumir endpoints de estatísticas via dashboardAPI
    - Atualizar SuperAdminDashboard.tsx para usar dados da API em vez de mockSuperAdminStats
    - Remover importação de mockDashboardStatsComplete e usar API calls
    - _Requisitos: 5.2, 5.3_

  - [x] 5.2 Atualizar componentes de CRUD para usar API simulada


    - Refatorar UserManagement.tsx para usar usersAPI em vez de mockUsers hardcoded
    - Atualizar AppointmentCalendar para usar endpoints de agendamentos
    - Atualizar ClientList e ClientForm para usar API de clientes
    - Modificar BarberList e BarberForm para usar API de barbeiros
    - Atualizar ServiceList e ServiceForm para usar API de serviços
    - _Requisitos: 4.1, 4.2_

  - [x] 5.3 Verificar compatibilidade do App.tsx com mudanças


    - Validar que renderização condicional funciona com novo sistema
    - Testar fluxo de autenticação e redirecionamento
    - _Requisitos: 5.2, 5.3_

  - [x] 5.4 Finalizar ProductionDebugPanel para novos logs


    - Completar implementação do componente ProductionDebugPanel
    - Implementar export de dados de sessão para debugging
    - Adicionar monitoramento de chamadas de API
    - Integrar com App.tsx para exibição em produção
    - _Requisitos: 4.5, 6.2_

- [x] 6. Implementar testes locais completos

  - [x] 6.1 Testar login sequencial com diferentes tipos de usuário



    - Testar login como super_admin, admin, barber e client
    - Validar que cada tipo acessa o dashboard correto com dados apropriados
    - Verificar que não há interferência entre sessões
    - _Requisitos: 5.1, 5.2, 5.4_

  - [x] 6.2 Testar funcionalidades completas de cada tipo de usuário


    - Validar que super_admin vê dados de todas as barbearias
    - Testar que admin vê apenas dados de sua barbearia
    - Verificar que barber vê apenas seus agendamentos e clientes
    - Validar que client vê apenas seus próprios dados
    - _Requisitos: 5.1, 5.2, 5.3_

  - [x] 6.3 Testar operações CRUD com API simulada


    - Testar criação, edição e exclusão de agendamentos
    - Validar operações de clientes, barbeiros e serviços
    - Verificar que dados persistem durante a sessão
    - _Requisitos: 4.1, 4.2_

  - [x] 6.4 Testar cenários de cache e limpeza


    - Testar comportamento após limpeza de cache do navegador
    - Validar que sistema recupera estado corretamente
    - Testar múltiplos logins/logouts sequenciais
    - _Requisitos: 5.5, 5.4_

  - [ ]* 6.3 Executar testes de performance local
    - Medir tempo de carregamento da aplicação
    - Validar que simulação de API não impacta performance
    - _Requisitos: 4.5_

- [x] 7. Preparar para deploy


  - [x] 7.1 Revisar e documentar todas as alterações


    - Criar documentação das mudanças implementadas
    - Validar que todos os arquivos necessários estão incluídos no build
    - _Requisitos: 1.4, 4.4_

  - [x] 7.2 Executar testes finais em ambiente local



    - Executar suite completa de testes de autenticação
    - Validar build de produção local
    - Testar que ProductionDebugPanel funciona em build de produção
    - _Requisitos: 1.3, 4.5_

  - [x] 7.3 Fazer merge da branch para principal

    - Revisar todas as alterações antes do merge
    - Executar merge para branch principal
    - Validar que CI/CD pipeline está funcionando
    - _Requisitos: 1.4, 3.1_

- [ ] 8. Executar limpeza na OCI
  - [ ] 8.1 Conectar via SSH na instância OCI
    - Estabelecer conexão SSH segura com a instância
    - Navegar para diretório do projeto
    - _Requisitos: 2.1, 2.2_

  - [ ] 8.2 Executar script de limpeza seletiva
    - Executar `cleanup-container.sh` para remover recursos do barbear.ai
    - Validar que apenas containers relacionados foram removidos
    - Verificar que porta 3500 está liberada
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 8.3 Validar limpeza completa
    - Verificar que não há containers ou processos órfãos
    - Confirmar que outros projetos não foram afetados
    - _Requisitos: 2.2, 2.5_

- [ ] 9. Executar deploy na OCI
  - [ ] 9.1 Iniciar deploy via GitHub Actions
    - Triggerar workflow de deploy para OCI
    - Monitorar build em tempo real
    - _Requisitos: 3.1, 3.2_

  - [ ] 9.2 Validar build e deploy
    - Confirmar que imagem Docker foi construída corretamente
    - Validar que container foi criado e está rodando
    - Verificar que porta 3500 está respondendo
    - _Requisitos: 3.2, 3.3, 3.4, 3.5_

  - [ ] 9.3 Executar healthcheck inicial
    - Testar endpoint de health da aplicação
    - Validar que nginx está servindo arquivos corretamente
    - _Requisitos: 3.5, 6.1_

- [ ] 10. Validar funcionamento em produção
  - [ ] 10.1 Testar autenticação de todos os tipos de usuário
    - Testar login como super_admin na OCI
    - Testar login como admin, barber e client na OCI
    - Validar que dashboard carrega para todos os tipos
    - _Requisitos: 5.1, 5.2, 5.3_

  - [ ] 10.2 Ativar e monitorar ProductionDebugPanel
    - Ativar painel de debug em produção
    - Coletar logs de autenticação e dashboard
    - Exportar logs para análise
    - _Requisitos: 6.2, 6.3, 6.4_

  - [ ]* 10.3 Monitorar sistema por 24-48 horas
    - Acompanhar comportamento do sistema em produção
    - Coletar métricas de performance e estabilidade
    - Documentar qualquer comportamento anômalo
    - _Requisitos: 6.5_