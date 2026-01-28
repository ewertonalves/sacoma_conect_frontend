import apiClient from '../../../shared/api/client';
import { endpoints } from '../../../shared/api/endpoints';
import type { LoginRequest, LoginResponse } from '../../../shared/types';
import { permissaoService } from '../../permissoes/services/permissaoService';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse & { permissoes?: string[] }> => {
    const response = await apiClient.post<any>(endpoints.auth.login, data);
    const responseData = response.data.data || response.data;

    if (!responseData || !responseData.token) {
      throw new Error('Resposta inválida do servidor. Token não encontrado.');
    }

    if (!responseData.role) {
      throw new Error('Role não encontrado na resposta do servidor');
    }

    const userId = responseData.usuarioId || responseData.id;
    const userRole = responseData.role;
    const token = responseData.token;

    localStorage.setItem('auth_token', token);

    let permissoes: string[] = [];
    if (userRole === 'USER') {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        permissoes = await permissaoService.buscarMinhasPermissoes();
      } catch (error: any) {
        permissoes = [];
      }
    }

    const loginResponse: LoginResponse & { permissoes?: string[] } = {
      token,
      user: {
        id: userId,
        nome: responseData.nome,
        email: responseData.email,
        role: userRole,
        dataCriacao: responseData.dataCriacao || new Date().toISOString(),
      },
      permissoes,
    };

    return loginResponse;
  },
};
