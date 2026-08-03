/**
 * Mock do Plano de Fidelidade (até existir o sistema real).
 * Shape reutilizável por Cliente / Admin / Barbeiro / SA nas próximas telas.
 * Futuro: tipos de serviço + quantidades de créditos por plano, gestão multi-perfil.
 */
export type LoyaltyServiceCredit = {
  serviceKey: string;
  serviceName: string;
  includedTotal: number;
  remaining: number;
};

export type LoyaltyPlanMock = {
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'expired';
  validUntil: string;
  shopName: string;
  credits: LoyaltyServiceCredit[];
};

/** Demo por e-mail de seed; fallback genérico para outros clientes. */
const BY_EMAIL: Record<string, LoyaltyPlanMock> = {
  'cliente.beta@barbear.ia': {
    planId: 'loyalty-beta-basic',
    planName: 'Fidelidade Beta — Corte & Barba',
    status: 'active',
    validUntil: '2026-12-31',
    shopName: 'Barbearia Beta Demo',
    credits: [
      { serviceKey: 'corte', serviceName: 'Corte masculino', includedTotal: 4, remaining: 2 },
      { serviceKey: 'barba', serviceName: 'Barba completa', includedTotal: 2, remaining: 1 },
      { serviceKey: 'combo', serviceName: 'Corte + Barba', includedTotal: 1, remaining: 0 },
    ],
  },
  'cliente.alpha@barbear.ia': {
    planId: 'loyalty-alpha-plus',
    planName: 'Fidelidade Alpha Plus',
    status: 'active',
    validUntil: '2026-11-30',
    shopName: 'Barbearia Alpha Demo',
    credits: [
      { serviceKey: 'corte', serviceName: 'Corte masculino', includedTotal: 6, remaining: 4 },
      { serviceKey: 'barba', serviceName: 'Barba completa', includedTotal: 3, remaining: 3 },
    ],
  },
};

const FALLBACK: LoyaltyPlanMock = {
  planId: 'loyalty-demo',
  planName: 'Plano Fidelidade Demo',
  status: 'active',
  validUntil: '2026-12-31',
  shopName: 'Sua barbearia',
  credits: [
    { serviceKey: 'corte', serviceName: 'Corte', includedTotal: 4, remaining: 2 },
    { serviceKey: 'barba', serviceName: 'Barba', includedTotal: 2, remaining: 2 },
  ],
};

export function getLoyaltyPlanMock(email?: string | null): LoyaltyPlanMock {
  if (!email) return FALLBACK;
  return BY_EMAIL[email.toLowerCase()] ?? {
    ...FALLBACK,
    planName: `Plano Fidelidade (${email.split('@')[0]})`,
  };
}
