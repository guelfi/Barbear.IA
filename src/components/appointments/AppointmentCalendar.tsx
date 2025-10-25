import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Calendar } from '../ui/calendar';
import { AnimatedIcon } from '../ui/animated-icon';
import { motion } from 'framer-motion';
import { mockAppointments } from '../../lib/mock-data';
import { Appointment } from '../../types';

interface AppointmentCalendarProps {
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'no-show': 'bg-red-100 text-red-800',
};

const statusLabels = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  'in-progress': 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  'no-show': 'Não Compareceu',
};

export function AppointmentCalendar({ onCreateAppointment, onEditAppointment }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments] = useState(mockAppointments);

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const dayAppointments = appointments
    .filter(apt => apt.date === selectedDateString)
    .sort((a, b) => a.time.localeCompare(b.time));

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
        <div className="flex items-center space-x-2">
          <AnimatedIcon
            icon={CalendarIcon}
            animation="bounce"
            category="calendar"
            size="md"
            intensity="medium"
          />
          <h2 className="text-lg font-semibold">Agendamentos</h2>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={onCreateAppointment}
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
            Novo Agendamento
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AnimatedIcon
                  icon={CalendarIcon}
                  animation="scale"
                  category="calendar"
                  size="sm"
                  intensity="low"
                />
                <span>Calendário</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointments List */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>
                Agendamentos - {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayAppointments.length === 0 ? (
                <motion.div 
                  className="text-center py-8 text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <AnimatedIcon
                    icon={CalendarIcon}
                    animation="float"
                    category="calendar"
                    size="xl"
                    intensity="low"
                    className="mx-auto mb-2"
                  />
                  <p>Nenhum agendamento para este dia</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {dayAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      className="flex items-center space-x-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                      onClick={() => onEditAppointment(appointment)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <AnimatedIcon
                          icon={Clock}
                          animation="pulse"
                          category="calendar"
                          size="sm"
                          intensity="low"
                        />
                        <span>{appointment.time}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={appointment.client.avatar} />
                          <AvatarFallback>{appointment.client.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <div className="flex-1">
                        <p className="font-medium">{appointment.client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service.name} ({appointment.duration}min)
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <AnimatedIcon
                            icon={User}
                            animation="wiggle"
                            category="user"
                            size="sm"
                            intensity="low"
                          />
                          <span className="text-xs text-muted-foreground">
                            {appointment.barber.name}
                          </span>
                        </div>
                      </div>
                      
                      <motion.div 
                        className="text-right"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="font-medium">R$ {(appointment.service.price || 0).toFixed(2)}</p>
                        <Badge className={statusColors[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
