import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tenant } from '../../types';
import { barbershopsAPI } from '../../api';
import { toast } from 'sonner';

interface TenantCrudDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (tenant: Tenant) => void;
}

export function TenantCrudDialog({ tenant, open, onOpenChange, onSaved }: TenantCrudDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    setName(tenant.businessName || tenant.name || '');
    setEmail(tenant.email || '');
    setPhone(tenant.phone || '');
  }, [tenant]);

  if (!tenant) return null;

  const statusLabel =
    tenant.status === 'approved' ? 'Ativo'
      : tenant.status === 'suspended' ? 'Suspenso'
        : tenant.status === 'pending' ? 'Pendente'
          : 'Cancelado';

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await barbershopsAPI.updateBarbershop(tenant.id, {
        name,
        email,
        phone,
      });
      onSaved({
        ...tenant,
        ...updated,
        businessName: updated.businessName ?? updated.name ?? name,
        name: updated.name ?? name,
        email: updated.email ?? email,
        phone: updated.phone ?? phone,
        status: (updated.status ?? tenant.status) as Tenant['status'],
      });
      toast.success('Barbearia atualizada.');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar barbearia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Barbearia</DialogTitle>
          <DialogDescription>
            Visualize e edite os dados da barbearia selecionada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={tenant.status === 'approved' ? 'default' : tenant.status === 'suspended' ? 'destructive' : 'secondary'}>
              {statusLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant-name">Nome</Label>
            <Input id="tenant-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-email">E-mail</Label>
            <Input id="tenant-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-phone">Telefone</Label>
            <Input id="tenant-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <p className="text-xs text-muted-foreground break-all">ID: {tenant.id}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !email.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
