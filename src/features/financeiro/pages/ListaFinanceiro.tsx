import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { financeiroService } from '../services/financeiroService';
import { membroService } from '../../membros/services/membroService';
import type { Financeiro, Membro } from '../../../shared/types';
import { Table } from '../../../shared/ui/Table/Table';
import type { TableColumn } from '../../../shared/ui/Table/Table';
import { Button } from '../../../shared/ui/Button/Button';
import { Select } from '../../../shared/ui/Select/Select';
import { Input } from '../../../shared/ui/Input/Input';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { Badge } from '../../../shared/ui/Badge/Badge';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal/ConfirmModal';
import { useUIStore } from '../../../app/stores/uiStore';
import { useAuthStore } from '../../../app/stores/authStore';
import { TIPO_FINANCEIRO_LABELS, TIPO_FINANCEIRO_COLORS, TIPOS_FINANCEIRO, TIPO_PERIODO_RELATORIO_LABELS } from '../../../shared/lib/constants';
import { formatCurrency } from '../../../shared/lib/formatters';
import { Eye, Edit, Trash2, DollarSign, ChevronLeft, ChevronRight, Search, X, ChevronDown, FileDown } from 'lucide-react';
import { Modal } from '../../../shared/ui/Modal/Modal';
import { downloadRelatorioPdf } from '../utils/relatorioPdf';
import type { TipoPeriodoRelatorio } from '../../../shared/types';
import './css/ListaFinanceiro.css';

export const ListaFinanceiro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useUIStore();
  const { role, hasPermissao } = useAuthStore();
  const [registros, setRegistros] = useState<Financeiro[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [membroFilter, setMembroFilter] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<{ id: number; tipo: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [membroSearchTerm, setMembroSearchTerm] = useState('');
  const [membroSelectOpen, setMembroSelectOpen] = useState(false);
  const membroSelectRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
  const [relatorioTipoPeriodo, setRelatorioTipoPeriodo] = useState<TipoPeriodoRelatorio>('MENSAL');
  const [relatorioDataInicial, setRelatorioDataInicial] = useState('');
  const [relatorioDataFinal, setRelatorioDataFinal] = useState('');
  const [relatorioLoading, setRelatorioLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const membrosData = await membroService.list();
      setMembros(Array.isArray(membrosData) ? membrosData : []);

      let filtered: Financeiro[] = [];

      if (membroFilter) {
        filtered = await financeiroService.searchByMember(Number(membroFilter));
      } else if (tipoFilter) {
        filtered = await financeiroService.searchByType(tipoFilter);
      } else {
        filtered = await financeiroService.list();
      }

      if (tipoFilter && membroFilter) {
        filtered = Array.isArray(filtered) ? filtered.filter(r => r.tipo === tipoFilter) : [];
      }

      setRegistros(Array.isArray(filtered) ? filtered : []);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao carregar registros financeiros',
      });
      setRegistros([]);
      setMembros([]);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [tipoFilter, membroFilter, showNotification]);

  useEffect(() => {
    if (location.pathname === '/financeiro') {
      isInitialLoadRef.current = true;
      loadData();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isInitialLoadRef.current && location.pathname === '/financeiro') {
      loadData();
    }
  }, [tipoFilter, membroFilter]);

  // Reset para primeira página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoFilter, membroFilter]);

  const handleDeleteClick = (id: number, tipo: string) => {
    setRegistroToDelete({ id, tipo });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;

    try {
      setDeleting(true);
      await financeiroService.delete(registroToDelete.id);
      showNotification({
        type: 'success',
        message: 'Registro excluído com sucesso',
      });
      setDeleteModalOpen(false);
      setRegistroToDelete(null);
      loadData();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao excluir registro',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Cálculo dos totais baseado em todos os registros (não apenas os paginados)
  const totalEntrada = registros.reduce((sum, r) => sum + (r.entrada || 0), 0);
  const totalSaida = registros.reduce((sum, r) => sum + (r.saida || 0), 0);
  const saldoTotal = totalEntrada - totalSaida;

  // Paginação
  const totalPages = Math.ceil(registros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistros = registros.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const columns: TableColumn<Financeiro>[] = [
    { field: 'id', label: 'ID', sortable: true },
    {
      field: 'tipo',
      label: 'Tipo',
      sortable: true,
      render: (value) => (
        <Badge color={TIPO_FINANCEIRO_COLORS[value as string] || 'default'}>
          {TIPO_FINANCEIRO_LABELS[value as string] || value}
        </Badge>
      ),
    },
    {
      field: 'entrada',
      label: 'Entrada',
      format: 'currency',
      sortable: true,
    },
    {
      field: 'saida',
      label: 'Saída',
      format: 'currency',
      sortable: true,
    },
    {
      field: 'saldo',
      label: 'Saldo',
      render: (_, row) => formatCurrency((row.entrada || 0) - (row.saida || 0)),
    },
    {
      field: 'membro',
      label: 'Membro',
      render: (value, row) => {
        if (!value && !row.membro) return '-';
        const membro = value || row.membro;
        return (
          <Link
            to={`/membros/${membro.id}`}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            {membro.nome}
          </Link>
        );
      },
    },
    {
      field: 'observacao',
      label: 'Observação',
      truncate: 50,
    },
    {
      field: 'dataRegistro',
      label: 'Data',
      format: 'datetime',
      sortable: true,
    },
  ];

  const tipoOptions = [
    { value: '', label: 'Todos os tipos' },
    ...Object.entries(TIPOS_FINANCEIRO).map(([key]) => ({
      value: key,
      label: TIPO_FINANCEIRO_LABELS[key],
    })),
  ];

  const membroOptions = [
    { value: '', label: 'Todos os membros' },
    ...membros.map((m) => ({
      value: String(m.id),
      label: m.nome,
    })),
  ];

  // Filtra membros baseado no termo de busca
  const filteredMembroOptions = membroSearchTerm
    ? membroOptions.filter((option) =>
        option.label.toLowerCase().includes(membroSearchTerm.toLowerCase())
      )
    : membroOptions;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (membroSelectRef.current && !membroSelectRef.current.contains(event.target as Node)) {
        setMembroSelectOpen(false);
      }
    };

    if (membroSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [membroSelectOpen]);

  const selectedMembroLabel = membroFilter
    ? membroOptions.find((opt) => opt.value === membroFilter)?.label || 'Todos os membros'
    : 'Todos os membros';

  const handleMembroSelect = (value: string) => {
    setMembroFilter(value);
    setMembroSelectOpen(false);
    setMembroSearchTerm('');
  };

  const handleGerarRelatorioPdf = async () => {
    if (!relatorioDataInicial.trim()) {
      showNotification({ type: 'error', message: 'Informe a data inicial.' });
      return;
    }
    if (relatorioTipoPeriodo === 'PERSONALIZADO' && !relatorioDataFinal.trim()) {
      showNotification({ type: 'error', message: 'Para período personalizado, informe a data final.' });
      return;
    }
    if (relatorioTipoPeriodo === 'PERSONALIZADO' && relatorioDataFinal < relatorioDataInicial) {
      showNotification({ type: 'error', message: 'A data final deve ser igual ou posterior à data inicial.' });
      return;
    }
    try {
      setRelatorioLoading(true);
      const data = await financeiroService.getRelatorio(
        relatorioDataInicial,
        relatorioTipoPeriodo,
        relatorioTipoPeriodo === 'PERSONALIZADO' ? relatorioDataFinal : undefined
      );
      downloadRelatorioPdf(data);
      showNotification({ type: 'success', message: 'Relatório gerado e download iniciado.' });
      setRelatorioModalOpen(false);
      setRelatorioDataInicial('');
      setRelatorioDataFinal('');
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error?.message || 'Erro ao gerar relatório.',
      });
    } finally {
      setRelatorioLoading(false);
    }
  };

  const relatorioPeriodoOptions = (['SEMANAL', 'MENSAL', 'PERSONALIZADO'] as TipoPeriodoRelatorio[]).map((k) => ({
    value: k,
    label: TIPO_PERIODO_RELATORIO_LABELS[k] || k,
  }));

  return (
    <div className="lista-financeiro-container">
      <div className="lista-financeiro-header">
        <div className="lista-financeiro-header-content">
          <h1 className="lista-financeiro-title">Registros Financeiros</h1>
          <p className="lista-financeiro-subtitle">Gerenciar registros financeiros</p>
        </div>
        <div className="lista-financeiro-header-actions">
          <Button
            variant="outline"
            onClick={() => setRelatorioModalOpen(true)}
            icon={<FileDown className="w-4 h-4" />}
          >
            Relatório PDF
          </Button>
          {(role === 'ADMIN' || hasPermissao('financeiro-novo')) && (
            <Button
              onClick={() => navigate('/financeiro/novo')}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Novo Registro
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="lista-financeiro-totals">
          <div className="lista-financeiro-totals-grid">
            <div className="lista-financeiro-total-item">
              <p className="lista-financeiro-total-label">Total de Entradas</p>
              <p className="lista-financeiro-total-value-green">
                {formatCurrency(totalEntrada)}
              </p>
            </div>
            <div className="lista-financeiro-total-item">
              <p className="lista-financeiro-total-label">Total de Saídas</p>
              <p className="lista-financeiro-total-value-red">
                {formatCurrency(totalSaida)}
              </p>
            </div>
            <div className="lista-financeiro-total-item">
              <p className="lista-financeiro-total-label">Saldo Total</p>
              <p className={saldoTotal >= 0 ? 'lista-financeiro-total-value-green' : 'lista-financeiro-total-value-red'}>
                {formatCurrency(saldoTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="lista-financeiro-filters">
          <div className="lista-financeiro-filters-grid">
            <Select
              label="Filtrar por Tipo"
              options={tipoOptions}
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            />
            <div className="lista-financeiro-membro-select-wrapper" ref={membroSelectRef}>
              <label className="lista-financeiro-membro-select-label">
                Filtrar por Membro
              </label>
              <div className="lista-financeiro-membro-select-container">
                <button
                  type="button"
                  onClick={() => setMembroSelectOpen(!membroSelectOpen)}
                  className="lista-financeiro-membro-select-button"
                >
                  <span className={membroFilter ? 'lista-financeiro-membro-select-text' : 'lista-financeiro-membro-select-text-placeholder'}>
                    {selectedMembroLabel}
                  </span>
                  <ChevronDown className={`lista-financeiro-membro-select-icon ${membroSelectOpen ? 'lista-financeiro-membro-select-icon-open' : ''}`} />
                </button>

                {membroSelectOpen && (
                  <div className="lista-financeiro-membro-dropdown">
                    <div className="lista-financeiro-membro-search-container">
                      <div className="lista-financeiro-membro-search-wrapper">
                        <Search className="lista-financeiro-membro-search-icon" />
                        <Input
                          type="text"
                          placeholder="Buscar membro..."
                          value={membroSearchTerm}
                          onChange={(e) => setMembroSearchTerm(e.target.value)}
                          className="pl-8"
                          autoFocus
                        />
                        {membroSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setMembroSearchTerm('')}
                            className="lista-financeiro-membro-search-clear"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="lista-financeiro-membro-options">
                      {filteredMembroOptions.length > 0 ? (
                        filteredMembroOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleMembroSelect(option.value)}
                            className={`lista-financeiro-membro-option ${membroFilter === option.value ? 'lista-financeiro-membro-option-selected' : 'lista-financeiro-membro-option-normal'}`}
                          >
                            {option.label}
                          </button>
                        ))
                      ) : (
                        <div className="lista-financeiro-membro-empty">
                          Nenhum membro encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedRegistros}
              actions={(row) => (
                <>
                  {(role === 'ADMIN' || hasPermissao('financeiro-detalhes')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/financeiro/${row.id}`)}
                      icon={<Eye className="w-4 h-4" />}
                      aria-label="Ver detalhes"
                    >
                      <span className="sr-only">Ver</span>
                    </Button>
                  )}
                  {(role === 'ADMIN' || hasPermissao('financeiro-editar')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/financeiro/${row.id}/editar`)}
                      icon={<Edit className="w-4 h-4" />}
                      aria-label="Editar registro"
                    >
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  {(role === 'ADMIN' || hasPermissao('financeiro-editar')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleDeleteClick(row.id, row.tipo)}
                      icon={<Trash2 className="w-4 h-4" />}
                      aria-label="Excluir registro"
                    >
                      <span className="sr-only">Excluir</span>
                    </Button>
                  )}
                </>
              )}
            />

            {/* Controles de Paginação */}
            {registros.length > 0 && (
              <div className="lista-financeiro-pagination">
                <div className="lista-financeiro-pagination-container">
                  <div className="lista-financeiro-pagination-items-per-page">
                    <span className="lista-financeiro-pagination-items-label">Itens por página:</span>
                    <Select
                      value={String(itemsPerPage)}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                      options={[
                        { value: '5', label: '5' },
                        { value: '10', label: '10' },
                        { value: '20', label: '20' },
                        { value: '50', label: '50' },
                      ]}
                      className="w-20"
                    />
                  </div>

                  <div className="lista-financeiro-pagination-info">
                    <span className="lista-financeiro-pagination-info-text">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, registros.length)} de {registros.length} registros
                    </span>
                  </div>

                  <div className="lista-financeiro-pagination-controls">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Anterior
                    </Button>
                    
                    <div className="lista-financeiro-pagination-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber: number;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? 'primary' : 'outline'}
                            size="small"
                            onClick={() => handlePageChange(pageNumber)}
                            className="min-w-[2.5rem]"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="flex items-center gap-2">
                        Próxima
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRegistroToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Registro Financeiro"
        message={`Tem certeza que deseja excluir este registro financeiro (${TIPO_FINANCEIRO_LABELS[registroToDelete?.tipo as keyof typeof TIPO_FINANCEIRO_LABELS] || registroToDelete?.tipo})? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />

      <Modal
        open={relatorioModalOpen}
        onClose={() => !relatorioLoading && setRelatorioModalOpen(false)}
        title="Gerar relatório em PDF"
        size="medium"
        closable={!relatorioLoading}
        footer={
          <div className="lista-financeiro-relatorio-modal-footer">
            <Button variant="outline" onClick={() => setRelatorioModalOpen(false)} disabled={relatorioLoading}>
              Cancelar
            </Button>
            <Button onClick={handleGerarRelatorioPdf} loading={relatorioLoading} disabled={relatorioLoading} icon={<FileDown className="w-4 h-4" />}>
              Gerar e baixar PDF
            </Button>
          </div>
        }
      >
        <div className="lista-financeiro-relatorio-modal-body">
          <p className="lista-financeiro-relatorio-modal-desc">
            Escolha o período e o tipo do relatório. Os dados serão buscados no servidor e o PDF montado no navegador.
          </p>
          <Select
            label="Tipo de período"
            options={relatorioPeriodoOptions}
            value={relatorioTipoPeriodo}
            onChange={(e) => setRelatorioTipoPeriodo(e.target.value as TipoPeriodoRelatorio)}
          />
          <div className="lista-financeiro-relatorio-dates">
            <div className="lista-financeiro-relatorio-date-field">
              <label className="lista-financeiro-relatorio-label">Data inicial</label>
              <input
                type="date"
                value={relatorioDataInicial}
                onChange={(e) => setRelatorioDataInicial(e.target.value)}
                className="lista-financeiro-relatorio-input"
              />
            </div>
            {relatorioTipoPeriodo === 'PERSONALIZADO' && (
              <div className="lista-financeiro-relatorio-date-field">
                <label className="lista-financeiro-relatorio-label">Data final</label>
                <input
                  type="date"
                  value={relatorioDataFinal}
                  onChange={(e) => setRelatorioDataFinal(e.target.value)}
                  className="lista-financeiro-relatorio-input"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

