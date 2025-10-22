// Stripe integration configuration for SaaS billing
// This file contains the structure for future Stripe integration

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  redirectUrl: string;
}

export interface StripePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

// Mock Stripe configuration - replace with real values
export const stripeConfig: StripeConfig = {
  publicKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
  secretKey: 'sk_test_YOUR_SECRET_KEY_HERE', // Never expose this in frontend
  webhookSecret: 'whsec_YOUR_WEBHOOK_SECRET_HERE',
  redirectUrl: window.location.origin + '/billing/success'
};

// Subscription plans configuration
export const subscriptionPlans: StripePlan[] = [
  {
    id: 'pro-monthly',
    name: 'Barbear.IA Pro',
    description: 'Plataforma completa para gestão de barbearias - Mensal',
    price: 39.90,
    currency: 'BRL',
    interval: 'month',
    features: [
      'Barbeiros ilimitados',
      'Agendamentos ilimitados',
      'Suporte prioritário',
      'Relatórios completos',
      'Notificações por WhatsApp',
      'App móvel',
      'Sistema de fidelidade',
      'Multi-unidades',
      'Dashboard avançado',
      'Backup automático'
    ],
    stripePriceId: 'price_pro_monthly',
    popular: false
  },
  {
    id: 'pro-yearly',
    name: 'Barbear.IA Pro',
    description: 'Plataforma completa para gestão de barbearias - Anual',
    price: 359.00,
    currency: 'BRL',
    interval: 'year',
    features: [
      'Barbeiros ilimitados',
      'Agendamentos ilimitados',
      'Suporte prioritário',
      'Relatórios completos',
      'Notificações por WhatsApp',
      'App móvel',
      'Sistema de fidelidade',
      'Multi-unidades',
      'Dashboard avançado',
      'Backup automático',
      '🎉 Economia de 25% no plano anual'
    ],
    stripePriceId: 'price_pro_yearly',
    popular: true
  }
];

// Stripe API wrapper functions (mock implementations)
export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Create a new customer
  async createCustomer(data: {
    email: string;
    name: string;
    tenantId: string;
  }): Promise<{ customerId: string }> {
    // Mock implementation - replace with actual Stripe API call
    console.log('Creating Stripe customer:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      customerId: `cus_mock_${Date.now()}`
    };
  }

  // Create a checkout session
  async createCheckoutSession(data: {
    customerId: string;
    priceId: string;
    tenantId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionUrl: string }> {
    // Mock implementation - replace with actual Stripe API call
    console.log('Creating checkout session:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sessionUrl: `https://checkout.stripe.com/mock-session-${Date.now()}`
    };
  }

  // Create a billing portal session
  async createBillingPortalSession(data: {
    customerId: string;
    returnUrl: string;
  }): Promise<{ portalUrl: string }> {
    // Mock implementation - replace with actual Stripe API call
    console.log('Creating billing portal session:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      portalUrl: `https://billing.stripe.com/mock-portal-${Date.now()}`
    };
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    plan: StripePlan;
  }> {
    // Mock implementation - replace with actual Stripe API call
    console.log('Getting subscription:', subscriptionId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: subscriptionId,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      plan: subscriptionPlans[0] // Pro plan (único plano disponível)
    };
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Mock implementation - replace with actual Stripe API call
    console.log('Canceling subscription:', subscriptionId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Handle webhook events
  async handleWebhook(payload: string, signature: string): Promise<void> {
    // Mock implementation - replace with actual Stripe webhook handling
    console.log('Handling webhook:', { payload: payload.substring(0, 100), signature });
    
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Parse the event
    // 3. Handle different event types (payment_intent.succeeded, invoice.payment_failed, etc.)
    // 4. Update database accordingly
  }
}

// Helper functions
export const formatPrice = (price: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(price);
};

export const getPlanByPriceId = (priceId: string): StripePlan | undefined => {
  return subscriptionPlans.find(plan => plan.stripePriceId === priceId);
};

export const isTrialExpired = (trialEndsAt: string): boolean => {
  return new Date() > new Date(trialEndsAt);
};

// Export singleton instance
export const stripeService = StripeService.getInstance();