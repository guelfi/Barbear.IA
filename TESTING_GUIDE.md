# Guia de Testes - Barbear.IA

## Ferramentas de Desenvolvimento Integradas

### 1. Verificador de Acessibilidade
**Atalho:** `Ctrl + Shift + A`

Verifica automaticamente:
- ✅ Imagens sem atributo `alt`
- ✅ Botões sem nome acessível
- ✅ Contraste de cores (mínimo 4.5:1)
- ✅ Inputs sem labels associados
- ✅ Hierarquia de cabeçalhos
- ✅ Navegação por teclado

### 2. Suite de Testes Responsivos
**Atalho:** `Ctrl + Shift + R`

Testa automaticamente:
- ✅ Comportamento do sidebar em mobile
- ✅ Visibilidade do botão de toggle
- ✅ Layouts responsivos (grids)
- ✅ Escalonamento de texto
- ✅ Tamanho de alvos de toque (mín. 44px)
- ✅ Scroll horizontal indesejado

**Dispositivos pré-configurados:**
- **Mobile:** iPhone SE, iPhone 12, iPhone 14 Pro Max, Samsung Galaxy S21, Google Pixel 6
- **Tablet:** iPad Mini, iPad Air, iPad Pro 11", Samsung Galaxy Tab
- **Desktop:** Laptop 13", Desktop HD, Desktop FHD, Desktop 4K

## Testes Manuais Recomendados

### Mobile (iOS/Android)

#### 1. Navegação Touch
- [ ] Abrir/fechar sidebar com swipe
- [ ] Fechar sidebar tocando fora
- [ ] Navegação suave entre abas
- [ ] Scroll vertical sem interferência

#### 2. Responsividade
- [ ] Layout adapta corretamente em portrait/landscape
- [ ] Textos legíveis sem zoom
- [ ] Botões com tamanho adequado para toque
- [ ] Elementos não cortados nas bordas

#### 3. Performance
- [ ] Animações fluidas (60fps)
- [ ] Carregamento rápido de componentes
- [ ] Sem travamentos durante navegação
- [ ] Uso eficiente de memória

### Tablet

#### 1. Layout Híbrido
- [ ] Sidebar visível em landscape
- [ ] Sidebar colapsável em portrait
- [ ] Aproveitamento do espaço extra
- [ ] Navegação intuitiva

### Desktop

#### 1. Funcionalidades Completas
- [ ] Sidebar sempre visível
- [ ] Hover states funcionando
- [ ] Atalhos de teclado
- [ ] Navegação por Tab

## PWA (Progressive Web App)

### 1. Instalação
- [ ] Prompt de instalação aparece
- [ ] App instala corretamente
- [ ] Ícone aparece na tela inicial
- [ ] Abre em modo standalone

### 2. Offline
- [ ] Service Worker registrado
- [ ] Cache funcionando
- [ ] Funcionalidade básica offline
- [ ] Sincronização quando online

### 3. Notificações
- [ ] Permissão solicitada adequadamente
- [ ] Notificações funcionam
- [ ] Ações nas notificações

## Acessibilidade

### 1. Navegação por Teclado
- [ ] Tab navega por todos elementos focáveis
- [ ] Enter/Space ativam botões
- [ ] Escape fecha modais/dropdowns
- [ ] Foco visível em todos elementos

### 2. Leitores de Tela
- [ ] Elementos têm labels apropriados
- [ ] Estrutura semântica correta
- [ ] Estados comunicados (aberto/fechado)
- [ ] Conteúdo dinâmico anunciado

### 3. Contraste e Legibilidade
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contraste mínimo 3:1 (texto grande)
- [ ] Texto redimensionável até 200%
- [ ] Sem dependência apenas de cor

## Performance

### 1. Métricas Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### 2. Otimizações
- [ ] Lazy loading funcionando
- [ ] Componentes pré-carregados no hover
- [ ] Bundle size otimizado
- [ ] Imagens otimizadas

## Compatibilidade de Navegadores

### Mobile
- [ ] Safari iOS 14+
- [ ] Chrome Android 90+
- [ ] Samsung Internet 14+
- [ ] Firefox Mobile 90+

### Desktop
- [ ] Chrome 90+
- [ ] Firefox 90+
- [ ] Safari 14+
- [ ] Edge 90+

## Checklist de Validação Final

### Funcionalidades Core
- [ ] Login/logout funcionando
- [ ] Navegação entre todas as seções
- [ ] Formulários validando corretamente
- [ ] Dados persistindo adequadamente

### UX/UI
- [ ] Animações suaves e consistentes
- [ ] Feedback visual em todas interações
- [ ] Estados de loading apropriados
- [ ] Mensagens de erro claras

### Segurança
- [ ] Autenticação funcionando
- [ ] Autorização por roles
- [ ] Dados sensíveis protegidos
- [ ] HTTPS em produção

### Performance
- [ ] Carregamento inicial < 3s
- [ ] Navegação instantânea
- [ ] Sem vazamentos de memória
- [ ] Uso eficiente de recursos

## Ferramentas Externas Recomendadas

### Testes de Performance
- **Lighthouse:** Auditoria completa
- **WebPageTest:** Análise detalhada de carregamento
- **GTmetrix:** Métricas de performance

### Testes de Acessibilidade
- **axe DevTools:** Extensão para Chrome/Firefox
- **WAVE:** Avaliação de acessibilidade web
- **Colour Contrast Analyser:** Verificação de contraste

### Testes Mobile
- **BrowserStack:** Testes em dispositivos reais
- **Chrome DevTools:** Simulação de dispositivos
- **Firefox Responsive Design Mode:** Testes responsivos

## Relatório de Bugs

Ao encontrar problemas, documente:
1. **Dispositivo/Navegador:** Especificações exatas
2. **Passos para reproduzir:** Sequência detalhada
3. **Comportamento esperado:** O que deveria acontecer
4. **Comportamento atual:** O que está acontecendo
5. **Screenshots/Videos:** Evidências visuais
6. **Console logs:** Erros técnicos

---

**Nota:** Este guia deve ser seguido antes de cada release para garantir a qualidade e acessibilidade da aplicação.