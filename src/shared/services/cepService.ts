import apiClient from '../api/client';
import { endpoints } from '../api/endpoints';

export interface CepResponse {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
}

export const cepService = {
  buscar: async (cep: string): Promise<CepResponse> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    try {
      const response = await apiClient.get<any>(endpoints.cep.buscar(cleanCep));
      
      console.log('CEP Response:', response.data);
      
      const data = response.data?.data ?? response.data;
      if (data && (data.cep || data.logradouro)) {
        return data;
      }
      
      throw new Error('CEP não encontrado - resposta inválida');
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error);
      
      if (error.response?.status === 404) {
        throw new Error('CEP não encontrado');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Erro ao buscar CEP');
    }
  },
};

