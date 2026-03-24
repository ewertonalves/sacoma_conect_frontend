export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: Role;
  dataCriacao: string;
}

export interface Endereco {
  id?: number;
  rua: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
}

export interface Membro {
  id: number;
  nome?: string | null;
  cpf?: string | null;
  rg?: string | null;
  ri?: string | null;
  cargo?: string | null;
  endereco?: Endereco | null;
}

export type TipoFinanceiro = 'DIZIMO' | 'DESPESAS' | 'REFORMAS' | 'OFERTAS';

export type TipoPeriodoRelatorio = 'SEMANAL' | 'MENSAL' | 'PERSONALIZADO';

export interface MembroFinanceiroResponse {
  id: number;
  nome: string;
  cpf: string;
}

export interface Financeiro {
  id: number;
  tipo: TipoFinanceiro;
  entrada: number;
  saida: number;
  saldo?: number;
  membro?: Membro | MembroFinanceiroResponse;
  membroId?: number;
  observacao?: string;
  dataRegistro: string;
}

export interface RelatorioFinanceiroResponse {
  dataInicial: string;
  dataFinal: string;
  tipoPeriodo: TipoPeriodoRelatorio;
  itens: Financeiro[];
  totalEntrada: number;
  totalSaida: number;
  saldo: number;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TelaPermissao {
  id: string;
  nome: string;
  rota: string;
  descricao?: string;
}

export interface UsuarioPermissao {
  usuarioId: number;
  telasPermitidas: string[];
}

export interface PermissaoUsuario {
  id: number;
  usuarioId: number;
  telaId: string;
  usuario?: User;
  tela?: TelaPermissao;
}

export interface AssistenciaSocial {
  id: number;
  nomeAlimento: string;
  quantidade: number;
  dataValidade: string;
  familiaBeneficiada?: string;
  quantidadeCestasBasicas?: number;
  dataEntregaCesta?: string;
  dataRegistro: string;
}
