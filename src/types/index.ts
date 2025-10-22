export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'barber' | 'client';
  avatar?: string;
  phone?: string;
  tenantId?: string; // Optional for super_admin
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  plan: 'pro-monthly' | 'pro-yearly';
  status: 'active' | 'suspended' | 'cancelled' | 'pending_approval';
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  settings: TenantSettings;
  subscription: TenantSubscription;
  status: 'pending' | 'approved' | 'suspended' | 'cancelled';
  createdAt: string;
  approvedAt?: string;
  ownerId: string; // User ID of the tenant owner
  totalUsers: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

export interface TenantSettings {
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  appointmentDuration: number; // minutes
  bookingAdvance: number; // days
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // minutes
  category: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialties: string[];
  workingHours: WorkingHours;
  services?: string[]; // service IDs
  schedule?: Schedule[];
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface Schedule {
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  tenantId: string;
  notes?: string;
  totalAppointments: number;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  price: number;
  tenantId: string;
  client: Client;
  barber: Barber;
  service: Service;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface DashboardStats {
  todayAppointments: number;
  weeklyRevenue: number;
  totalClients: number;
  completionRate: number;
  upcomingAppointments: Appointment[];
  recentClients: Client[];
}

export interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  pendingApprovals: number;
  totalUsers: number;
  monthlyRevenue: number;
  conversionRate: number;
  recentTenants: Tenant[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'barbershop' | 'client' | 'barber' | 'super_admin';
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: 'barbershop' | 'client' | 'barber';
  // For barbershop registration
  businessName?: string;
  address?: string;
  // For client registration
  preferredLocation?: string;
}
