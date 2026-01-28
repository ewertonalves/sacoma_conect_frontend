import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { AssistenciaSocial, PaginatedResponse } from '../../../shared/types';

export const assistenciaSocialService = {
  list: async (page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'DESC', search?: string): Promise<PaginatedResponse<AssistenciaSocial>> => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sortBy,
        sortDir,
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await apiClient.get<any>(`${endpoints.assistenciaSocial.list}?${params.toString()}`);
      const data = response.data;
      
      return {
        content: Array.isArray(data.data) ? data.data : [],
        totalElements: data.totalItems || 0,
        totalPages: data.totalPages || 0,
        size: data.pageSize || size,
        number: data.currentPage || page,
      };
    } catch {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
      };
    }
  },

  get: async (id: number): Promise<AssistenciaSocial> => {
    const response = await apiClient.get<any>(endpoints.assistenciaSocial.get(id));
    const assistenciaSocial = response.data?.id
      ? response.data
      : response.data?.data?.id
      ? response.data.data
      : null;

    if (assistenciaSocial) {
      return assistenciaSocial;
    }
    
    throw new Error('Registro de assistência social não encontrado');
  },

  create: async (data: Partial<AssistenciaSocial>): Promise<AssistenciaSocial> => {
    const response = await apiClient.post<any>(endpoints.assistenciaSocial.create, data);
    return response.data?.id ? response.data : response.data?.data || response.data;
  },

  update: async (id: number, data: Partial<AssistenciaSocial>): Promise<AssistenciaSocial> => {
    const response = await apiClient.put<any>(endpoints.assistenciaSocial.update(id), data);
    return response.data?.id ? response.data : response.data?.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.assistenciaSocial.delete(id));
  },
};
