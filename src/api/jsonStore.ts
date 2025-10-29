// JSON Store para persistir dados nos arquivos da pasta /database
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface JsonStore {
  appointments: any[];
  clients: any[];
  barbers: any[];
  services: any[];
  users: any[];
  barbershops: any[];
}

class JsonDataStore {
  private basePath = './src/database';

  /**
   * Ler arquivo JSON
   */
  private readJsonFile(filename: string): any {
    try {
      const filePath = join(this.basePath, filename);
      const fileContent = readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`[JSON STORE] Erro ao ler ${filename}:`, error);
      return null;
    }
  }

  /**
   * Escrever arquivo JSON
   */
  private writeJsonFile(filename: string, data: any): boolean {
    try {
      const filePath = join(this.basePath, filename);
      const jsonContent = JSON.stringify(data, null, 2);
      writeFileSync(filePath, jsonContent, 'utf-8');
      console.log(`[JSON STORE] Arquivo ${filename} atualizado com sucesso`);
      return true;
    } catch (error) {
      console.error(`[JSON STORE] Erro ao escrever ${filename}:`, error);
      return false;
    }
  }

  /**
   * Obter todos os registros de uma entidade
   */
  getAll(entity: keyof JsonStore): any[] {
    const filename = `${entity}.json`;
    const data = this.readJsonFile(filename);
    return data ? data[entity] : [];
  }

  /**
   * Obter registro por ID
   */
  getById(entity: keyof JsonStore, id: string): any | null {
    const items = this.getAll(entity);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Criar novo registro
   */
  create(entity: keyof JsonStore, data: any): any {
    const items = this.getAll(entity);
    const newId = `${entity.slice(0, -1)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.push(newItem);
    
    const filename = `${entity}.json`;
    const fileData = { [entity]: items };
    
    if (this.writeJsonFile(filename, fileData)) {
      console.log(`[JSON STORE] Criado ${entity}:`, newId);
      return newItem;
    }
    
    throw new Error(`Erro ao salvar ${entity}`);
  }

  /**
   * Atualizar registro existente
   */
  update(entity: keyof JsonStore, id: string, updates: any): any | null {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;
    
    const filename = `${entity}.json`;
    const fileData = { [entity]: items };
    
    if (this.writeJsonFile(filename, fileData)) {
      console.log(`[JSON STORE] Atualizado ${entity}:`, id);
      return updatedItem;
    }
    
    throw new Error(`Erro ao atualizar ${entity}`);
  }

  /**
   * Deletar registro (soft delete ou hard delete)
   */
  delete(entity: keyof JsonStore, id: string, hardDelete = false): boolean {
    const items = this.getAll(entity);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;

    if (hardDelete || !('isActive' in items[index])) {
      // Hard delete
      items.splice(index, 1);
    } else {
      // Soft delete - marcar como inativo
      items[index].isActive = false;
      items[index].updatedAt = new Date().toISOString();
    }

    const filename = `${entity}.json`;
    const fileData = { [entity]: items };
    
    if (this.writeJsonFile(filename, fileData)) {
      console.log(`[JSON STORE] Deletado ${entity}:`, id);
      return true;
    }
    
    return false;
  }

  /**
   * Filtrar registros
   */
  filter(entity: keyof JsonStore, filterFn: (item: any) => boolean): any[] {
    const items = this.getAll(entity);
    return items.filter(filterFn);
  }

  /**
   * Buscar registros
   */
  search(entity: keyof JsonStore, searchTerm: string, fields: string[]): any[] {
    const items = this.getAll(entity);
    const searchLower = searchTerm.toLowerCase();
    
    return items.filter(item => 
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
    return {
      appointments: this.getAll('appointments').length,
      clients: this.getAll('clients').length,
      barbers: this.getAll('barbers').length,
      services: this.getAll('services').length,
      users: this.getAll('users').length,
      barbershops: this.getAll('barbershops').length
    };
  }

  /**
   * Backup de um arquivo
   */
  backup(entity: keyof JsonStore): boolean {
    try {
      const filename = `${entity}.json`;
      const backupFilename = `${entity}.backup.${Date.now()}.json`;
      
      const data = this.readJsonFile(filename);
      if (data) {
        return this.writeJsonFile(backupFilename, data);
      }
      return false;
    } catch (error) {
      console.error(`[JSON STORE] Erro ao fazer backup de ${entity}:`, error);
      return false;
    }
  }

  /**
   * Validar integridade dos dados
   */
  validateData(entity: keyof JsonStore): { valid: boolean; errors: string[] } {
    const items = this.getAll(entity);
    const errors: string[] = [];

    items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index} não tem ID`);
      }
      if (!item.createdAt) {
        errors.push(`Item ${item.id || index} não tem createdAt`);
      }
      if (!item.updatedAt) {
        errors.push(`Item ${item.id || index} não tem updatedAt`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Instância singleton
export const jsonStore = new JsonDataStore();
export default jsonStore;