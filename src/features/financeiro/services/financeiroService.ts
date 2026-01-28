import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { Financeiro } from '../../../shared/types';

export const financeiroService = {
  list: async (): Promise<Financeiro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.financeiro.list);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  },

  get: async (id: number): Promise<Financeiro> => {
    const response = await apiClient.get<any>(endpoints.financeiro.get(id));
    const financeiro = response.data?.id
      ? response.data
      : response.data?.data?.id
      ? response.data.data
      : null;

    if (financeiro) {
      return financeiro;
    }
    
    throw new Error('Registro financeiro não encontrado');
  },

  create: async (data: Partial<Financeiro>): Promise<Financeiro> => {
    const response = await apiClient.post<any>(endpoints.financeiro.create, data);
    return response.data?.id ? response.data : response.data?.data || response.data;
  },

  update: async (id: number, data: Partial<Financeiro>): Promise<Financeiro> => {
    const response = await apiClient.put<any>(endpoints.financeiro.update(id), data);
    return response.data?.id ? response.data : response.data?.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.financeiro.delete(id));
  },

  searchByType: async (tipo: string): Promise<Financeiro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.financeiro.search.byType(tipo));
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  },

  searchByMember: async (membroId: number): Promise<Financeiro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.financeiro.search.byMember(membroId));
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  },
};

