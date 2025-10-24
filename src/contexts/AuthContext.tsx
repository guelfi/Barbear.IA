import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, RegisterData } from '../types';

// Mock users for development
const mockUsers = {
  // Super Admin
  'admin@barbear.ia': {
    id: 'super-1',
    name: 'Super Administrador',
    email: 'admin@barbear.ia',
    role: 'super_admin' as const,
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    phone: '(11) 99999-0000',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  // Barbershop Admin
  'admin@barbearia.com': {
    id: 'admin-1',
    name: 'Administrador Barbearia',
    email: 'admin@barbearia.com',
    role: 'admin' as const,
    tenantId: 'tenant-1',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGNTk3MzEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    phone: '(11) 99999-1111',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  // Barber
  'barbeiro@barbearia.com': {
    id: 'barber-1',
    name: 'João Barbeiro',
    email: 'barbeiro@barbearia.com',
    role: 'barber' as const,
    tenantId: 'tenant-1',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    phone: '(11) 99999-2222',
    isActive: true,
    createdAt: '2024-01-20T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  // Client
  'cliente@email.com': {
    id: 'client-1',
    name: 'Maria Cliente',
    email: 'cliente@email.com',
    role: 'client' as const,
    tenantId: 'tenant-1',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFRjQ0NDQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    phone: '(11) 99999-3333',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  }
};

const mockPasswords = {
  'admin@barbear.ia': 'super123',
  'admin@barbearia.com': 'admin123',
  'barbeiro@barbearia.com': 'barber123',
  'cliente@email.com': 'cliente123',
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType?: 'barbershop' | 'client' | 'barber' | 'super_admin') => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateLastLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail && mockUsers[userEmail as keyof typeof mockUsers]) {
      setUser(mockUsers[userEmail as keyof typeof mockUsers]);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (
    email: string, 
    password: string, 
    userType: 'barbershop' | 'client' | 'barber' | 'super_admin' = 'barbershop'
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = mockUsers[email as keyof typeof mockUsers];
      const expectedPassword = mockPasswords[email as keyof typeof mockPasswords];

      if (mockUser && password === expectedPassword) {
        // Validate user type compatibility
        if (userType === 'client' && mockUser.role === 'client') {
          // Client login
          localStorage.setItem('authToken', 'mock-token-client');
          localStorage.setItem('userEmail', email);
          setUser(mockUser);
          return true;
        } else if (userType === 'super_admin' && mockUser.role === 'super_admin') {
          // Super Admin login
          localStorage.setItem('authToken', 'mock-token-super-admin');
          localStorage.setItem('userEmail', email);
          setUser(mockUser);
          return true;
        } else if (userType === 'barber' && mockUser.role === 'barber') {
          // Barber login
          localStorage.setItem('authToken', 'mock-token-barber');
          localStorage.setItem('userEmail', email);
          setUser(mockUser);
          return true;
        } else if (userType === 'barbershop' && mockUser.role === 'admin') {
          // Barbershop/Admin login
          localStorage.setItem('authToken', 'mock-token-barbershop');
          localStorage.setItem('userEmail', email);
          setUser(mockUser);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if email already exists
      if (mockUsers[data.email as keyof typeof mockUsers]) {
        return false;
      }

      // In a real app, this would create the user in the database
      console.log('New user registration:', data);
      
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: still clear user state
      setUser(null);
    }
  }, []);

  const updateLastLogin = useCallback(() => {
    if (user) {
      setUser({
        ...user,
        lastLogin: new Date().toISOString()
      });
    }
  }, [user]);

  const value = React.useMemo(() => ({
    user,
    login,
    register,
    logout,
    isLoading,
    updateLastLogin,
  }), [user, login, register, logout, isLoading, updateLastLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
