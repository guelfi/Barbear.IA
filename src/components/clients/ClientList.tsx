import { useState } from 'react';
import { Plus, Search, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { AnimatedIcon } from '../ui/animated-icon';
import { motion } from 'motion/react';
import { mockClients } from '../../lib/mock-data';
import { Client } from '../../types';

interface ClientListProps {
  onCreateClient: () => void;
  onEditClient: (client: Client) => void;
}

export function ClientList({ onCreateClient, onEditClient }: ClientListProps) {
  const [clients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

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
        <h2 className="text-lg font-semibold">Clientes</h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={onCreateClient}
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
            Novo Cliente
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
            placeholder="Buscar clientes..."
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
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
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
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20"
              onClick={() => onEditClient(client)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{client.name}</CardTitle>
                    <div className="flex items-center space-x-1 mt-1">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge variant="secondary" className="hover:bg-primary/10 transition-colors">
                          {client.totalAppointments} agendamentos
                        </Badge>
                      </motion.div>
                    </div>
                  </div>
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
                    <span className="truncate">{client.email}</span>
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
                    <span>{client.phone}</span>
                  </motion.div>
                  {client.lastVisit && (
                    <motion.div 
                      className="flex items-center space-x-2 text-sm text-muted-foreground"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatedIcon
                        icon={Calendar}
                        animation="bounce"
                        category="calendar"
                        size="sm"
                        intensity="low"
                      />
                      <span>
                        Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                      </span>
                    </motion.div>
                  )}
                </div>
                {client.notes && (
                  <motion.div 
                    className="mt-3 p-2 bg-muted rounded text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <p className="text-muted-foreground line-clamp-2">{client.notes}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredClients.length === 0 && (
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
            {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
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
                onClick={onCreateClient}
              >
                <AnimatedIcon
                  icon={Plus}
                  animation="sparkle"
                  category="action"
                  size="sm"
                  intensity="high"
                  className="mr-2"
                />
                Cadastrar primeiro cliente
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}