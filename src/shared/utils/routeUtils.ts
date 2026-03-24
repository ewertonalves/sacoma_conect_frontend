/**
 * Utilitários para gerenciamento de rotas baseado em permissões
 */

/**
 * Mapeamento de telaId para rota principal
 */
const rotasPorPermissao: Record<string, string> = {
  'dashboard': '/dashboard',
  'membros': '/membros',
  'membros-novo': '/membros',
  'membros-editar': '/membros',
  'membros-detalhes': '/membros',
  'financeiro': '/financeiro',
  'financeiro-novo': '/financeiro',
  'financeiro-editar': '/financeiro',
  'financeiro-detalhes': '/financeiro',
  'financeiro-relatorio-pdf': '/financeiro',
  'assistencia-social': '/assistencia-social',
  'assistencia-social-novo': '/assistencia-social',
  'assistencia-social-editar': '/assistencia-social',
  'assistencia-social-detalhes': '/assistencia-social',
};

/**
 * Prioridade de rotas (ordem de preferência para redirecionamento)
 */
const prioridadeRotas = ['dashboard', 'membros', 'financeiro', 'assistencia-social'];

/**
 * Encontra a primeira rota permitida baseado nas permissões do usuário
 * @param permissoes Array de IDs das telas permitidas
 * @returns Rota da primeira tela permitida ou null se não houver permissões
 */
export const getPrimeiraRotaPermitida = (permissoes: string[]): string | null => {
  if (!permissoes || permissoes.length === 0) {
    return null;
  }
  
  // Tenta encontrar pela prioridade
  for (const telaIdPrioridade of prioridadeRotas) {
    if (permissoes.includes(telaIdPrioridade)) {
      return rotasPorPermissao[telaIdPrioridade] || null;
    }
  }
  
  // Se não encontrou pela prioridade, retorna a primeira rota disponível
  for (const telaId of permissoes) {
    if (rotasPorPermissao[telaId]) {
      return rotasPorPermissao[telaId];
    }
  }
  
  return null;
};

/**
 * Verifica se o usuário tem permissão para acessar uma tela específica
 * @param telaId ID da tela a verificar
 * @param permissoes Array de IDs das telas permitidas
 * @param role Role do usuário (ADMIN tem acesso a tudo)
 * @returns true se o usuário tem permissão
 */
export const temPermissaoParaTela = (telaId: string, permissoes: string[], role?: string): boolean => {
  if (role === 'ADMIN') {
    return true;
  }
  return permissoes.includes(telaId);
};
