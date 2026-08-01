export { default as authAPI } from './auth';
export { default as usersAPI } from './users';
export { default as appointmentsAPI } from './appointments';
export { default as clientsAPI } from './clients';
export { default as barbersAPI } from './barbers';
export { default as servicesAPI } from './services';
export { default as barbershopsAPI } from './barbershops';
export { default as dashboardAPI } from './dashboard';
export { default as notificationsAPI } from './notifications';
export { default as billingAPI } from './billing';
export * from './http';

/**
 * Compatibilidade temporária para importações antigas. Não roteia mocks:
 * chamadas devem usar os módulos de API nomeados acima.
 */
export const apiRouter = undefined;
export default apiRouter;
