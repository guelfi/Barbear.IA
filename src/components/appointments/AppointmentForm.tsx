import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Appointment, Service, Client, Barber } from '../../types';
import { clientsAPI, barbersAPI, servicesAPI, appointmentsAPI, barbershopsAPI } from '../../api';
import type { PublicBarbershop } from '../../api/barbershops';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
}

const CLIENT_CHANGE_HOURS = 24;

function canClientChange(startsAtIso?: string, date?: string, time?: string): boolean {
  let starts: number | null = null;
  if (startsAtIso) starts = new Date(startsAtIso).getTime();
  else if (date && time) starts = new Date(`${date}T${time}:00`).getTime();
  if (!starts || Number.isNaN(starts)) return false;
  return starts - Date.now() >= CLIENT_CHANGE_HOURS * 60 * 60 * 1000;
}

export function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isEdit = Boolean(appointment?.id);

  const [formData, setFormData] = useState<Partial<Appointment>>({
    clientId: appointment?.clientId || (isClient ? user?.clientProfileId || '' : ''),
    barberId: appointment?.barberId || '',
    serviceId: appointment?.serviceId || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '',
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
    tenantId: appointment?.tenantId || user?.tenantId || '',
  });

  const [shops, setShops] = useState<PublicBarbershop[]>([]);
  const [shopId, setShopId] = useState(appointment?.tenantId || user?.tenantId || '');
  const [clients, setClients] = useState<Client[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        if (isClient) {
          const discovered = await barbershopsAPI.discover();
          setShops(discovered);
          const initial = shopId || user?.tenantId || discovered[0]?.id || '';
          setShopId(initial);
          if (user?.clientProfileId) {
            setFormData((prev) => ({ ...prev, clientId: user.clientProfileId, tenantId: initial }));
          }
        } else {
          const tenantId = user?.tenantId;
          const [clientsData, barbersData, servicesData] = await Promise.all([
            clientsAPI.getClients(tenantId),
            barbersAPI.getBarbers(tenantId),
            servicesAPI.getServices(tenantId),
          ]);
          setClients(clientsData);
          setBarbers(barbersData);
          setServices(servicesData);
        }
      } catch {
        toast.error('Erro ao carregar dados do formulário');
      } finally {
        setLoading(false);
      }
    };
    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user?.tenantId, user?.clientProfileId]);

  useEffect(() => {
    if (!isClient || !shopId) return;
    const loadShopCatalog = async () => {
      try {
        const detail = await barbershopsAPI.getPublicDetail(shopId);
        setBarbers(
          detail.barbers.map((b) => ({
            id: b.id,
            name: b.name,
            email: '',
            phone: '',
            tenantId: shopId,
            isActive: true,
            specialties: [],
            workingHours: {} as any,
          }))
        );
        setServices(
          detail.services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            duration: s.durationMinutes,
            price: Number(s.price),
            category: s.category || 'geral',
            tenantId: shopId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        );
        setFormData((prev) => ({
          ...prev,
          tenantId: shopId,
          barberId: prev.barberId && detail.barbers.some((b) => b.id === prev.barberId) ? prev.barberId : '',
          serviceId: prev.serviceId && detail.services.some((s) => s.id === prev.serviceId) ? prev.serviceId : '',
        }));
      } catch {
        toast.error('Falha ao carregar barbeiros/serviços da barbearia.');
      }
    };
    void loadShopCatalog();
  }, [isClient, shopId]);

  useEffect(() => {
    if (formData.serviceId) {
      setSelectedService(services.find((s) => s.id === formData.serviceId) || null);
    } else {
      setSelectedService(null);
    }
  }, [formData.serviceId, services]);

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  ];

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast.error('Selecione um serviço');
      return;
    }
    const clientId = isClient ? user?.clientProfileId || formData.clientId : formData.clientId;
    if (!clientId) {
      toast.error(isClient ? 'Perfil de cliente não encontrado. Faça login novamente.' : 'Selecione um cliente');
      return;
    }
    if (!formData.barberId || !formData.date || !formData.time) {
      toast.error('Preencha barbeiro, data e horário.');
      return;
    }

    if (isClient && shopId && user?.tenantId && shopId !== user.tenantId) {
      toast.error('Você só pode agendar na barbearia em que está cadastrado.');
      return;
    }

    if (isClient && isEdit && !canClientChange(undefined, appointment?.date, appointment?.time)) {
      toast.error(`Alterações só são permitidas até ${CLIENT_CHANGE_HOURS}h antes do horário.`);
      return;
    }

    try {
      setSaving(true);
      const appointmentData = {
        ...formData,
        clientId,
        status: isClient ? 'scheduled' : formData.status,
        duration: selectedService.duration,
        price: selectedService.price,
        tenantId: isClient ? shopId || user?.tenantId || '' : user?.tenantId || '',
      };

      if (appointment?.id) {
        if (isClient && formData.status === 'cancelled') {
          await appointmentsAPI.cancelAppointment(appointment.id, formData.notes);
        } else if (
          formData.date !== appointment.date ||
          formData.time !== appointment.time
        ) {
          await appointmentsAPI.rescheduleAppointment(appointment.id, formData.date!, formData.time!);
        } else {
          await appointmentsAPI.updateAppointment(appointment.id, appointmentData);
        }
        toast.success('Agendamento atualizado!');
      } else {
        await appointmentsAPI.createAppointment(appointmentData as any);
        toast.success('Agendamento criado!');
      }
      onSave(appointmentData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar agendamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment?.id) return;
    if (isClient && !canClientChange(undefined, appointment.date, appointment.time)) {
      toast.error(`Cancelamento só é permitido até ${CLIENT_CHANGE_HOURS}h antes do horário.`);
      return;
    }
    try {
      setSaving(true);
      await appointmentsAPI.cancelAppointment(appointment.id, 'Cancelado pelo cliente');
      toast.success('Agendamento cancelado.');
      onSave({ ...appointment, status: 'cancelled' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao cancelar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <p>Carregando formulário...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{appointment ? 'Editar Agendamento' : 'Novo Agendamento'}</CardTitle>
        {isClient && (
          <p className="text-xs text-muted-foreground">
            Cancelamentos e alterações só até {CLIENT_CHANGE_HOURS}h antes do horário.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {isClient && (
              <div className="space-y-2 md:col-span-2">
                <Label>Barbearia</Label>
                <Select
                  value={shopId}
                  onValueChange={setShopId}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a barbearia" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isClient && (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Barbeiro</Label>
              <Select
                value={formData.barberId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, barberId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {(service.price || 0).toFixed(2)} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isClient && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <Badge className={status.color}>{status.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Voltar
            </Button>
            {isClient && isEdit && appointment?.status !== 'cancelled' && (
              <Button
                type="button"
                variant="destructive"
                disabled={saving}
                onClick={() => void handleCancelAppointment()}
              >
                Cancelar agendamento
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Agendar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
