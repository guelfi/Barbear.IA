import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

/** Tenant suspenso/cancelado: navega, mas não altera registros. */
export function useTenantWriteAccess() {
  const { user } = useAuth();
  const status = user?.tenantStatus?.toLowerCase();
  const isSuspended = status === 'suspended' || status === 'cancelled';
  const canWrite = !isSuspended;

  const guardWrite = (action?: () => void): boolean => {
    if (!canWrite) {
      toast.error('Barbearia suspensa. Alterações bloqueadas.');
      return false;
    }
    action?.();
    return true;
  };

  return { canWrite, isSuspended, tenantStatus: status, guardWrite };
}
