# Requirements Document

## Introduction

Este documento especifica os requisitos para aprimorar o sistema de notificações existente no dashboard da Barbear.IA, focando na melhoria da interface de exibição das notificações no canto superior direito, próximo ao ícone do sininho.

## Glossary

- **Sistema_Notificacao**: O sistema completo de notificações da aplicação Barbear.IA
- **Dropdown_Notificacao**: O componente de interface que exibe a lista de notificações quando acionado
- **Sininho_Aviso**: O ícone de sino (Bell) localizado no header que indica notificações disponíveis
- **Card_Notificacao**: O cartão individual que representa uma notificação específica
- **Badge_Contador**: O indicador visual que mostra a quantidade de notificações não lidas
- **Usuario**: Pessoa que utiliza o sistema (barbeiro, administrador, etc.)
- **Dashboard**: A tela principal da aplicação após o login

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero visualizar minhas notificações de forma clara e organizada no canto superior direito do dashboard, para que eu possa acompanhar eventos importantes sem sair da tela atual.

#### Acceptance Criteria

1. WHEN o Usuario clica no Sininho_Aviso, THE Sistema_Notificacao SHALL exibir o Dropdown_Notificacao posicionado no canto superior direito
2. THE Dropdown_Notificacao SHALL apresentar uma lista scrollável de Card_Notificacao organizados por timestamp
3. THE Sistema_Notificacao SHALL exibir um Badge_Contador sobre o Sininho_Aviso indicando o número de notificações não lidas
4. WHEN o Usuario clica fora do Dropdown_Notificacao, THE Sistema_Notificacao SHALL fechar automaticamente o dropdown
5. THE Dropdown_Notificacao SHALL ter largura fixa de 320px e altura máxima de 400px com scroll interno

### Requirement 2

**User Story:** Como um usuário, eu quero que cada notificação seja apresentada em um card visualmente distinto com informações claras, para que eu possa rapidamente identificar o tipo e importância de cada notificação.

#### Acceptance Criteria

1. THE Card_Notificacao SHALL exibir ícone específico baseado no tipo da notificação (agendamento, pagamento, cliente, sistema, lembrete)
2. THE Card_Notificacao SHALL apresentar borda colorida à esquerda indicando prioridade (vermelha para alta, amarela para média, cinza para baixa)
3. WHEN uma notificação não foi lida, THE Card_Notificacao SHALL ter fundo destacado e ponto azul indicativo
4. THE Card_Notificacao SHALL exibir título, mensagem, timestamp relativo e avatar do cliente quando aplicável
5. WHEN o Usuario passa o mouse sobre um Card_Notificacao, THE Sistema_Notificacao SHALL destacar visualmente o card com efeito hover

### Requirement 3

**User Story:** Como um usuário, eu quero poder interagir com as notificações individualmente ou em grupo, para que eu possa gerenciar eficientemente meu fluxo de trabalho.

#### Acceptance Criteria

1. WHEN o Usuario clica em um Card_Notificacao não lido, THE Sistema_Notificacao SHALL marcar a notificação como lida
2. THE Dropdown_Notificacao SHALL apresentar botão "Marcar todas como lidas" no cabeçalho
3. WHEN o Usuario clica no botão de remoção de uma notificação, THE Sistema_Notificacao SHALL remover a notificação da lista
4. THE Sistema_Notificacao SHALL exibir toast de confirmação após ações de marcar como lida ou remover
5. WHEN todas as notificações são marcadas como lidas, THE Badge_Contador SHALL desaparecer do Sininho_Aviso

### Requirement 4

**User Story:** Como um usuário, eu quero que o sistema de notificações seja responsivo e acessível, para que eu possa utilizá-lo em diferentes dispositivos e condições.

#### Acceptance Criteria

1. THE Dropdown_Notificacao SHALL adaptar sua largura para telas menores que 768px
2. THE Sistema_Notificacao SHALL suportar navegação por teclado para acessibilidade
3. THE Card_Notificacao SHALL ter contraste adequado entre texto e fundo em ambos os temas (claro/escuro)
4. WHEN não há notificações disponíveis, THE Dropdown_Notificacao SHALL exibir estado vazio com ícone e mensagem explicativa
5. THE Sistema_Notificacao SHALL manter performance adequada com até 50 notificações carregadas

### Requirement 5

**User Story:** Como um usuário, eu quero que as notificações sejam categorizadas e formatadas de acordo com seu tipo, para que eu possa priorizar minhas ações baseado na importância e contexto.

#### Acceptance Criteria

1. THE Sistema_Notificacao SHALL suportar cinco tipos de notificação: agendamento, pagamento, cliente, sistema e lembrete
2. THE Card_Notificacao SHALL exibir timestamp formatado relativamente (5min atrás, 2h atrás, 1d atrás)
3. WHEN a notificação é relacionada a um cliente, THE Card_Notificacao SHALL exibir avatar e nome do cliente
4. THE Dropdown_Notificacao SHALL apresentar botão "Ver Todas as Notificações" no rodapé quando há notificações
5. THE Sistema_Notificacao SHALL ordenar notificações por timestamp decrescente (mais recentes primeiro)