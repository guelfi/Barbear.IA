import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert } from '../ui/alert';
import { Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { billingAPI } from '../../api';

interface TrialInfo {
  isTrialActive: boolean;
  trialEndsAt: string;
  daysRemaining: number;
  status: 'active' | 'expired' | 'approved';
  plan: 'pro-monthly' | 'pro-yearly';
}

export function TrialBanner() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);

  useEffect(() => {
    if (!user || user.role === 'super_admin' || user.role === 'client') return;
    billingAPI.getSubscription()
      .then((subscription) => {
        const trialEndsAt = subscription.trialEndsAt;
        const daysRemaining = trialEndsAt
          ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
          : 0;
        setTrialInfo({
          isTrialActive: subscription.status === 'trial' && daysRemaining > 0,
          trialEndsAt: trialEndsAt ?? '',
          daysRemaining,
          status: subscription.status === 'trial' ? 'active' : subscription.status === 'active' ? 'approved' : 'expired',
          plan: subscription.plan === 'pro-yearly' ? 'pro-yearly' : 'pro-monthly',
        });
      })
      .catch(() => setTrialInfo(null));
  }, [user]);

  // Don't show banner for super_admin or clients
  if (!user || user.role === 'super_admin' || user.role === 'client' || !trialInfo || !trialInfo.isTrialActive) {
    return null;
  }

  // Don't show banner if user is already on a paid plan
  if ((trialInfo.plan === 'pro-monthly' || trialInfo.plan === 'pro-yearly') && trialInfo.status === 'approved') {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert className="border-l-4 border-l-primary bg-muted/30 py-3 px-4 max-w-full">
        <div className="space-y-1">
          {/* Primeira linha: ícone + texto + chip */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium whitespace-nowrap">
              Faça upgrade para continuar aproveitando todos os recursos.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="text-xs font-medium whitespace-nowrap">
              {trialInfo.daysRemaining} dias restantes no período de teste
            </span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
              Período de Teste
            </Badge>
          </div>          
          {/* Segunda linha: descrição */}
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="h-6 text-[10px] px-2 py-0 flex-shrink-0"
              onClick={async () => {
                try {
                  const result = await billingAPI.checkout(trialInfo.plan);
                  toast.success(result.message || 'Assinatura atualizada no sandbox.');
                  if (result.checkoutUrl && result.checkoutUrl.startsWith('http')) {
                    window.location.href = result.checkoutUrl;
                  } else {
                    setTrialInfo((prev) => prev ? { ...prev, isTrialActive: false, status: 'approved' } : prev);
                  }
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Falha no checkout.');
                }
              }}
            >
              <CreditCard className="h-2.5 w-2.5 mr-1" />
              Escolher Plano
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 py-0 flex-shrink-0">
              Falar com Suporte
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
