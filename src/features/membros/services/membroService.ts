import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { Membro } from '../../../shared/types';

export const membroService = {
  list: async (signal?: AbortSignal): Promise<Membro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.membros.list, {
        signal,
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error;
      }
      return [];
    }
  },

  get: async (id: number): Promise<Membro> => {
    const response = await apiClient.get<any>(endpoints.membros.get(id));
    
    const membro = response.data?.id
      ? response.data
      : response.data?.data?.id
      ? response.data.data
      : null;

    if (membro) {
      return membro;
    }
    
    throw new Error('Membro não encontrado');
  },

  create: async (data: Partial<Membro>): Promise<Membro> => {
    const response = await apiClient.post<Membro>(endpoints.membros.create, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Membro>): Promise<Membro> => {
    const response = await apiClient.put<Membro>(endpoints.membros.update(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.membros.delete(id));
  },

  searchByName: async (nome: string, signal?: AbortSignal): Promise<Membro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.membros.search.byName(nome), {
        signal,
      });
      const { data } = response;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.data)) return data.data;
      if (data?.id) return [data];
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error;
      }
      if (error.response?.status === 404) {
        return [];
      }
      return [];
    }
  },

  searchByCpf: async (cpf: string, signal?: AbortSignal): Promise<Membro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.membros.search.byCpf(cpf), {
        signal,
      });
      const { data } = response;
      if (data?.data) {
        if (Array.isArray(data.data)) return data.data;
        if (data.data?.id) return [data.data];
      }
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (data?.id) return [data];
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error;
      }
      return [];
    }
  },

  searchByRi: async (ri: string, signal?: AbortSignal): Promise<Membro[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.membros.search.byRi(ri), {
        signal,
      });
      const d = response.data;
      if (d?.data) {
        if (Array.isArray(d.data)) return d.data;
        if (d.data?.id) return [d.data];
      }
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.content)) return d.content;
      if (d?.id && !Array.isArray(d)) return [d];
      return [];
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        throw error;
      }
      return [];
    }
  },
};
