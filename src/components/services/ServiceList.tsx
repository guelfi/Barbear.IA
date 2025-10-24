import { useState } from 'react';
import { Plus, Search, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { AnimatedIcon } from '../ui/animated-icon';
import { motion } from 'framer-motion';
import { mockServices } from '../../lib/mock-data';
import { Service } from '../../types';

interface ServiceListProps {
  onCreateService: () => void;
  onEditService: (service: Service) => void;
}

export function ServiceList({ onCreateService, onEditService }: ServiceListProps) {
  const [services, setServices] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleServiceStatus = (id: string) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, isActive: !service.isActive } : service
      )
    );
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold">Serviços</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={onCreateService}
            className="hover:shadow-lg transition-all duration-200"
          >
            <AnimatedIcon
              icon={Plus}
              animation="pulse"
              category="action"
              size="sm"
              intensity="medium"
              className="mr-2"
            />
            Novo Serviço
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex items-center space-x-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <AnimatedIcon
            icon={Search}
            animation="pulse"
            category="action"
            size="sm"
            intensity="low"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 hover:border-primary/50 focus:border-primary transition-all duration-200"
          />
        </div>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.4 + index * 0.1,
              type: "tween",
              ease: "easeOut"
            }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              transition: { duration: 0.2 } 
            }}
          >
            <Card className="relative hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge 
                          variant={service.isActive ? 'default' : 'secondary'}
                          className="hover:bg-primary/10 transition-colors"
                        >
                          {service.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => toggleServiceStatus(service.id)}
                    />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <motion.p 
                  className="text-sm text-muted-foreground mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {service.description}
                </motion.p>

                <div className="space-y-2">
                  <motion.div 
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 text-sm">
                      <AnimatedIcon
                        icon={DollarSign}
                        animation="scale"
                        category="stats"
                        size="sm"
                        intensity="medium"
                        className="text-green-600"
                      />
                      <span>Preço:</span>
                    </div>
                    <span className="font-medium">R$ {(service.price || 0).toFixed(2)}</span>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 text-sm">
                      <AnimatedIcon
                        icon={Clock}
                        animation="pulse"
                        category="calendar"
                        size="sm"
                        intensity="medium"
                        className="text-blue-600"
                      />
                      <span>Duração:</span>
                    </div>
                    <span className="font-medium">{service.duration} min</span>
                  </motion.div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:shadow-md transition-all duration-200"
                      onClick={() => onEditService(service)}
                    >
                      <AnimatedIcon
                        icon={Edit}
                        animation="wiggle"
                        category="action"
                        size="sm"
                        intensity="medium"
                        className="mr-1"
                      />
                      Editar
                    </Button>
                  </motion.div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="hover:shadow-md transition-all duration-200"
                        >
                          <AnimatedIcon
                            icon={Trash2}
                            animation="shake"
                            category="action"
                            size="sm"
                            intensity="high"
                          />
                        </Button>
                      </motion.div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o serviço "{service.name}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteService(service.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredServices.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="text-muted-foreground mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {searchTerm ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado.'}
          </motion.div>
          {!searchTerm && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                className="mt-4 hover:shadow-lg transition-all duration-200" 
                onClick={onCreateService}
              >
                <AnimatedIcon
                  icon={Plus}
                  animation="sparkle"
                  category="action"
                  size="sm"
                  intensity="high"
                  className="mr-2"
                />
                Cadastrar primeiro serviço
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
