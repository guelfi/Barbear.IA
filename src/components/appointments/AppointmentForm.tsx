import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { mockClients, mockBarbers, mockServices } from '../../lib/mock-data';
import { Appointment, Service } from '../../types';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (appointment: Partial<Appointment>) => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<Partial<Appointment>>({
    clientId: appointment?.clientId || '',
    barberId: appointment?.barberId || '',
    serviceId: appointment?.serviceId || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '',
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
  });

  const [clients] = useState(mockClients);
  const [barbers] = useState(mockBarbers);
  const [services] = useState(mockServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    if (formData.serviceId) {
      const service = services.find(s => s.id === formData.serviceId);
      setSelectedService(service || null);
    }
  }, [formData.serviceId, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedService) {
      const appointmentData = {
        ...formData,
        duration: selectedService.duration,
        price: selectedService.price,
      };
      onSave(appointmentData);
    }
  };

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    { value: 'confirmed', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    { value: 'in-progress', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Concluído', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'no-show', label: 'Não Compareceu', color: 'bg-red-100 text-red-800' },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
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

            <div className="space-y-2">
              <Label htmlFor="barber">Barbeiro</Label>
              <Select
                value={formData.barberId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, barberId: value }))}
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
              <Label htmlFor="service">Serviço</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center space-x-2">
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedService && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Resumo do Serviço</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span>{selectedService.duration} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span>R$ {selectedService.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {appointment ? 'Atualizar' : 'Criar'} Agendamento
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}