import usersData from '../database/users.json';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'barber' | 'client';
  tenantId?: string;
  avatar: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

interface UserFilters {
  tenantId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Função para simular delay de rede
const simulateNetworkDelay = (min: number = 300, max: number = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Função para log de debug
const logUserEvent = (event: string, data: any) => {
  console.log(`[USERS API] ${event}:`, data);
};

export const usersAPI = {
  /**
   * Obter todos os usuários (sem filtros)
   */
  async getAll(): Promise<Omit<User, 'password'>[]> {
    logUserEvent('GET_ALL_USERS', {});
    await simulateNetworkDelay();

    try {
      const usersWithoutPassword = usersData.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      logUserEvent('GET_ALL_USERS_SUCCESS', { count: usersWithoutPassword.length });
      return usersWithoutPassword as Omit<User, 'password'>[];

    } catch (error) {
      logUserEvent('GET_ALL_USERS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao obter usuários');
    }
  },

  /**
   * Listar usuários com filtros e paginação
   */
  async getUsers(filters: UserFilters = {}, pagination: PaginationOptions = {}): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    logUserEvent('GET_USERS', { filters, pagination });
    await simulateNetworkDelay();

    try {
      let filteredUsers = [...usersData.users];

      // Aplicar filtros
      if (filters.tenantId) {
        filteredUsers = filteredUsers.filter(user => user.tenantId === filters.tenantId);
      }

      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar ordenação
      const sortBy = pagination.sortBy || 'name';
      const sortOrder = pagination.sortOrder || 'asc';
      
      filteredUsers.sort((a, b) => {
        const aValue = a[sortBy as keyof User] || '';
        const bValue = b[sortBy as keyof User] || '';
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Aplicar paginação
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      // Remover senhas
      const usersWithoutPasswords = paginatedUsers.map(({ password, ...user }) => user as Omit<User, 'password'>);

      return {
        users: usersWithoutPasswords,
        total: filteredUsers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUsers.length / limit)
      };

    } catch (error) {
      logUserEvent('GET_USERS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao buscar usuários');
    }
  },

  /**
   * Obter usuário por ID
   */
  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    logUserEvent('GET_USER_BY_ID', { id });
    await simulateNetworkDelay();

    try {
      const user = usersData.users.find(u => u.id === id);
      
      if (!user) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as Omit<User, 'password'>;

    } catch (error) {
      logUserEvent('GET_USER_BY_ID_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao buscar usuário');
    }
  },

  /**
   * Obter usuário por email
   */
  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    logUserEvent('GET_USER_BY_EMAIL', { email });
    await simulateNetworkDelay();

    try {
      const user = usersData.users.find(u => u.email === email);
      
      if (!user) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as Omit<User, 'password'>;

    } catch (error) {
      logUserEvent('GET_USER_BY_EMAIL_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao buscar usuário por email');
    }
  },

  /**
   * Criar novo usuário
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'> & { password: string }): Promise<Omit<User, 'password'>> {
    logUserEvent('CREATE_USER', { email: userData.email, role: userData.role });
    await simulateNetworkDelay();

    try {
      // Verificar se email já existe
      const existingUser = usersData.users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Gerar ID único
      const newId = `${userData.role}-${Date.now()}`;
      
      const newUser: User & { password: string } = {
        ...userData,
        id: newId,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Em uma implementação real, salvaria no banco de dados
      // Por enquanto, apenas simula a criação
      
      const { password, ...userWithoutPassword } = newUser;
      
      logUserEvent('USER_CREATED', { id: newId, email: userData.email });
      return userWithoutPassword;

    } catch (error) {
      logUserEvent('CREATE_USER_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw error;
    }
  },

  /**
   * Atualizar usuário
   */
  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<Omit<User, 'password'> | null> {
    logUserEvent('UPDATE_USER', { id, updates });
    await simulateNetworkDelay();

    try {
      const userIndex = usersData.users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return null;
      }

      // Em uma implementação real, atualizaria no banco de dados
      // Por enquanto, apenas simula a atualização
      
      const updatedUser = {
        ...usersData.users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const { password, ...userWithoutPassword } = updatedUser;
      
      logUserEvent('USER_UPDATED', { id });
      return userWithoutPassword as Omit<User, 'password'>;

    } catch (error) {
      logUserEvent('UPDATE_USER_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao atualizar usuário');
    }
  },

  /**
   * Desativar usuário (soft delete)
   */
  async deactivateUser(id: string): Promise<boolean> {
    logUserEvent('DEACTIVATE_USER', { id });
    await simulateNetworkDelay();

    try {
      const user = usersData.users.find(u => u.id === id);
      
      if (!user) {
        return false;
      }

      // Em uma implementação real, atualizaria no banco de dados
      // Por enquanto, apenas simula a desativação
      
      logUserEvent('USER_DEACTIVATED', { id });
      return true;

    } catch (error) {
      logUserEvent('DEACTIVATE_USER_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao desativar usuário');
    }
  },

  /**
   * Obter estatísticas de usuários
   */
  async getUserStats(tenantId?: string): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    inactive: number;
  }> {
    logUserEvent('GET_USER_STATS', { tenantId });
    await simulateNetworkDelay();

    try {
      let users = usersData.users;
      
      if (tenantId) {
        users = users.filter(u => u.tenantId === tenantId);
      }

      const stats = {
        total: users.length,
        byRole: {} as Record<string, number>,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length
      };

      // Contar por role
      users.forEach(user => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      });

      return stats;

    } catch (error) {
      logUserEvent('GET_USER_STATS_ERROR', { error: error instanceof Error ? error.message : 'Erro desconhecido' });
      throw new Error('Erro ao obter estatísticas de usuários');
    }
  },

  // Alias para compatibilidade
  update: function(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) {
    return this.updateUser(id, updates);
  }
};

export default usersAPI;