import { useEffect, useState, useRef } from 'react';
import { permissaoService } from '../services/permissaoService';
import type { User, TelaPermissao } from '../../../shared/types';
import { Card } from '../../../shared/ui/Card/Card';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { useUIStore } from '../../../app/stores/uiStore';
import { Check, X, Save, Search, ChevronDown } from 'lucide-react';
import './css/GerenciarPermissoes.css';

// Lista de telas disponíveis no sistema
const TELAS_DISPONIVEIS: TelaPermissao[] = [
  { id: 'dashboard', nome: 'Dashboard', rota: '/dashboard', descricao: 'Página inicial do sistema' },
  { id: 'membros', nome: 'Membros', rota: '/membros', descricao: 'Lista de membros' },
  { id: 'membros-novo', nome: 'Cadastrar Membro', rota: '/membros/novo', descricao: 'Cadastrar novo membro' },
  { id: 'membros-editar', nome: 'Editar Membro', rota: '/membros/:id/editar', descricao: 'Editar membro existente' },
  { id: 'membros-detalhes', nome: 'Detalhes do Membro', rota: '/membros/:id', descricao: 'Ver detalhes do membro' },
  { id: 'financeiro', nome: 'Financeiro', rota: '/financeiro', descricao: 'Lista de registros financeiros' },
  { id: 'financeiro-novo', nome: 'Cadastrar Financeiro', rota: '/financeiro/novo', descricao: 'Cadastrar novo registro financeiro' },
  { id: 'financeiro-editar', nome: 'Editar Financeiro', rota: '/financeiro/:id/editar', descricao: 'Editar registro financeiro' },
  { id: 'financeiro-detalhes', nome: 'Detalhes do Financeiro', rota: '/financeiro/:id', descricao: 'Ver detalhes do registro financeiro' },
  { id: 'assistencia-social', nome: 'Assistência Social', rota: '/assistencia-social', descricao: 'Lista de registros de assistência social' },
  { id: 'assistencia-social-novo', nome: 'Cadastrar Assistência Social', rota: '/assistencia-social/novo', descricao: 'Cadastrar novo registro de assistência social' },
  { id: 'assistencia-social-editar', nome: 'Editar Assistência Social', rota: '/assistencia-social/:id/editar', descricao: 'Editar registro de assistência social' },
  { id: 'assistencia-social-detalhes', nome: 'Detalhes da Assistência Social', rota: '/assistencia-social/:id', descricao: 'Ver detalhes do registro de assistência social' },
];

// Interface para agrupar telas por contexto
interface TelaContexto {
  contexto: string;
  telas: TelaPermissao[];
}

// Função para agrupar telas por contexto
const agruparTelasPorContexto = (telas: TelaPermissao[]): TelaContexto[] => {
  const grupos: Record<string, TelaPermissao[]> = {};
  
  telas.forEach((tela) => {
    // Extrai o contexto do ID da tela (ex: 'financeiro' de 'financeiro-novo')
    // Se não tiver hífen, usa o próprio ID como contexto
    const partes = tela.id.split('-');
    const contexto = partes[0];
    
    // Mapeia contextos para nomes mais amigáveis
    const nomeContextoMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'membros': 'Membros',
      'financeiro': 'Financeiro',
      'assistencia-social': 'Assistência Social',
    };
    
    const nomeContexto = nomeContextoMap[contexto] || contexto.charAt(0).toUpperCase() + contexto.slice(1);
    
    if (!grupos[nomeContexto]) {
      grupos[nomeContexto] = [];
    }
    grupos[nomeContexto].push(tela);
  });
  
  // Ordena os grupos por nome
  return Object.entries(grupos)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([contexto, telas]) => ({
      contexto,
      telas,
    }));
};

export const GerenciarPermissoes = () => {
  const { showNotification } = useUIStore();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [telas, setTelas] = useState<TelaPermissao[]>(TELAS_DISPONIVEIS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<number, string[]>>({});
  const [permissoesTemporarias, setPermissoesTemporarias] = useState<Record<number, string[]>>({});
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [usuarioSelectOpen, setUsuarioSelectOpen] = useState(false);
  const usuarioSelectRef = useRef<HTMLDivElement>(null);
  const [accordionAberto, setAccordionAberto] = useState<Record<string, boolean>>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [usuariosData, telasData] = await Promise.all([
        permissaoService.listarUsuariosComuns(),
        permissaoService.listarTelas(),
      ]);

      setUsuarios(usuariosData);
      
      // Se o backend retornar telas, usa elas, senão usa as telas hardcoded
      if (telasData.length > 0) {
        setTelas(telasData);
      }

      // Carrega permissões de cada usuário
      const permissoes: Record<number, string[]> = {};
      for (const usuario of usuariosData) {
        const permissoesUsuario = await permissaoService.buscarPermissoesUsuario(usuario.id);
        permissoes[usuario.id] = permissoesUsuario;
      }
      setPermissoesUsuario(permissoes);
      setPermissoesTemporarias(permissoes);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao carregar dados',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermissao = (usuarioId: number, telaId: string) => {
    setPermissoesTemporarias((prev) => {
      const permissoesAtuais = prev[usuarioId] || [];
      const novasPermissoes = permissoesAtuais.includes(telaId)
        ? permissoesAtuais.filter((id) => id !== telaId)
        : [...permissoesAtuais, telaId];
      
      return {
        ...prev,
        [usuarioId]: novasPermissoes,
      };
    });
  };

  const handleSalvarPermissoes = async (usuarioId: number) => {
    try {
      setSaving((prev) => ({ ...prev, [usuarioId]: true }));
      const telasPermitidas = permissoesTemporarias[usuarioId] || [];
      
      await permissaoService.atualizarPermissoes(usuarioId, telasPermitidas);
      
      setPermissoesUsuario((prev) => ({
        ...prev,
        [usuarioId]: telasPermitidas,
      }));

      showNotification({
        type: 'success',
        message: 'Permissões atualizadas com sucesso',
      });
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao salvar permissões',
      });
    } finally {
      setSaving((prev) => ({ ...prev, [usuarioId]: false }));
    }
  };

  const handleCancelarAlteracoes = (usuarioId: number) => {
    setPermissoesTemporarias((prev) => ({
      ...prev,
      [usuarioId]: permissoesUsuario[usuarioId] || [],
    }));
  };

  const temAlteracoesPendentes = (usuarioId: number): boolean => {
    const permissoesAtuais = permissoesUsuario[usuarioId] || [];
    const permissoesTemporariasUsuario = permissoesTemporarias[usuarioId] || [];
    
    if (permissoesAtuais.length !== permissoesTemporariasUsuario.length) {
      return true;
    }
    
    return !permissoesAtuais.every((id) => permissoesTemporariasUsuario.includes(id));
  };

  const usuarioSelecionadoData = usuarioSelecionado 
    ? usuarios.find((u) => u.id === usuarioSelecionado)
    : null;

  // Opções de usuários para o select
  const usuarioOptions = usuarios.map((usuario) => ({
    value: String(usuario.id),
    label: `${usuario.nome} (${usuario.email})`,
    nome: usuario.nome,
    email: usuario.email,
  }));

  // Filtra usuários baseado no termo de busca
  const filteredUsuarioOptions = usuarioSearchTerm
    ? usuarioOptions.filter((option) =>
        option.nome.toLowerCase().includes(usuarioSearchTerm.toLowerCase()) ||
        option.email.toLowerCase().includes(usuarioSearchTerm.toLowerCase())
      )
    : usuarioOptions;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usuarioSelectRef.current && !usuarioSelectRef.current.contains(event.target as Node)) {
        setUsuarioSelectOpen(false);
      }
    };

    if (usuarioSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [usuarioSelectOpen]);

  const selectedUsuarioLabel = usuarioSelecionado
    ? usuarioOptions.find((opt) => opt.value === String(usuarioSelecionado))?.label || 'Escolha um usuário'
    : 'Escolha um usuário';

  const handleUsuarioSelect = (value: string) => {
    const userId = value ? Number(value) : null;
    setUsuarioSelecionado(userId);
    setUsuarioSelectOpen(false);
    setUsuarioSearchTerm('');
  };

  const toggleAccordion = (contexto: string) => {
    setAccordionAberto((prev) => ({
      ...prev,
      [contexto]: !prev[contexto],
    }));
  };

  // Agrupa telas por contexto
  const telasAgrupadas = agruparTelasPorContexto(telas);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="gerenciar-permissoes-container">
      <div className="gerenciar-permissoes-header">
        <div>
          <h1 className="gerenciar-permissoes-title">Gerenciar Permissões de Acesso</h1>
          <p className="gerenciar-permissoes-subtitle">
            Configure quais telas cada usuário comum pode acessar
          </p>
        </div>
      </div>

      <Card>
        <div className="gerenciar-permissoes-content">
          <div className="gerenciar-permissoes-usuario-select" ref={usuarioSelectRef}>
            <label className="gerenciar-permissoes-usuario-select-label">
              Selecione o usuário
            </label>
            <div className="gerenciar-permissoes-usuario-select-container">
              <button
                type="button"
                onClick={() => setUsuarioSelectOpen(!usuarioSelectOpen)}
                className="gerenciar-permissoes-usuario-select-button"
              >
                <span className={usuarioSelecionado ? 'gerenciar-permissoes-usuario-select-text' : 'gerenciar-permissoes-usuario-select-text-placeholder'}>
                  {selectedUsuarioLabel}
                </span>
                <ChevronDown className={`gerenciar-permissoes-usuario-select-icon ${usuarioSelectOpen ? 'gerenciar-permissoes-usuario-select-icon-open' : ''}`} />
              </button>

              {usuarioSelectOpen && (
                <div className="gerenciar-permissoes-usuario-dropdown">
                  <div className="gerenciar-permissoes-usuario-search-container">
                    <div className="gerenciar-permissoes-usuario-search-wrapper">
                      <Search className="gerenciar-permissoes-usuario-search-icon" />
                      <Input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={usuarioSearchTerm}
                        onChange={(e) => setUsuarioSearchTerm(e.target.value)}
                        className="pl-8"
                        autoFocus
                      />
                      {usuarioSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setUsuarioSearchTerm('')}
                          className="gerenciar-permissoes-usuario-search-clear"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="gerenciar-permissoes-usuario-options">
                    {filteredUsuarioOptions.length > 0 ? (
                      filteredUsuarioOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleUsuarioSelect(option.value)}
                          className={`gerenciar-permissoes-usuario-option ${usuarioSelecionado === Number(option.value) ? 'gerenciar-permissoes-usuario-option-selected' : 'gerenciar-permissoes-usuario-option-normal'}`}
                        >
                          {option.label}
                        </button>
                      ))
                    ) : (
                      <div className="gerenciar-permissoes-usuario-empty">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {usuarioSelecionadoData && (
            <div className="gerenciar-permissoes-telas">
              <div className="gerenciar-permissoes-usuario-info">
                <h3 className="gerenciar-permissoes-usuario-nome">
                  {usuarioSelecionadoData.nome}
                </h3>
                <p className="gerenciar-permissoes-usuario-email">
                  {usuarioSelecionadoData.email}
                </p>
              </div>

              <div className="gerenciar-permissoes-telas-list">
                <h4 className="gerenciar-permissoes-telas-title">
                  Telas Disponíveis
                </h4>
                <div className="gerenciar-permissoes-accordion">
                  {telasAgrupadas.map((grupo) => {
                    const isAberto = accordionAberto[grupo.contexto] ?? false;
                    return (
                      <div key={grupo.contexto} className="gerenciar-permissoes-accordion-item">
                        <button
                          type="button"
                          className={`gerenciar-permissoes-accordion-button ${isAberto ? 'active' : ''}`}
                          onClick={() => toggleAccordion(grupo.contexto)}
                        >
                          <span className="gerenciar-permissoes-accordion-title">{grupo.contexto}</span>
                          <ChevronDown className={`gerenciar-permissoes-accordion-icon ${isAberto ? 'gerenciar-permissoes-accordion-icon-open' : ''}`} />
                        </button>
                        <div 
                          className={`gerenciar-permissoes-accordion-panel ${isAberto ? 'gerenciar-permissoes-accordion-panel-open' : ''}`}
                        >
                          <div className="gerenciar-permissoes-telas-grid">
                            {grupo.telas.map((tela) => {
                              const temPermissao = usuarioSelecionado !== null 
                                ? (permissoesTemporarias[usuarioSelecionado] || []).includes(tela.id)
                                : false;
                              return (
                                <div
                                  key={tela.id}
                                  className={`gerenciar-permissoes-tela-item ${temPermissao ? 'permitida' : ''}`}
                                  onClick={() => usuarioSelecionado !== null && handleTogglePermissao(usuarioSelecionado, tela.id)}
                                >
                                  <div className="gerenciar-permissoes-tela-checkbox">
                                    {temPermissao ? (
                                      <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <X className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="gerenciar-permissoes-tela-content">
                                    <div className="gerenciar-permissoes-tela-nome">{tela.nome}</div>
                                    {tela.descricao && (
                                      <div className="gerenciar-permissoes-tela-descricao">
                                        {tela.descricao}
                                      </div>
                                    )}
                                    <div className="gerenciar-permissoes-tela-rota">{tela.rota}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {usuarioSelecionado !== null && temAlteracoesPendentes(usuarioSelecionado) && (
                <div className="gerenciar-permissoes-actions">
                  <Button
                    variant="outline"
                    onClick={() => usuarioSelecionado !== null && handleCancelarAlteracoes(usuarioSelecionado)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => usuarioSelecionado !== null && handleSalvarPermissoes(usuarioSelecionado)}
                    loading={usuarioSelecionado !== null ? saving[usuarioSelecionado] : false}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Salvar Permissões
                  </Button>
                </div>
              )}
            </div>
          )}

          {usuarios.length === 0 && (
            <div className="gerenciar-permissoes-empty">
              <p>Nenhum usuário comum encontrado no sistema.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
