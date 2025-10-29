# Database Mock - Barbear.IA

## Estrutura de Dados

Esta pasta contém os dados JSON mockados para o sistema Barbear.IA. A API simulada está localizada em `/src/api/` no mesmo nível.

### Estrutura do Projeto

```
src/
├── database/          # Dados JSON mockados
│   ├── users.json
│   ├── appointments.json
│   └── ...
└── api/              # API simulada
    ├── auth.ts
    ├── users.ts
    └── ...
```

### Entidades Principais

#### Users (`users.json`)
- Usuários do sistema (super_admin, admin, barber, client)
- Inclui credenciais, perfis e configurações
- Relacionamento com tenants via `tenantId`

#### Barbershops (`barbershops.json`)
- Dados das barbearias (tenants)
- Configurações de negócio, horários, assinatura
- Endereços e informações de contato

#### Services (`services.json`)
- Serviços oferecidos por cada barbearia
- Preços, duração, categorias
- Relacionamento com tenants via `tenantId`

#### Barbers (`barbers.json`)
- Perfis dos barbeiros
- Especialidades, horários de trabalho, avaliações
- Relacionamento com users e tenants

#### Clients (`clients.json`)
- Perfis dos clientes
- Preferências, histórico, dados de contato
- Relacionamento com users e tenants

#### Appointments (`appointments.json`)
- Agendamentos do sistema
- Status, preços, notas, relacionamentos
- Vincula clients, barbers, services e tenants

#### Dashboard Stats (`dashboard-stats.json`)
- Estatísticas pré-calculadas para dashboards
- Dados globais, por tenant, barber e client
- Métricas de performance e relatórios

#### Sessions (`sessions.json`)
- Templates de sessão por tipo de usuário
- Permissões, seções do dashboard, escopo de dados
- Configurações de token e timeout

#### Indexes (`indexes.json`)
- Índices para consultas relacionais rápidas
- Lookup tables para busca eficiente
- Contadores e metadados

## Relacionamentos

### Hierarquia de Dados
```
Super Admin (global)
├── Barbershop 1 (tenant-1)
│   ├── Admin 1
│   ├── Barber 1, Barber 2
│   ├── Client 1, Client 2
│   ├── Service 1-4
│   └── Appointments 1,2,3,5
└── Barbershop 2 (tenant-2)
    ├── Barber 3
    ├── Client 3
    ├── Service 5-6
    └── Appointments 4,6
```

### Chaves de Relacionamento
- `tenantId` - Vincula entidades à barbearia
- `userId` - Vincula perfis específicos ao usuário base
- `barberId` - Referência ao barbeiro em agendamentos
- `clientId` - Referência ao cliente em agendamentos
- `serviceId` - Referência ao serviço em agendamentos

## Dados de Teste

### Credenciais de Login
- **Super Admin**: admin@barbear.ia / super123
- **Admin**: admin@barbearia.com / admin123
- **Barber**: barbeiro@barbearia.com / barber123
- **Client**: cliente@email.com / cliente123

### Cenários de Teste
1. **Multi-tenant**: 2 barbearias com dados independentes
2. **Roles diferentes**: Cada tipo de usuário com permissões específicas
3. **Agendamentos**: Estados variados (scheduled, completed, cancelled)
4. **Estatísticas**: Dados realistas para dashboards
5. **Relacionamentos**: Vínculos consistentes entre entidades

## Uso da API Simulada

A API simulada será implementada em `/api/` e fornecerá:
- Endpoints REST padrão (GET, POST, PUT, DELETE)
- Autenticação e autorização baseada em roles
- Filtros por tenant, barber, client
- Paginação e ordenação
- Validação de dados
- Simulação de delays de rede

## Migração Futura

Esta estrutura está preparada para migração para API real:
- Schemas JSON podem ser convertidos para modelos de banco
- Relacionamentos estão bem definidos
- Índices identificam consultas necessárias
- Permissões mapeadas por role
- Dados de teste abrangentes para validação