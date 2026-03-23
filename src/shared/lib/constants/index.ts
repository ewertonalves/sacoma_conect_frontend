export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const TIPOS_FINANCEIRO = {
  DIZIMO: 'DIZIMO',
  DESPESAS: 'DESPESAS',
  REFORMAS: 'REFORMAS',
  OFERTAS: 'OFERTAS',
} as const;

export const TIPO_FINANCEIRO_LABELS: Record<string, string> = {
  DIZIMO: 'Dízimo',
  DESPESAS: 'Despesas',
  REFORMAS: 'Reformas',
  OFERTAS: 'Ofertas',
};

export const TIPO_FINANCEIRO_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  DIZIMO: 'success',
  DESPESAS: 'error',
  REFORMAS: 'warning',
  OFERTAS: 'info',
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

