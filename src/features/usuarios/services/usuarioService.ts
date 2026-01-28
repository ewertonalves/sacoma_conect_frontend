import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { User } from '../../../shared/types';

const listUsuarios = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<any>(endpoints.auth.usuarios.list);
    const users = response.data.data || response.data;
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

export const usuarioService = {
  list: listUsuarios,

  search: async (nome: string): Promise<User[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.auth.usuarios.search(nome));
      const users = response.data.data || response.data;
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  },

  get: async (id: number): Promise<User> => {
    // Busca o usuário na lista completa, pois não há endpoint GET /usuarios/{id} no backend
    const usuarios = await listUsuarios();
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  },

  create: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post<any>(endpoints.auth.cadastro, data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<any>(endpoints.auth.usuarios.update(id), data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.auth.usuarios.delete(id));
  },

  promote: async (id: number): Promise<void> => {
    await apiClient.put(endpoints.auth.usuarios.promote(id));
  },

  demote: async (id: number): Promise<User> => {
    const response = await apiClient.put<any>(endpoints.auth.usuarios.demote(id));
    return response.data.data || response.data;
  },
};

