import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, CreditCard, AlertTriangle, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TrialInfo {
  isTrialActive: boolean;
  trialEndsAt: string;
  daysRemaining: number;
  status: 'active' | 'expired' | 'approved';
  plan: 'trial' | 'basic' | 'premium';
}

// Mock trial data - replace with real API call
const mockTrialInfo: TrialInfo = {
  isTrialActive: true,
  trialEndsAt: '2024-03-15T23:59:59Z',
  daysRemaining: 5,
  status: 'active',
  plan: 'trial'
};

export function TrialBanner() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>(mockTrialInfo);

  // Don't show banner for super_admin or clients
  if (!user || user.role === 'super_admin' || user.role === 'client') {
    return null;
  }

  // Don't show banner if user is already on a paid plan
  if (trialInfo.plan !== 'trial') {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
            <Button size="sm" className="h-6 text-[10px] px-2 py-0 flex-shrink-0">
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