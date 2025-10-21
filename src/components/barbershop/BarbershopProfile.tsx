import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Clock,
  Users,
  Star,
  Globe,
  Instagram,
  Facebook,
  Award,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { WorkingHours } from '../../types';

interface BarbershopProfileData {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  foundedDate: string;
  description: string;
  services: string[];
  workingHours: WorkingHours;
  logo?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  specialties: string[];
  totalBarbers: number;
  totalClients: number;
  monthlyRevenue: number;
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

export function BarbershopProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<BarbershopProfileData>({
    name: 'Barbearia Central',
    ownerName: user?.name || '',
    email: user?.email || '',
    phone: '(11) 3456-7890',
    address: 'Rua das Tesouras, 123 - Centro, São Paulo - SP, 01234-567',
    foundedDate: '2015-06-15',
    description: 'Barbearia tradicional com mais de 8 anos de experiência. Oferecemos serviços de qualidade em um ambiente acolhedor e profissional.',
    services: ['Corte Masculino', 'Barba', 'Bigode', 'Sobrancelha', 'Tratamentos'],
    workingHours: defaultWorkingHours,
    logo: undefined,
    website: 'www.barbeariacentral.com.br',
    instagram: '@barbeariacentral',
    facebook: 'Barbearia Central',
    specialties: ['Cortes Clássicos', 'Barbas Tradicionais', 'Atendimento Premium'],
    totalBarbers: 4,
    totalClients: 234,
    monthlyRevenue: 15420.50
  });

  const [editData, setEditData] = useState<BarbershopProfileData>(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    toast.success('Perfil da barbearia atualizado com sucesso!');
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
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
    setEditData(prev => ({ ...prev, phone: formatted }));
  };

  const updateWorkingHours = (day: keyof WorkingHours, field: string, value: string | boolean) => {
    setEditData(prev => ({
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

  const calculateYearsInBusiness = (foundedDate: string) => {
    const today = new Date();
    const founded = new Date(foundedDate);
    const years = today.getFullYear() - founded.getFullYear();
    return years;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Perfil da Barbearia</h2>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Barbeiros</p>
                <p className="text-xl font-bold">{profileData.totalBarbers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-xl font-bold">{profileData.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                <p className="text-xl font-bold">R$ {profileData.monthlyRevenue.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Anos no Mercado</p>
                <p className="text-xl font-bold">{calculateYearsInBusiness(profileData.foundedDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logo e Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Logo da Barbearia</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profileData.logo} />
                <AvatarFallback className="text-2xl">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{profileData.name}</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Building2 className="mr-1 h-3 w-3" />
                Barbearia Profissional
              </Badge>
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-xs text-muted-foreground">(89 avaliações)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Barbearia */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Barbearia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Barbearia</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nome do Proprietário</Label>
                  <Input
                    id="ownerName"
                    value={editData.ownerName}
                    onChange={(e) => setEditData(prev => ({ ...prev, ownerName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedDate">Data de Fundação</Label>
                  <Input
                    id="foundedDate"
                    type="date"
                    value={editData.foundedDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, foundedDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editData.website}
                    onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.suabarbearia.com.br"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={editData.instagram}
                    onChange={(e) => setEditData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@suabarbearia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={editData.facebook}
                    onChange={(e) => setEditData(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="Sua Barbearia"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={editData.address}
                    onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição da Barbearia</Label>
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Conte sobre sua barbearia, história, diferenciais..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome da Barbearia</p>
                    <p className="font-medium">{profileData.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Proprietário</p>
                    <p className="font-medium">{profileData.ownerName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{profileData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fundada em</p>
                    <p className="font-medium">
                      {new Date(profileData.foundedDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{profileData.address}</p>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="flex items-center space-x-4 pt-2">
                  {profileData.website && (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.website}</span>
                    </div>
                  )}
                  {profileData.instagram && (
                    <div className="flex items-center space-x-1">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.instagram}</span>
                    </div>
                  )}
                  {profileData.facebook && (
                    <div className="flex items-center space-x-1">
                      <Facebook className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.facebook}</span>
                    </div>
                  )}
                </div>

                {profileData.description && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Sobre a Barbearia</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{profileData.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Especialidades */}
      <Card>
        <CardHeader>
          <CardTitle>Especialidades da Casa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profileData.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                <Award className="mr-1 h-3 w-3" />
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horários de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {Object.entries(dayLabels).map(([day, label]) => (
                <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="w-32">
                    <input
                      type="checkbox"
                      id={`${day}-working`}
                      checked={editData.workingHours[day as keyof WorkingHours].isWorking}
                      onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'isWorking', e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor={`${day}-working`}>{label}</Label>
                  </div>
                  
                  {editData.workingHours[day as keyof WorkingHours].isWorking && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={editData.workingHours[day as keyof WorkingHours].startTime}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span>às</span>
                      <Input
                        type="time"
                        value={editData.workingHours[day as keyof WorkingHours].endTime}
                        onChange={(e) => updateWorkingHours(day as keyof WorkingHours, 'endTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(dayLabels).map(([day, label]) => {
                const daySchedule = profileData.workingHours[day as keyof WorkingHours];
                return (
                  <div key={day} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{label}</span>
                    {daySchedule.isWorking ? (
                      <span className="text-sm text-green-600">
                        {daySchedule.startTime} às {daySchedule.endTime}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}