// Mock Database für Build - wird in Production durch PostgreSQL ersetzt
export const customerQueries = {
  async getAll() { return []; },
  async getById(id: number) { return null; },
  async create(data: any) { return { id: 1, lastInsertRowid: 1, ...data }; },
  async update(id: number, data: any) { return { id, ...data }; },
  async delete(id: number) { return true; },
  async getStats() { return { total: 0, active: 0, inactive: 0 }; }
};

export const orderQueries = {
  async getAll() { return []; },
  async getById(id: number) { return null; },
  async create(data: any) { return { id: 1, lastInsertRowid: 1, ...data }; },
  async update(id: number, data: any) { return { id, ...data }; },
  async delete(id: number) { return true; },
  async getStats() { return { total: 0, pending: 0, completed: 0, cancelled: 0 }; }
};

export const invoiceQueries = {
  async getAll() { return []; },
  async getById(id: number) { return null; },
  async create(data: any) { return { id: 1, ...data }; },
  async update(id: number, data: any) { return { id, ...data }; },
  async delete(id: number) { return true; }
};

export const leadQueries = {
  async getAll() { return []; },
  async getById(id: number) { return null; },
  async create(data: any) { return { id: 1, lastInsertRowid: 1, ...data }; },
  async update(id: number, data: any) { return { id, ...data }; },
  async delete(id: number) { return true; },
  async getStats() { return { total: 0, new: 0, contacted: 0, converted: 0 }; }
};

export const todoQueries = {
  async getAll(customerId?: number) { return []; },
  async getById(id: number) { return null; },
  async create(data: any) { return { id: 1, ...data }; },
  async update(id: number, data: any) { return { id, ...data }; },
  async delete(id: number) { return true; },
  async toggle(id: number) { return { id, completed: true }; }
};

export const settingsQueries = {
  async get(key: string) { return null; },
  async set(key: string, value: string) { return { key, value }; },
  async getAll() { return []; }
};

export class Database {
  get customers() { return customerQueries; }
  get orders() { return orderQueries; }
  get invoices() { return invoiceQueries; }
  get leads() { return leadQueries; }
  get todos() { return todoQueries; }
  get settings() { return settingsQueries; }
}

export const db = new Database();