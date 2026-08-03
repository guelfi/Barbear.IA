import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Edit, Save, X, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { toast } from 'sonner';

export function ClientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user?.name, user?.email, user?.phone]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }
    try {
      setSaving(true);
      const updated = await authAPI.updateMyProfile({
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.trim(),
      });
      // Atualiza estado local da sessão (nome/telefone/email)
      try {
        const raw = localStorage.getItem('userEmail');
        if (raw !== updated.email) localStorage.setItem('userEmail', updated.email);
      } catch { /* ignore */ }
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">Meu Perfil</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{(user?.name || '?').charAt(0)}</AvatarFallback>
            </Avatar>
            Dados pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Nome</Label>
            {isEditing ? (
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            ) : (
              <p className="text-sm">{user?.name || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> E-mail</Label>
            {isEditing ? (
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            ) : (
              <p className="text-sm">{user?.email || '—'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Telefone</Label>
            {isEditing ? (
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+5511999999999" />
            ) : (
              <p className="text-sm">{user?.phone || '—'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
