// Memory Store para simular persistência de dados durante a sessão
import appointmentsData from '../database/appointments.json';
import clientsData from '../database/clients.json';
import barbersData from '../database/barbers.json';
import servicesData from '../database/services.json';
import usersData from '../database/users.json';
import barbershopsData from '../database/barbershops.json';

interface MemoryStore {
  appointments: any[];
  clients: any[];
  barbers: any[];
  services: any[];
  users: any[];
  barbershops: any[];
}

class InMemoryDataStore {
  private store: MemoryStore;
  private initialized = false;

  constructor() {
    this.store = {
      appointments: [],
      clients: [],
      barbers: [],
      services: [],
      users: [],
      barbershops: []
    };
  }

  /**
   * Inicializar store com dados dos arquivos JSON
   */
  initialize() {
    if (this.initialized) return;

    this.store = {
      appointments: [...appointmentsData.appointments],
      clients: [...clientsData.clients],
      barbers: [...barbersData.barbers],
      services: [...servicesData.services],
      users: [...usersData.users],
      barbershops: [...barbershopsData.barbershops]
    };

    this.initialized = true;
    console.log('[MEMORY STORE] Inicializado com dados dos arquivos JSON');
  }

  /**
   * Obter todos os registros de uma entidade
   */
  getAll(entity: keyof MemoryStore): any[] {
    this.initialize();
    return [...this.store[entity]];
  }

  /**
   * Obter registro por ID
   */
  getById(entity: keyof MemoryStore, id: string): any | null {
    this.initialize();
    return this.store[entity].find(item => item.id === id) || null;
  }

  /**
   * Criar novo registro
   */
  create(entity: keyof MemoryStore, data: any): any {
    this.initialize();
    const newId = `${entity.slice(0, -1)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store[entity].push(newItem);
    console.log(`[MEMORY STORE] Criado ${entity}:`, newId);
    return newItem;
  }

  /**
   * Atualizar registro existente
   */
  update(entity: keyof MemoryStore, id: string, updates: any): any | null {
    this.initialize();
    const index = this.store[entity].findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...this.store[entity][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.store[entity][index] = updatedItem;
    console.log(`[MEMORY STORE] Atualizado ${entity}:`, id);
    return updatedItem;
  }

  /**
   * Deletar registro (soft delete)
   */
  delete(entity: keyof MemoryStore, id: string): boolean {
    this.initialize();
    const index = this.store[entity].findIndex(item => item.id === id);
    
    if (index === -1) return false;

    // Soft delete - marcar como inativo
    if ('isActive' in this.store[entity][index]) {
      this.store[entity][index].isActive = false;
      this.store[entity][index].updatedAt = new Date().toISOString();
    } else {
      // Hard delete se não tiver campo isActive
      this.store[entity].splice(index, 1);
    }

    console.log(`[MEMORY STORE] Deletado ${entity}:`, id);
    return true;
  }

  /**
   * Filtrar registros
   */
  filter(entity: keyof MemoryStore, filterFn: (item: any) => boolean): any[] {
    this.initialize();
    return this.store[entity].filter(filterFn);
  }

  /**
   * Buscar registros
   */
  search(entity: keyof MemoryStore, searchTerm: string, fields: string[]): any[] {
    this.initialize();
    const searchLower = searchTerm.toLowerCase();
    
    return this.store[entity].filter(item => 
      fields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchLower);
      })
    );
  }

  /**
   * Obter estatísticas
   */
  getStats(): {
    appointments: number;
    clients: number;
    barbers: number;
    services: number;
    users: number;
    barbershops: number;
  } {
    this.initialize();
    return {
      appointments: this.store.appointments.length,
      clients: this.store.clients.length,
      barbers: this.store.barbers.length,
      services: this.store.services.length,
      users: this.store.users.length,
      barbershops: this.store.barbershops.length
    };
  }

  /**
   * Reset store (para testes)
   */
  reset() {
    this.initialized = false;
    this.store = {
      appointments: [],
      clients: [],
      barbers: [],
      services: [],
      users: [],
      barbershops: []
    };
    console.log('[MEMORY STORE] Reset realizado');
  }

  /**
   * Debug: obter estado completo
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      stats: this.getStats(),
      lastUpdate: new Date().toISOString()
    };
  }
}

// Instância singleton
export const memoryStore = new InMemoryDataStore();
export default memoryStore;