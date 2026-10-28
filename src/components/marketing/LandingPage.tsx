import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  Check,
  ChevronDown,
  Crown,
  MessageCircle,
  QrCode,
  Scissors,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from 'lucide-react';
import '../../styles/marketing.css';

interface LandingPageProps {
  onEnter: () => void;
  onStartTrial: () => void;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const MONTHLY_PRICE = 99;
const YEARLY_PRICE = 900;
const YEARLY_SAVING = MONTHLY_PRICE * 12 - YEARLY_PRICE;

const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span className={className}>
      Barbear<span>.ME</span>
    </span>
  );
}

const HERO_WORDS = ['Agenda', 'cheia.', 'Cadeira', 'ocupada.', 'Cliente', 'organizado.'];

function PhoneMockup() {
  const reduce = useReducedMotion();
  const rows = [
    { time: '09:00', name: 'Corte + barba', who: 'Cliente · Barbeiro 1', status: 'Concluído', tone: 'done' },
    { time: '10:30', name: 'Corte degradê', who: 'Cliente · Barbeiro 2', status: 'Confirmado', tone: 'ok' },
    { time: '14:00', name: 'Barba completa', who: 'Cliente · Barbeiro 1', status: 'Agendado', tone: 'wait' },
    { time: '15:30', name: 'Corte social', who: 'Cliente · Barbeiro 3', status: 'Agendado', tone: 'wait' },
  ];

  return (
    <div className="lp-phone-wrap">
      <motion.div
        className="lp-phone"
        initial={reduce ? false : { opacity: 0, y: 40, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
      >
        <div className="lp-phone__notch" />
        <div className="lp-phone__head">
          <span>Hoje</span>
          <strong>Agenda da barbearia</strong>
        </div>
        <ul className="lp-phone__list">
          {rows.map((r, i) => (
            <motion.li
              key={r.time}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + i * 0.18, duration: 0.5, ease: EASE }}
            >
              <time>{r.time}</time>
              <div>
                <b>{r.name}</b>
                <small>{r.who}</small>
              </div>
              <span className={`lp-pill lp-pill--${r.tone}`}>{r.status}</span>
            </motion.li>
          ))}
        </ul>
        <div className="lp-phone__foot">
          <span>Faturamento do dia</span>
          <strong>Exemplo ilustrativo</strong>
        </div>
      </motion.div>

      <motion.div
        className="lp-float lp-float--a"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
        transition={reduce ? undefined : { opacity: { delay: 1.6 }, scale: { delay: 1.6 }, y: { delay: 2, duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <CalendarCheck size={16} /> Novo agendamento
      </motion.div>
      <motion.div
        className="lp-float lp-float--b"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, 8, 0] }}
        transition={reduce ? undefined : { opacity: { delay: 2.1 }, scale: { delay: 2.1 }, y: { delay: 2.5, duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <Wallet size={16} /> Pagamento via PIX
      </motion.div>
    </div>
  );
}

const PAIN_CARDS = [
  {
    before: 'Agenda no caderno e no WhatsApp, tudo misturado.',
    after: 'Uma agenda única por barbeiro, com os horários organizados e sem conflito.',
    icon: CalendarCheck,
  },
  {
    before: 'Não sei quanto a barbearia faturou no mês.',
    after: 'Painel com agendamentos, serviços e resultados da semana na palma da mão.',
    icon: BarChart3,
  },
  {
    before: 'Cliente marca, esquece e a cadeira fica vazia.',
    after: 'Confirmação e lembretes pelo WhatsApp para reduzir as faltas (em breve).',
    icon: MessageCircle,
  },
];

const FEATURES = [
  { icon: CalendarCheck, title: 'Agenda por barbeiro', text: 'Calendário diário, semanal e mensal com status de cada atendimento.' },
  { icon: Users, title: 'Clientes e histórico', text: 'Cadastro, observações e todo o histórico de atendimentos de cada cliente.' },
  { icon: Scissors, title: 'Serviços e preços', text: 'Catálogo com duração e valor de cada serviço, do corte à barba.' },
  { icon: ShieldCheck, title: 'Equipe com permissões', text: 'Dono, barbeiro e cliente enxergam só o que precisam.' },
  { icon: BarChart3, title: 'Painel de resultados', text: 'Números da operação em tempo real, sem planilha.' },
  { icon: Smartphone, title: 'Funciona no celular', text: 'Instale como app (PWA) e acesse de qualquer lugar.' },
  { icon: MessageCircle, title: 'Lembretes no WhatsApp', text: 'Confirmação automática para reduzir faltas.', soon: true },
  { icon: QrCode, title: 'Link e QR Code próprios', text: 'Seu cliente agenda sozinho, a qualquer hora.', soon: true },
  { icon: Crown, title: 'Fidelidade e pacotes', text: 'Planos mensais de serviços para fidelizar quem volta sempre.', soon: true },
];

const ROLES = [
  {
    id: 'dono',
    label: 'Dono',
    title: 'Controle total, sem estar no balcão',
    bullets: ['Veja a agenda de toda a equipe', 'Cadastre serviços, preços e barbeiros', 'Acompanhe os resultados no painel'],
  },
  {
    id: 'barbeiro',
    label: 'Barbeiro',
    title: 'Sua agenda do dia, sem confusão',
    bullets: ['Veja só os seus atendimentos', 'Saiba quem é o próximo cliente', 'Sem acesso ao que não é seu'],
  },
  {
    id: 'cliente',
    label: 'Cliente',
    title: 'Agendar é simples e rápido',
    bullets: ['Escolha barbearia, serviço e horário', 'Remarque ou cancele com antecedência', 'Acompanhe seu histórico'],
  },
];

const STEPS = [
  { n: '1', title: 'Crie sua barbearia', text: 'Cadastro rápido e 7 dias de teste, sem cartão.' },
  { n: '2', title: 'Monte sua equipe e serviços', text: 'Barbeiros, horários, serviços e preços.' },
  { n: '3', title: 'Comece a agendar', text: 'Sua agenda organizada desde o primeiro dia.' },
];

const FAQ = [
  { q: 'Preciso de cartão de crédito para testar?', a: 'Não. O teste de 7 dias é gratuito e não pede cartão. Depois dele, o pagamento é feito via PIX.' },
  { q: 'Como funciona o pagamento?', a: 'Pagamento via PIX. No plano mensal são R$ 99,00 por mês; no plano anual, um pagamento único de R$ 900,00.' },
  { q: 'Funciona para barbearia com um só barbeiro?', a: 'Sim. Você começa sozinho e adiciona barbeiros e serviços quando precisar.' },
  { q: 'Meus clientes precisam instalar algum aplicativo?', a: 'Não. O sistema funciona direto no navegador e pode ser instalado como app, se a pessoa quiser.' },
  { q: 'Os lembretes por WhatsApp já funcionam?', a: 'Estão em desenvolvimento e aparecem como "em breve". Quando forem liberados, entram no seu plano sem custo extra.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Você não fica preso a contrato no plano mensal.' },
];

// Depoimentos de layout: ainda não existem clientes. Textos genéricos e claramente rotulados como ilustrativos.
const TESTIMONIALS = [
  { quote: 'Espaço reservado para o depoimento de um dono de barbearia.', who: 'Nome do cliente', where: 'Barbearia Exemplo' },
  { quote: 'Espaço reservado para o depoimento de um barbeiro da equipe.', who: 'Nome do cliente', where: 'Barbearia Exemplo' },
  { quote: 'Espaço reservado para o depoimento de um cliente final.', who: 'Nome do cliente', where: 'Barbearia Exemplo' },
];

function Calculator({ onStartTrial }: { onStartTrial: () => void }) {
  const [missed, setMissed] = useState(20);
  const [ticket, setTicket] = useState(50);
  const loss = missed * ticket;
  const months = (loss / MONTHLY_PRICE).toFixed(1).replace('.', ',');

  return (
    <div className="lp-calc">
      <div className="lp-calc__inputs">
        <label>
          <span>Clientes que faltam por mês: <b>{missed}</b></span>
          <input type="range" min={1} max={100} value={missed} onChange={(e) => setMissed(+e.target.value)} />
        </label>
        <label>
          <span>Valor médio do atendimento: <b>{brl(ticket)}</b></span>
          <input type="range" min={20} max={200} step={5} value={ticket} onChange={(e) => setTicket(+e.target.value)} />
        </label>
      </div>
      <div className="lp-calc__result">
        <small>Estimativa do que as faltas custam por mês</small>
        <motion.strong key={loss} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          {brl(loss)}
        </motion.strong>
        <p>Isso equivale a <b>{months}</b> mensalidades do Barbear.ME. Simulação ilustrativa, sem garantia de resultado.</p>
        <button type="button" className="lp-btn lp-btn--primary lp-btn--shine" onClick={onStartTrial}>
          Testar 7 dias grátis
        </button>
      </div>
    </div>
  );
}

export function LandingPage({ onEnter, onStartTrial }: LandingPageProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: rootRef });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState(ROLES[0].id);
  const [yearly, setYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const activeRole = ROLES.find((r) => r.id === role) ?? ROLES[0];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="lp-root" ref={rootRef}>
      <motion.div className="lp-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <header className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <BrandMark className="lp-nav__brand" />
        <nav className="lp-nav__links" aria-label="Seções">
          <button type="button" onClick={() => scrollTo('recursos')}>Recursos</button>
          <button type="button" onClick={() => scrollTo('precos')}>Preços</button>
          <button type="button" onClick={() => scrollTo('faq')}>Dúvidas</button>
        </nav>
        <div className="lp-nav__cta">
          <button type="button" className="lp-btn lp-btn--ghost lp-btn--sm" onClick={onEnter}>Entrar</button>
          <button type="button" className="lp-btn lp-btn--primary lp-btn--sm" onClick={onStartTrial}>Testar grátis</button>
        </div>
      </header>

      <section className="lp-hero" aria-label="Barbear.ME">
        <div className="lp-hero__media" aria-hidden="true" />
        <div className="lp-hero__veil" aria-hidden="true" />
        <div className="lp-hero__stage">
          <div className="lp-hero__content">
            <motion.p
              className="lp-eyebrow"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Gestão completa para barbearias
            </motion.p>
            <h1 className="lp-h1" aria-label="Agenda cheia. Cadeira ocupada. Cliente organizado.">
              {HERO_WORDS.map((w, i) => (
                <Fragment key={w}>
                  <motion.span
                    className={i % 2 === 1 ? 'lp-h1__accent' : undefined}
                    aria-hidden="true"
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 + i * 0.09, ease: EASE }}
                  >
                    {w}
                  </motion.span>{' '}
                </Fragment>
              ))}
            </h1>
            <motion.p
              className="lp-sub"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              Agenda, equipe, clientes e resultados da sua barbearia em um só lugar. Menos caderno, menos bagunça e mais tempo para cuidar do que importa: o corte.
            </motion.p>
            <motion.div
              className="lp-cta-row"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
            >
              <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-btn--shine" onClick={onStartTrial}>
                Testar 7 dias grátis
              </button>
              <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => scrollTo('como-funciona')}>
                Ver como funciona
              </button>
            </motion.div>
            <p className="lp-micro">
              <Check size={14} /> Sem cartão de crédito <Check size={14} /> Pague via PIX <Check size={14} /> Cancele quando quiser
            </p>
          </div>
          <PhoneMockup />
        </div>
        <button type="button" className="lp-scroll" onClick={() => scrollTo('numeros')} aria-label="Rolar para baixo">
          <ChevronDown size={20} />
        </button>
      </section>

      <section id="numeros" className="lp-strip" aria-label="Destaques">
        <Reveal className="lp-strip__item">
          <strong><Counter to={7} /></strong>
          <span>dias de teste grátis</span>
        </Reveal>
        <Reveal className="lp-strip__item" delay={0.1}>
          <strong><Counter to={3} /></strong>
          <span>perfis: dono, barbeiro e cliente</span>
        </Reveal>
        <Reveal className="lp-strip__item" delay={0.2}>
          <strong><Counter to={24} suffix="h" /></strong>
          <span>sistema disponível todos os dias</span>
        </Reveal>
        <Reveal className="lp-strip__item" delay={0.3}>
          <strong>PIX</strong>
          <span>pagamento simples, sem cartão</span>
        </Reveal>
      </section>

      <section className="lp-section" aria-labelledby="dor-title">
        <Reveal>
          <p className="lp-kicker">O problema</p>
          <h2 id="dor-title" className="lp-h2">Barbearia cheia de cliente, <em>cabeça cheia de problema</em>.</h2>
        </Reveal>
        <div className="lp-pain">
          {PAIN_CARDS.map((c, i) => (
            <Reveal key={c.before} delay={i * 0.12}>
              <article className="lp-flip" tabIndex={0}>
                <div className="lp-flip__inner">
                  <div className="lp-flip__face lp-flip__face--front">
                    <c.icon size={22} />
                    <small>Hoje</small>
                    <p>{c.before}</p>
                    <span className="lp-flip__hint">Passe o mouse ou toque</span>
                  </div>
                  <div className="lp-flip__face lp-flip__face--back">
                    <Check size={22} />
                    <small>Com o Barbear.ME</small>
                    <p>{c.after}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lp-section lp-section--tint" aria-labelledby="perfis-title">
        <Reveal>
          <p className="lp-kicker">Para toda a barbearia</p>
          <h2 id="perfis-title" className="lp-h2">Cada pessoa vê <em>só o que precisa</em>.</h2>
        </Reveal>
        <div className="lp-tabs" role="tablist" aria-label="Perfis">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === role}
              className={r.id === role ? 'is-active' : ''}
              onClick={() => setRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            className="lp-role"
            role="tabpanel"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h3>{activeRole.title}</h3>
            <ul>
              {activeRole.bullets.map((b) => (
                <li key={b}><Check size={18} /> {b}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </section>

      <section id="whatsapp" className="lp-section lp-wa" aria-labelledby="wa-title">
        <Reveal className="lp-wa__text">
          <p className="lp-kicker">Em breve <span className="lp-soon">novidade</span></p>
          <h2 id="wa-title" className="lp-h2">O WhatsApp trabalhando <em>por você</em>.</h2>
          <p className="lp-lead">
            Estamos finalizando lembretes e confirmações automáticas. O cliente responde com um toque e a agenda se atualiza sozinha.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="lp-chat" aria-label="Exemplo ilustrativo de conversa">
            {[
              { me: false, t: 'Olá! Seu horário é amanhã às 15:30. Confirma?' },
              { me: true, t: 'Confirmo!' },
              { me: false, t: 'Perfeito, horário confirmado.' },
            ].map((m, i) => (
              <motion.div
                key={m.t}
                className={`lp-chat__msg${m.me ? ' is-me' : ''}`}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.7, duration: 0.45, ease: EASE }}
              >
                {m.t}
              </motion.div>
            ))}
            <small>Exemplo ilustrativo</small>
          </div>
        </Reveal>
      </section>

      <section id="recursos" className="lp-section" aria-labelledby="rec-title">
        <Reveal>
          <p className="lp-kicker">Recursos</p>
          <h2 id="rec-title" className="lp-h2">Tudo que a sua barbearia <em>precisa</em>.</h2>
        </Reveal>
        <div className="lp-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.1}>
              <article className="lp-card">
                <f.icon size={26} className="lp-card__icon" />
                <h3>{f.title}{f.soon && <span className="lp-soon">em breve</span>}</h3>
                <p>{f.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="lp-section lp-section--tint" aria-labelledby="como-title">
        <Reveal>
          <p className="lp-kicker">Como funciona</p>
          <h2 id="como-title" className="lp-h2">Pronto para usar em <em>3 passos</em>.</h2>
        </Reveal>
        <div className="lp-steps">
          <motion.span
            className="lp-steps__line"
            aria-hidden="true"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: EASE }}
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={0.15 + i * 0.15}>
              <div className="lp-step">
                <span className="lp-step__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lp-section" aria-labelledby="calc-title">
        <Reveal>
          <p className="lp-kicker">Faça a conta</p>
          <h2 id="calc-title" className="lp-h2">Quanto as faltas <em>custam</em> para você?</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Calculator onStartTrial={onStartTrial} />
        </Reveal>
      </section>

      <section className="lp-section lp-section--tint" aria-labelledby="dep-title">
        <Reveal>
          <p className="lp-kicker">Quem usa</p>
          <h2 id="dep-title" className="lp-h2">O que dizem as <em>barbearias</em>.</h2>
          <p className="lp-lead lp-lead--center">
            Ainda estamos começando. Os blocos abaixo são apenas um modelo de como os depoimentos serão exibidos.
          </p>
        </Reveal>
        <div className="lp-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <figure className="lp-quote">
                <span className="lp-soon lp-soon--muted">modelo ilustrativo</span>
                <blockquote>{t.quote}</blockquote>
                <figcaption><b>{t.who}</b><small>{t.where}</small></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="precos" className="lp-section" aria-labelledby="preco-title">
        <Reveal>
          <p className="lp-kicker">Preços</p>
          <h2 id="preco-title" className="lp-h2">Um plano. <em>Tudo incluído.</em></h2>
        </Reveal>
        <div className="lp-toggle" role="group" aria-label="Periodicidade">
          <button type="button" className={!yearly ? 'is-active' : ''} onClick={() => setYearly(false)}>Mensal</button>
          <button type="button" className={yearly ? 'is-active' : ''} onClick={() => setYearly(true)}>
            Anual <span>economize {brl(YEARLY_SAVING)}</span>
          </button>
        </div>
        <Reveal delay={0.1}>
          <div className="lp-price">
            <span className="lp-price__badge">7 dias grátis para testar</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={yearly ? 'y' : 'm'}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <strong className="lp-price__value">
                  {brl(yearly ? YEARLY_PRICE : MONTHLY_PRICE)}
                  <small>{yearly ? ' pagamento único' : ' / mês'}</small>
                </strong>
                <p className="lp-price__note">
                  {yearly
                    ? `Equivale a ${brl(YEARLY_PRICE / 12)} por mês, 12 meses de uso.`
                    : 'Renovação mensal, sem fidelidade.'}
                </p>
              </motion.div>
            </AnimatePresence>
            <ul>
              {[
                'Equipe de barbeiros e agenda completa',
                'Agenda, clientes, serviços e equipe',
                'Painel de resultados',
                'Acesso pelo celular (PWA)',
                'Novidades incluídas: WhatsApp, link próprio e fidelidade',
              ].map((i) => (
                <li key={i}><Check size={18} /> {i}</li>
              ))}
            </ul>
            <p className="lp-price__pix"><Wallet size={16} /> Pagamento via PIX</p>
            <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-btn--shine" onClick={onStartTrial}>
              Começar teste grátis
            </button>
          </div>
        </Reveal>
      </section>

      <section id="faq" className="lp-section lp-section--tint" aria-labelledby="faq-title">
        <Reveal>
          <p className="lp-kicker">Dúvidas</p>
          <h2 id="faq-title" className="lp-h2">Perguntas <em>frequentes</em>.</h2>
        </Reveal>
        <div className="lp-faq">
          {FAQ.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className={`lp-faq__item${open ? ' is-open' : ''}`}>
                <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : i)}>
                  {f.q}
                  <ChevronDown size={18} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.p
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      {f.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lp-final" aria-labelledby="final-title">
        <Reveal>
          <h2 id="final-title" className="lp-h2">Sua agenda não precisa depender de <em>memória</em>.</h2>
          <p className="lp-lead lp-lead--center">Teste 7 dias grátis, sem cartão, e veja a sua barbearia mais organizada.</p>
          <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-btn--shine lp-btn--pulse" onClick={onStartTrial}>
            Testar 7 dias grátis
          </button>
        </Reveal>
      </section>

      <footer className="lp-footer">
        <BrandMark className="lp-nav__brand" />
        <p>© {new Date().getFullYear()} Barbear.ME. Gestão para barbearias.</p>
        <button type="button" onClick={onEnter}>Entrar</button>
      </footer>

      <div className="lp-sticky-cta">
        <button type="button" className="lp-btn lp-btn--primary" onClick={onStartTrial}>
          Testar 7 dias grátis
        </button>
      </div>
    </div>
  );
}
