# Documento de Requisitos - Correção de Deploy OCI

## Introdução

O sistema Barbear.IA apresenta problemas de autenticação e autorização em ambiente de produção na OCI, onde apenas usuários superadmin conseguem acessar o dashboard após login, enquanto outros usuários autenticam com sucesso mas não conseguem visualizar o dashboard. O sistema funciona perfeitamente em ambiente local.

## Glossário

- **Sistema_Frontend**: A aplicação React/Vite do Barbear.IA executada em container Docker
- **OCI_Environment**: Ambiente de produção Oracle Cloud Infrastructure
- **Container_Instance**: Instância Docker do frontend em execução na OCI
- **Dashboard_Access**: Capacidade de visualizar a interface principal após autenticação
- **Authentication_Service**: Serviço responsável pela autenticação de usuários
- **Authorization_Service**: Serviço responsável pela autorização de acesso ao dashboard
- **Deploy_Pipeline**: Pipeline de CI/CD via GitHub Actions para deploy na OCI
- **Cache_System**: Sistema de cache do nginx e navegador que pode interferir na aplicação

## Requisitos

### Requisito 1

**User Story:** Como desenvolvedor, eu quero desenvolver e testar as alterações em uma branch dedicada, para que possa validar completamente a solução antes de fazer deploy na OCI.

#### Critérios de Aceitação

1. WHEN desenvolvimento é iniciado, THE Sistema_Frontend SHALL criar branch específica para correção do problema de autenticação
2. WHEN alterações são implementadas, THE Sistema_Frontend SHALL permitir testes completos em ambiente local
3. WHEN testes são executados, THE Sistema_Frontend SHALL validar funcionamento de todos os tipos de usuário
4. WHEN branch está pronta, THE Sistema_Frontend SHALL permitir merge seguro para branch principal
5. WHERE problemas são encontrados, THE Sistema_Frontend SHALL permitir iteração rápida sem afetar produção

### Requisito 2

**User Story:** Como administrador do sistema, eu quero realizar uma limpeza completa e segura do container na OCI após validação local, para que possa recriar o ambiente de produção sem afetar outros containers.

#### Critérios de Aceitação

1. WHEN o script de limpeza é executado, THE Sistema_Frontend SHALL parar apenas containers relacionados ao barbear.ai
2. WHEN containers são removidos, THE Sistema_Frontend SHALL preservar todos os outros containers em execução na OCI
3. WHEN imagens Docker são removidas, THE Sistema_Frontend SHALL remover apenas imagens relacionadas ao barbear.ai
4. WHEN volumes são limpos, THE Sistema_Frontend SHALL remover apenas volumes específicos do barbear.ai
5. WHEN a porta 3500 está ocupada, THE Sistema_Frontend SHALL liberar a porta matando apenas processos relacionados

### Requisito 3

**User Story:** Como desenvolvedor, eu quero executar um novo deploy limpo via GitHub Actions após validação local, para que o frontend seja recriado completamente do zero na OCI.

#### Critérios de Aceitação

1. WHEN o deploy é iniciado, THE Deploy_Pipeline SHALL construir uma nova imagem Docker com cache limpo
2. WHEN a imagem é construída, THE Sistema_Frontend SHALL usar configurações de produção otimizadas
3. WHEN o container é criado, THE Sistema_Frontend SHALL expor corretamente a porta 3500
4. WHEN o nginx é configurado, THE Sistema_Frontend SHALL aplicar configurações anti-cache para debug
5. WHEN o healthcheck é executado, THE Sistema_Frontend SHALL responder corretamente na porta 80

### Requisito 4

**User Story:** Como desenvolvedor, eu quero refatorar o sistema de autenticação para usar simulação de API REST com arquivos JSON, para que possa eliminar problemas de cache do localStorage e tornar o sistema mais robusto.

#### Critérios de Aceitação

1. WHEN dados de usuário são necessários, THE Sistema_Frontend SHALL carregar informações de arquivos JSON estáticos
2. WHEN autenticação é realizada, THE Sistema_Frontend SHALL simular chamadas de API REST em vez de usar objetos hardcoded
3. WHEN sessões são gerenciadas, THE Sistema_Frontend SHALL usar estado em memória com mínimo uso do localStorage
4. WHEN dados são atualizados, THE Sistema_Frontend SHALL manter arquivos JSON versionados e organizados
5. WHERE desenvolvimento é necessário, THE Sistema_Frontend SHALL permitir testes locais completos antes do deploy

### Requisito 5

**User Story:** Como usuário não-superadmin, eu quero conseguir acessar o dashboard após autenticação, para que possa utilizar o sistema normalmente em produção.

#### Critérios de Aceitação

1. WHEN um usuário não-superadmin faz login, THE Authentication_Service SHALL validar as credenciais corretamente usando dados JSON
2. WHEN a autenticação é bem-sucedida, THE Authorization_Service SHALL conceder acesso ao dashboard sem interferência de cache
3. WHEN o dashboard é carregado, THE Sistema_Frontend SHALL exibir a interface principal completa
4. WHEN múltiplos tipos de usuário fazem login sequencialmente, THE Sistema_Frontend SHALL manter funcionalidade para todos
5. WHEN dados de sessão são gerenciados, THE Sistema_Frontend SHALL isolar dados entre diferentes tipos de usuário

### Requisito 6

**User Story:** Como administrador do sistema, eu quero monitorar e validar o funcionamento do sistema após o deploy, para que possa confirmar que todos os usuários têm acesso adequado.

#### Critérios de Aceitação

1. WHEN o deploy é concluído, THE Sistema_Frontend SHALL responder ao healthcheck na porta 3500
2. WHEN usuários fazem login, THE Sistema_Frontend SHALL registrar tentativas de autenticação nos logs
3. WHEN o dashboard é acessado, THE Sistema_Frontend SHALL registrar acesso bem-sucedido nos logs
4. WHEN problemas são detectados, THE Sistema_Frontend SHALL fornecer mensagens de erro claras
5. WHERE monitoramento é necessário, THE Sistema_Frontend SHALL manter logs acessíveis via SSH na OCI