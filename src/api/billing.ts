import { get, post } from './http';

export interface Subscription {
  plan: string;
  status: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeEnabled?: boolean;
}

export const billingAPI = {
  getSubscription: () => get<Subscription>('/billing/subscription'),
  checkout: (plan = 'pro-monthly') => post<{ checkoutUrl?: string; message?: string }>('/billing/checkout', { plan }),
};
export default billingAPI;
