import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

import { Badge } from '../ui/badge';
import { 
  Plus, 
  X, 
  Clock,
  User,
  Scissors
} from 'lucide-react';
import { Barber, WorkingHours } from '../../types';
import { toast } from 'sonner';

interface BarberFormProps {
  barber?: Barber;
  onSave: (barber: Partial<Barber>) => void;
  onCancel: () => void;
}

const defaultWorkingHours: WorkingHours = {
  monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
  tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
  wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
  thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
  friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
  saturday: { isWorking: true, startTime: '08:00', endTime: '16:00' },
  sunday: { isWorking: false, startTime: '', endTime: '' }
};

const dayLabels = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

export function BarberForm({ barber, onSave, onCancel }: BarberFormProps) {
  const [formData, setFormData] = useState({
    name: barber?.name || '',
    email: barber?.email || '',
    phone: barber?.phone || '',
    specialties: barber?.specialties || [],
    workingHours: barber?.workingHours || defaultWorkingHours,
    isActive: barber?.isActive ?? true
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.specialties.length === 0) {
      toast.error('Adicione pelo menos uma especialidade');
      return;
    }

    onSave(formData);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((s: string) => s !== specialty)
    }));
  };

  const updateWorkingHours = (day: keyof WorkingHours, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="h-5 w-5" />
          <span>{barber ? 'Editar Barbeiro' : 'Novo Barbeiro'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Informações Pessoais</span>
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do barbeiro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Barbeiro ativo</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Especialidades</h3>
            
            <div className="flex space-x-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Digite uma especialidade"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              />
              <Button type="button" onClick={addSpecialty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{specialty}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Horários de Trabalho */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Horários de Trabalho</span>
            </h3>
            
            <div className="space-y-3">
              {Object.entries(dayLabels).map(([day, label]) => (
                <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-32">
                    <input
                      type="checkbox"
                      id={`${day}-working`}
                      checked={formData.workingHours[day as keyof WorkingHours].isWorking}
                      onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'isWorking', e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor={`${day}-working`}>{label}</Label>
                  </div>
                  
                  {formData.workingHours[day as keyof WorkingHours].isWorking && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={formData.workingHours[day as keyof WorkingHours].startTime}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span>às</span>
                      <Input
                        type="time"
                        value={formData.workingHours[day as keyof WorkingHours].endTime}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {barber ? 'Atualizar' : 'Cadastrar'} Barbeiro
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