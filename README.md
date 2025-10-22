
# 💈 Barbear.IA

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![OCI](https://img.shields.io/badge/Oracle_Cloud-Deployed-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/cloud/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge)](https://opensource.org/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

> **Sistema SaaS completo para gestão de barbearias com arquitetura multi-tenant, desenvolvido com React, TypeScript e design moderno.**

## 🎯 Sobre o Projeto

O **Barbear.IA** é uma plataforma SaaS (Software as a Service) moderna e completa para gestão de barbearias, desenvolvida com foco na experiência do usuário e eficiência operacional. O sistema oferece uma solução integrada para agendamentos, gestão de clientes, barbeiros, serviços e muito mais.

### 🌟 Características Principais

- **🏢 Multi-tenant**: Suporte a múltiplas barbearias em uma única plataforma
- **👥 Gestão de Usuários**: Sistema completo com diferentes níveis de acesso
- **📱 Responsivo**: Interface adaptável para desktop, tablet e mobile
- **🎨 Design Moderno**: Interface elegante baseada em design do Figma
- **⚡ Performance**: Construído com Vite para máxima velocidade
- **🔒 Seguro**: Autenticação robusta e controle de acesso
- **☁️ Cloud Ready**: Deploy automatizado na Oracle Cloud Infrastructure

## 🚀 Funcionalidades

### 📊 Dashboard Inteligente
- **Métricas em tempo real**: Agendamentos do dia, receita semanal, taxa de conclusão
- **Gráficos interativos**: Visualização de dados com Recharts
- **Próximos agendamentos**: Lista dos próximos compromissos
- **Clientes recentes**: Histórico de atendimentos

### 📅 Sistema de Agendamentos
- **Calendário interativo**: Visualização mensal, semanal e diária
- **Agendamento rápido**: Interface intuitiva para criar novos agendamentos
- **Status de agendamentos**: Agendado, confirmado, em andamento, concluído, cancelado
- **Notificações**: Sistema de lembretes e confirmações

### 👥 Gestão de Clientes
- **Cadastro completo**: Informações pessoais, histórico e preferências
- **Perfil do cliente**: Visualização detalhada com histórico de atendimentos
- **Busca avançada**: Filtros por nome, telefone, email
- **Notas personalizadas**: Observações sobre preferências e histórico

### ✂️ Gestão de Barbeiros
- **Perfis profissionais**: Informações, especialidades e horários de trabalho
- **Agenda personalizada**: Horários de trabalho configuráveis por dia
- **Serviços oferecidos**: Associação de serviços específicos por barbeiro
- **Controle de disponibilidade**: Ativação/desativação de barbeiros

### 🛍️ Catálogo de Serviços
- **Serviços personalizados**: Nome, descrição, preço e duração
- **Categorização**: Organização por categorias de serviços
- **Preços flexíveis**: Configuração individual de valores
- **Tempo de duração**: Controle preciso do tempo de cada serviço

### 🏢 Gestão Multi-tenant
- **Super Admin Dashboard**: Controle total da plataforma
- **Aprovação de barbearias**: Sistema de aprovação para novos estabelecimentos
- **Gestão de usuários**: Controle de acesso e permissões
- **Métricas globais**: Estatísticas de toda a plataforma

### 💳 Sistema de Assinatura
- **Planos flexíveis**: Trial, Básico e Premium
- **Integração Stripe**: Pagamentos seguros e automatizados
- **Controle de acesso**: Funcionalidades baseadas no plano contratado
- **Gestão de cobrança**: Controle automático de renovações

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca principal para interface
- **TypeScript 5.9.3** - Tipagem estática para maior segurança
- **Vite 6.3.5** - Build tool moderna e rápida
- **TailwindCSS** - Framework CSS utilitário
- **Framer Motion** - Animações fluidas e interativas

### UI/UX
- **Radix UI** - Componentes acessíveis e customizáveis
- **Lucide React** - Ícones modernos e consistentes
- **Sonner** - Notificações elegantes
- **Recharts** - Gráficos e visualizações de dados

### Desenvolvimento
- **React Hook Form** - Gerenciamento de formulários
- **Class Variance Authority** - Variantes de componentes
- **CLSX** - Utilitário para classes condicionais
- **React Day Picker** - Seletor de datas avançado

### DevOps & Deploy
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de containers
- **GitHub Actions** - CI/CD automatizado
- **Nginx** - Servidor web de produção
- **Oracle Cloud Infrastructure** - Hospedagem em nuvem

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### 🔧 Clonando o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/barbear-ia.git

# Entre no diretório
cd barbear-ia

# Instale as dependências
npm install
```

### 🚀 Executando Localmente

```bash
# Modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

A aplicação estará disponível em `http://localhost:5173`

### 🐳 Executando com Docker

```bash
# Build da imagem
docker build -t barbear-ia .

# Executar container
docker run -p 3500:80 barbear-ia

# Ou usar Docker Compose
docker-compose up -d
```

## 🌐 Deploy na Oracle Cloud Infrastructure

O projeto está configurado para deploy automático na OCI através do GitHub Actions.

### Configuração dos Secrets

Configure os seguintes secrets no GitHub:

```bash
OCI_HOST=your-oci-instance-ip
OCI_USERNAME=your-ssh-username  
OCI_SSH_KEY=your-private-ssh-key
```

### Deploy Automático

O deploy é acionado automaticamente quando:
- Push para branch `master`
- Pull requests (apenas build e test)

### Acesso à Aplicação

Após o deploy, a aplicação estará disponível em:
- **URL**: `http://your-oci-ip:3500`
- **Porta**: 3500
- **Protocolo**: HTTP

## 🎨 Design e UI/UX

O design do Barbear.IA foi cuidadosamente criado no **Figma**, seguindo as melhores práticas de UX/UI:

- **Design System**: Componentes consistentes e reutilizáveis
- **Paleta de Cores**: Esquema moderno com suporte a tema escuro/claro
- **Tipografia**: Hierarquia clara e legível
- **Iconografia**: Ícones da biblioteca Lucide para consistência
- **Responsividade**: Layout adaptável para todos os dispositivos
- **Acessibilidade**: Componentes Radix UI garantem acessibilidade

## 👥 Tipos de Usuário

### 🔧 Super Admin
- Controle total da plataforma
- Aprovação de novas barbearias
- Gestão de usuários globais
- Métricas e relatórios gerais

### 🏢 Admin (Barbearia)
- Gestão completa da barbearia
- Controle de barbeiros e serviços
- Relatórios e métricas da unidade
- Configurações do estabelecimento

### ✂️ Barbeiro
- Visualização da própria agenda
- Gestão dos próprios clientes
- Controle dos serviços oferecidos
- Atualização de disponibilidade

### 👤 Cliente
- Visualização de agendamentos
- Busca por barbearias
- Histórico de atendimentos
- Perfil pessoal

## 🔐 Autenticação

Sistema de autenticação robusto com:
- Login por tipo de usuário
- Senhas criptografadas
- Sessões seguras
- Controle de acesso baseado em roles

### Usuários de Demonstração

```bash
# Super Admin
Email: admin@barbear.ia
Senha: super123

# Admin Barbearia
Email: admin@barbearia.com
Senha: admin123

# Barbeiro
Email: barbeiro@barbearia.com
Senha: barber123

# Cliente
Email: cliente@email.com
Senha: cliente123
```

## 📈 Roadmap

- [ ] **App Mobile**: Desenvolvimento de aplicativo nativo
- [ ] **Integração WhatsApp**: Notificações automáticas
- [ ] **Sistema de Pagamento**: Integração com PIX e cartões
- [ ] **Relatórios Avançados**: Analytics detalhados
- [ ] **API Pública**: Integração com sistemas externos
- [ ] **Multi-idioma**: Suporte a múltiplos idiomas

## 🤝 Contribuindo

Este é um projeto **open source** e contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@barbear.ia
- **GitHub Issues**: [Reportar Bug](https://github.com/seu-usuario/barbear-ia/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/barbear-ia/wiki)

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade de barbearias**

[🌟 Dar uma estrela](https://github.com/seu-usuario/barbear-ia) • [🐛 Reportar Bug](https://github.com/seu-usuario/barbear-ia/issues) • [💡 Sugerir Feature](https://github.com/seu-usuario/barbear-ia/issues)

</div>
  