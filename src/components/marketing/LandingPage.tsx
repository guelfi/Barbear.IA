import { motion } from 'framer-motion';
import '../../styles/marketing.css';

interface LandingPageProps {
  onEnter: () => void;
  onStartTrial: () => void;
}

export function LandingPage({ onEnter, onStartTrial }: LandingPageProps) {
  return (
    <div className="lp-root">
      <section className="lp-hero" aria-label="Barbear.IA">
        <div className="lp-hero__media" aria-hidden="true" />
        <div className="lp-hero__veil" aria-hidden="true" />

        <div className="lp-hero__stage">
          <div className="lp-hero__content">
            <motion.p
              className="lp-brand"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Barbear<span>.IA</span>
            </motion.p>

            <motion.h1
              className="lp-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              A operação da sua barbearia, no padrão de quem cobra por excelência.
            </motion.h1>

            <motion.p
              className="lp-support"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
            >
              Agenda, equipe, clientes e assinatura em uma plataforma multi-tenant
              feita para barbearias que tratam cada atendimento como experiência.
            </motion.p>

            <motion.div
              className="lp-cta-row"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.4 }}
            >
              <button type="button" className="lp-btn lp-btn--primary" onClick={onStartTrial}>
                Começar agora
              </button>
              <button type="button" className="lp-btn lp-btn--ghost" onClick={onEnter}>
                Entrar
              </button>
            </motion.div>
          </div>

          <motion.aside
            className="lp-hero__aside"
            aria-label="Proposta"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="lp-aside__title">
              Menos improvisação.
              <br />
              Mais casa cheia.
            </h2>
            <p className="lp-aside__text">
              Do dono ao barbeiro e ao cliente: cada perfil vê só o que precisa —
              com controle de acesso, isolamento entre unidades e a rotina da
              barbearia no ritmo certo.
            </p>
          </motion.aside>
        </div>
      </section>
    </div>
  );
}
