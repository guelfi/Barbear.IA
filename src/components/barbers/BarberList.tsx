import { useState } from 'react';
import { Plus, Search, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { AnimatedIcon } from '../ui/animated-icon';
import { motion } from 'framer-motion';
import { mockBarbers, mockServices } from '../../lib/mock-data';
import { Barber } from '../../types';

interface BarberListProps {
  onCreateBarber: () => void;
  onEditBarber: (barber: Barber) => void;
}

export function BarberList({ onCreateBarber, onEditBarber }: BarberListProps) {
  const [barbers, setBarbers] = useState(mockBarbers);
  const [services] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.phone.includes(searchTerm)
  );

  const toggleBarberStatus = (id: string) => {
    setBarbers(prev =>
      prev.map(barber =>
        barber.id === id ? { ...barber, isActive: !barber.isActive } : barber
      )
    );
  };

  const getBarberServices = (serviceIds?: string[]) => {
    if (!serviceIds) return [];
    return services.filter(service => serviceIds.includes(service.id));
  };

  const getWorkingDays = (schedule?: any[]) => {
    if (!schedule) return 'Não definido';
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return schedule
      .filter(s => s.isWorking)
      .map(s => days[s.dayOfWeek])
      .join(', ');
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
        <h2 className="text-lg font-semibold">Barbeiros</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={onCreateBarber}
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
            Novo Barbeiro
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
            placeholder="Buscar barbeiros..."
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
        {filteredBarbers.map((barber, index) => (
          <motion.div
            key={barber.id}
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
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={barber.avatar} />
                        <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <CardTitle className="text-base">{barber.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge 
                            variant={barber.isActive ? 'default' : 'secondary'}
                            className="hover:bg-primary/10 transition-colors"
                          >
                            {barber.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Switch
                      checked={barber.isActive}
                      onCheckedChange={() => toggleBarberStatus(barber.id)}
                    />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <motion.div 
                    className="flex items-center space-x-2 text-sm text-muted-foreground"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatedIcon
                      icon={Mail}
                      animation="float"
                      category="action"
                      size="sm"
                      intensity="low"
                    />
                    <span className="truncate">{barber.email}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 text-sm text-muted-foreground"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatedIcon
                      icon={Phone}
                      animation="wiggle"
                      category="action"
                      size="sm"
                      intensity="low"
                    />
                    <span>{barber.phone}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 text-sm text-muted-foreground"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnimatedIcon
                      icon={Clock}
                      animation="pulse"
                      category="calendar"
                      size="sm"
                      intensity="low"
                    />
                    <span>{getWorkingDays(barber.schedule)}</span>
                  </motion.div>
                </div>

                <motion.div 
                  className="mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <p className="text-sm font-medium mb-2">Serviços:</p>
                  <div className="flex flex-wrap gap-1">
                    {getBarberServices(barber.services).map((service, serviceIndex) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: serviceIndex * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge variant="outline" className="text-xs hover:bg-primary/10 transition-colors">
                          {service.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 hover:shadow-md transition-all duration-200"
                    onClick={() => onEditBarber(barber)}
                  >
                    Editar
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredBarbers.length === 0 && (
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
            {searchTerm ? 'Nenhum barbeiro encontrado.' : 'Nenhum barbeiro cadastrado.'}
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
                onClick={onCreateBarber}
              >
                <AnimatedIcon
                  icon={Plus}
                  animation="sparkle"
                  category="action"
                  size="sm"
                  intensity="high"
                  className="mr-2"
                />
                Cadastrar primeiro barbeiro
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
