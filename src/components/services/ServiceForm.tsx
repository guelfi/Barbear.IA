import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Scissors,
  Clock,
  DollarSign,
  Tag,
  Settings
} from 'lucide-react';
import { Service } from '../../types';

interface ServiceFormProps {
  service?: Service;
  onSave: (service: Partial<Service>) => void;
  onCancel: () => void;
}

const serviceCategories = [
  'Corte',
  'Barba',
  'Combo',
  'Tratamento',
  'Coloração',
  'Penteado',
  'Outros'
];

export function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    duration: service?.duration || 30,
    price: service?.price || 0,
    category: service?.category || 'Corte',
    isActive: service?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatPrice = (value: string) => {
    // Remove tudo que não é número ou vírgula/ponto
    const numbers = value.replace(/[^\d.,]/g, '');
    
    // Converte vírgula para ponto
    const normalized = numbers.replace(',', '.');
    
    // Converte para número
    const numValue = parseFloat(normalized) || 0;
    
    return numValue;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = formatPrice(value);
    setFormData(prev => ({ ...prev, price: numericValue }));
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'corte':
        return 'bg-blue-100 text-blue-800';
      case 'barba':
        return 'bg-green-100 text-green-800';
      case 'combo':
        return 'bg-purple-100 text-purple-800';
      case 'tratamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'coloração':
        return 'bg-pink-100 text-pink-800';
      case 'penteado':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="h-5 w-5" />
          <span>{service ? 'Editar Serviço' : 'Novo Serviço'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Informações do Serviço</span>
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Corte Masculino, Barba Completa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Badge className={getCategoryColor(formData.category)}>
                    {formData.category}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Serviço ativo</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o serviço, técnicas utilizadas, resultados esperados..."
                rows={3}
              />
            </div>
          </div>

          {/* Duração e Preço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Duração (minutos) *</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tempo estimado: {Math.floor(formData.duration / 60)}h {formData.duration % 60}min
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Preço (R$) *</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Valor: R$ {formData.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          {/* Preview do Serviço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{formData.name || 'Nome do Serviço'}</h4>
                      <Badge className={getCategoryColor(formData.category)}>
                        {formData.category}
                      </Badge>
                      {formData.isActive ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {formData.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formData.duration} min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>R$ {formData.price.toFixed(2).replace('.', ',')}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">
              {service ? 'Atualizar' : 'Cadastrar'} Serviço
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