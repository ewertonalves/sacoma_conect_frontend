import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { TelaPermissao, User } from '../../../shared/types';

export const permissaoService = {
  listarTelas: async (): Promise<TelaPermissao[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.permissoes.telas);
      const telas = response.data.data || response.data;
      return Array.isArray(telas) ? telas : [];
    } catch {
      return [];
    }
  },

  listarUsuariosComuns: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.auth.usuarios.list);
      const users = response.data.data || response.data;
      const usuariosArray = Array.isArray(users) ? users : [];
      return usuariosArray.filter((user: User) => user.role === 'USER');
    } catch {
      return [];
    }
  },

  buscarMinhasPermissoes: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.permissoes.minhas);
      
      const permissoes = response.data.data || response.data;
      if (Array.isArray(permissoes)) {
        const permissoesProcessadas = permissoes
          .map((p: any) => {
            if (typeof p === 'string') {
              return p;
            }
            return p?.telaId || p?.id || String(p);
          })
          .filter((p: string) => p && p.trim() !== '');
        return permissoesProcessadas;
      }
      return [];
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      // Adiciona status ao error para que o ProtectedRoute possa verificar
      if (error?.response) {
        error.status = error.response.status;
      }
      throw error;
    }
  },

  buscarPermissoesUsuario: async (usuarioId: number): Promise<string[]> => {
    try {
      const response = await apiClient.get<any>(endpoints.permissoes.usuario(usuarioId));
      const permissoes = response.data.data || response.data;
      if (Array.isArray(permissoes)) {
        const permissoesProcessadas = permissoes
          .map((p: any) => {
            if (typeof p === 'string') {
              return p;
            }
            return p?.telaId || p?.id || String(p);
          })
          .filter((p: string) => p && p.trim() !== '');
        return permissoesProcessadas;
      }
      return [];
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  atualizarPermissoes: async (usuarioId: number, telasPermitidas: string[]): Promise<void> => {
    const response = await apiClient.put<any>(endpoints.permissoes.update(usuarioId), {
      telasPermitidas,
    });
    return response.data;
  },
};
