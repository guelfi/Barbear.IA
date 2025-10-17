// Legacy hook - redirects to the new context-based auth
// This ensures backward compatibility while we transition to the new system
import { useAuth } from '../contexts/AuthContext';

export const useAuthState = () => {
  return useAuth();
};