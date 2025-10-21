import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface ClientProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  notes: string;
  avatar?: string;
}

export function ClientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ClientProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    birthDate: '1990-05-15',
    notes: 'Prefere cortes mais conservadores. Alérgico a produtos com fragrância forte.',
    avatar: user?.avatar
  });

  const [editData, setEditData] = useState<ClientProfileData>(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    toast.success('Perfil atualizado com sucesso!');
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meu Perfil</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar e Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Foto do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl">
                  {profileData.name.charAt(0)}
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
              <Badge variant="secondary">Cliente</Badge>
              {profileData.birthDate && (
                <p className="text-sm text-muted-foreground">
                  {calculateAge(profileData.birthDate)} anos
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
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
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={editData.address}
                    onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{profileData.name}</p>
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
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {new Date(profileData.birthDate).toLocaleDateString('pt-BR')}
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

                {profileData.notes && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{profileData.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Histórico de agendamentos será implementado em breve
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}