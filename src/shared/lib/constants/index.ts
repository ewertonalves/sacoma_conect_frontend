export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const TIPOS_MOVIMENTACAO_FINANCEIRA = {
  ENTRADA: 'ENTRADA',
  SAIDA: 'SAIDA',
} as const;

export const TIPO_MOVIMENTACAO_FINANCEIRA_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
};

export const TIPO_MOVIMENTACAO_FINANCEIRA_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  ENTRADA: 'success',
  SAIDA: 'error',
};

/** Rótulos amigáveis para CategoriaFinanceira (aba Código Financeiro). */
export const CATEGORIA_FINANCEIRA_LABELS: Record<string, string> = {
  DIZIMO: 'Dízimo',
  OFERTA: 'Oferta',
  OFERTA_MISSIONARIA: 'Oferta missionária',
  OFERTA_ESPECIAL: 'Oferta especial',
  DOACAO: 'Doação',
  CONTRIBUICAO: 'Contribuição',
  OUTRAS_ENTRADAS: 'Outras entradas',
  AGUA: 'Água',
  LUZ: 'Luz',
  ALUGUEL: 'Aluguel',
  MANUTENCAO: 'Manutenção',
  LIMPEZA: 'Limpeza',
  MATERIAL: 'Material',
  AJUDA_SOCIAL: 'Ajuda social',
  TRANSPORTE: 'Transporte',
  EVENTOS: 'Eventos',
  OFERTA_SEDE: 'Oferta para sede',
  OUTRAS_SAIDAS: 'Outras saídas',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
};

export const ROLE_COLORS: Record<string, 'error' | 'default'> = {
  ADMIN: 'error',
  USER: 'default',
};

export const PAGE_SIZES = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 10;

export const TIPO_PERIODO_RELATORIO_LABELS: Record<string, string> = {
  SEMANAL: 'Semanal',
  MENSAL: 'Mensal',
  PERSONALIZADO: 'Período',
};
