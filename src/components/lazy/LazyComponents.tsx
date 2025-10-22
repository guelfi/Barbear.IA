import { lazy } from 'react';
import React from 'react';

// Lazy loading dos componentes principais
export const LazyDashboard = lazy(() => import('../dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
export const LazySuperAdminDashboard = lazy(() => import('../dashboard/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));
export const LazyAppointmentCalendar = lazy(() => import('../appointments/AppointmentCalendar').then(module => ({ default: module.AppointmentCalendar })));
export const LazyAppointmentForm = lazy(() => import('../appointments/AppointmentForm').then(module => ({ default: module.AppointmentForm })));
export const LazyClientList = lazy(() => import('../clients/ClientList').then(module => ({ default: module.ClientList })));
export const LazyClientForm = lazy(() => import('../clients/ClientForm').then(module => ({ default: module.ClientForm })));
export const LazyClientProfile = lazy(() => import('../clients/ClientProfile').then(module => ({ default: module.ClientProfile })));
export const LazyBarberList = lazy(() => import('../barbers/BarberList').then(module => ({ default: module.BarberList })));
export const LazyBarberForm = lazy(() => import('../barbers/BarberForm').then(module => ({ default: module.BarberForm })));
export const LazyBarberProfile = lazy(() => import('../barbers/BarberProfile').then(module => ({ default: module.BarberProfile })));
export const LazyBarbershopProfile = lazy(() => import('../barbershop/BarbershopProfile').then(module => ({ default: module.BarbershopProfile })));
export const LazyServiceList = lazy(() => import('../services/ServiceList').then(module => ({ default: module.ServiceList })));
export const LazyServiceForm = lazy(() => import('../services/ServiceForm').then(module => ({ default: module.ServiceForm })));

// Componente de loading personalizado
export function ComponentLoader() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Carregando componente...</p>
      </div>
    </div>
  );
}

// HOC para wrapping com Suspense
export function withSuspense<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function SuspenseWrapper(props: T) {
    return (
      <React.Suspense fallback={fallback || <ComponentLoader />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}

// Preload functions para componentes críticos
export const preloadComponents = {
  dashboard: () => import('../dashboard/Dashboard'),
  appointments: () => import('../appointments/AppointmentCalendar'),
  clients: () => import('../clients/ClientList'),
  barbers: () => import('../barbers/BarberList'),
  services: () => import('../services/ServiceList'),
};

// Hook para preload baseado em hover/focus
export function usePreloadOnHover() {
  const preloadComponent = (componentName: keyof typeof preloadComponents) => {
    return () => {
      preloadComponents[componentName]().catch(console.error);
    };
  };

  return { preloadComponent };
}