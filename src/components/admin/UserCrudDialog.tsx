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
import { User } from '../../types';
import { usersAPI } from '../../api';
import { toast } from 'sonner';

interface UserCrudDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: User) => void;
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  barber: 'Barbeiro',
  client: 'Cliente',
};

export function UserCrudDialog({ user, open, onOpenChange, onSaved }: UserCrudDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await usersAPI.updateUser(user.id, {
        name,
        phone,
        isActive: user.isActive,
      });
      onSaved({ ...user, name, phone });
      toast.success('Usuário atualizado.');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usuário</DialogTitle>
          <DialogDescription>
            Visualize e edite os dados do usuário selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{roleLabels[user.role] ?? user.role}</Badge>
            <Badge variant={user.isActive ? 'default' : 'destructive'}>
              {user.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Nome</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-phone">Telefone</Label>
            <Input id="user-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {user.tenantId && (
            <p className="text-xs text-muted-foreground break-all">Tenant: {user.tenantId}</p>
          )}
          <p className="text-xs text-muted-foreground break-all">ID: {user.id}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
