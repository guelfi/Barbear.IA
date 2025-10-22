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
    Camera,
    Clock,
    Scissors,
    Plus,
    Star,
    Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { WorkingHours } from '../../types';

interface BarberProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    bio: string;
    specialties: string[];
    workingHours: WorkingHours;
    avatar?: string;
    experience: string;
    certifications: string[];
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

export function BarberProfile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<BarberProfileData>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: 'Rua das Tesouras, 456 - São Paulo, SP',
        birthDate: '1985-03-20',
        bio: 'Barbeiro profissional com mais de 10 anos de experiência. Especialista em cortes clássicos e modernos.',
        specialties: ['Corte Masculino', 'Barba', 'Bigode', 'Degradê'],
        workingHours: defaultWorkingHours,
        avatar: user?.avatar,
        experience: '10 anos',
        certifications: ['Certificado SENAC', 'Curso de Barbeiro Profissional']
    });

    const [editData, setEditData] = useState<BarberProfileData>(profileData);
    const [newSpecialty, setNewSpecialty] = useState('');
    const [newCertification, setNewCertification] = useState('');

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

    const addSpecialty = () => {
        if (newSpecialty.trim() && !editData.specialties.includes(newSpecialty.trim())) {
            setEditData(prev => ({
                ...prev,
                specialties: [...prev.specialties, newSpecialty.trim()]
            }));
            setNewSpecialty('');
        }
    };

    const removeSpecialty = (specialty: string) => {
        setEditData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(s => s !== specialty)
        }));
    };

    const addCertification = () => {
        if (newCertification.trim() && !editData.certifications.includes(newCertification.trim())) {
            setEditData(prev => ({
                ...prev,
                certifications: [...prev.certifications, newCertification.trim()]
            }));
            setNewCertification('');
        }
    };

    const removeCertification = (certification: string) => {
        setEditData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(c => c !== certification)
        }));
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
                <h2 className="text-2xl font-bold">Meu Perfil Profissional</h2>
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
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <Scissors className="mr-1 h-3 w-3" />
                                Barbeiro Profissional
                            </Badge>
                            {profileData.birthDate && (
                                <p className="text-sm text-muted-foreground">
                                    {calculateAge(profileData.birthDate)} anos
                                </p>
                            )}
                            <div className="flex items-center justify-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">4.8</span>
                                <span className="text-xs text-muted-foreground">(127 avaliações)</span>
                            </div>
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

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experiência</Label>
                                    <Input
                                        id="experience"
                                        value={editData.experience}
                                        onChange={(e) => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                                        placeholder="Ex: 10 anos"
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
                                    <Label htmlFor="bio">Biografia Profissional</Label>
                                    <Textarea
                                        id="bio"
                                        value={editData.bio}
                                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={3}
                                        placeholder="Conte sobre sua experiência, especialidades e estilo de trabalho..."
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

                                <div className="flex items-center space-x-3">
                                    <Award className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Experiência</p>
                                        <p className="font-medium">{profileData.experience}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Endereço</p>
                                        <p className="font-medium">{profileData.address}</p>
                                    </div>
                                </div>

                                {profileData.bio && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Biografia</p>
                                        <p className="text-sm bg-muted p-3 rounded-md">{profileData.bio}</p>
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
                    <CardTitle>Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
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
                                {editData.specialties.map((specialty, index) => (
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
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profileData.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                    <Scissors className="mr-1 h-3 w-3" />
                                    {specialty}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Certificações */}
            <Card>
                <CardHeader>
                    <CardTitle>Certificações e Cursos</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    value={newCertification}
                                    onChange={(e) => setNewCertification(e.target.value)}
                                    placeholder="Digite uma certificação ou curso"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                                />
                                <Button type="button" onClick={addCertification}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {editData.certifications.map((cert, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                        <span>{cert}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCertification(cert)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profileData.certifications.map((cert, index) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                    <Award className="mr-1 h-3 w-3" />
                                    {cert}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Horários de Trabalho */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Horários de Trabalho</span>
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
                        <div className="space-y-2">
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
                                            <span className="text-sm text-muted-foreground">Não trabalha</span>
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
