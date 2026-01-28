import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assistenciaSocialService } from '../services/assistenciaSocialService';
import type { AssistenciaSocial, PaginatedResponse } from '../../../shared/types';
import { Table } from '../../../shared/ui/Table/Table';
import type { TableColumn } from '../../../shared/ui/Table/Table';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal/ConfirmModal';
import { useUIStore } from '../../../app/stores/uiStore';
import { useAuthStore } from '../../../app/stores/authStore';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { formatDate } from '../../../shared/lib/formatters';
import { Eye, Edit, Trash2, Package, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import './css/ListaAssistenciaSocial.css';

export const ListaAssistenciaSocial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useUIStore();
  const { role, hasPermissao } = useAuthStore();
  const [registros, setRegistros] = useState<AssistenciaSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<AssistenciaSocial> = await assistenciaSocialService.list(
        currentPage,
        itemsPerPage,
        'id',
        'DESC',
        debouncedSearch || undefined
      );
      setRegistros(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao carregar registros de assistência social',
      });
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, showNotification]);

  useEffect(() => {
    if (location.pathname === '/assistencia-social') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, currentPage, itemsPerPage, debouncedSearch]);

  // Reset para primeira página quando o termo de busca muda
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setCurrentPage(0);
    }
  }, [debouncedSearch, searchTerm]);

  const handleDeleteClick = (id: number) => {
    setRegistroToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registroToDelete) return;

    try {
      setDeleting(true);
      await assistenciaSocialService.delete(registroToDelete);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const columns: TableColumn<AssistenciaSocial>[] = [
    {
      field: 'nomeAlimento',
      label: 'Nome do Alimento',
      sortable: true,
    },
    {
      field: 'quantidade',
      label: 'Quantidade',
      sortable: true,
      render: (value) => `${Math.round(Number(value))}`,
    },
    {
      field: 'dataValidade',
      label: 'Data de Validade',
      format: 'date',
      sortable: true,
    },
    {
      field: 'familiaBeneficiada',
      label: 'Família Beneficiada',
      render: (value) => value || '-',
    },
    {
      field: 'quantidadeCestasBasicas',
      label: 'Cestas Básicas',
      render: (value) => value ? `${Number(value).toFixed(2)}` : '-',
    },
    {
      field: 'dataEntregaCesta',
      label: 'Data Entrega',
      format: 'date',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      field: 'dataRegistro',
      label: 'Data de Registro',
      format: 'datetime',
      sortable: true,
    },
  ];

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalElements);

  return (
    <div className="lista-assistencia-social-container">
      <div className="lista-assistencia-social-header">
        <div className="lista-assistencia-social-header-content">
          <h1 className="lista-assistencia-social-title">Assistência Social</h1>
          <p className="lista-assistencia-social-subtitle">Gerenciar registros de assistência social</p>
        </div>
        {(role === 'ADMIN' || hasPermissao('assistencia-social-novo')) && (
          <Button
            onClick={() => navigate('/assistencia-social/novo')}
            icon={<Package className="w-4 h-4" />}
          >
            Novo Registro
          </Button>
        )}
      </div>

      <Card>
        <div className="lista-assistencia-social-search">
          <div className="lista-assistencia-social-search-wrapper">
            <Search className="lista-assistencia-social-search-icon" />
            <Input
              type="text"
              placeholder="Buscar por nome do alimento ou família beneficiada..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="lista-assistencia-social-search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <Table
              columns={columns}
              data={registros}
              actions={(row) => (
                <>
                  {(role === 'ADMIN' || hasPermissao('assistencia-social-detalhes')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/assistencia-social/${row.id}`)}
                      icon={<Eye className="w-4 h-4" />}
                      aria-label="Ver detalhes"
                    >
                      <span className="sr-only">Ver</span>
                    </Button>
                  )}
                  {(role === 'ADMIN' || hasPermissao('assistencia-social-editar')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => navigate(`/assistencia-social/${row.id}/editar`)}
                      icon={<Edit className="w-4 h-4" />}
                      aria-label="Editar registro"
                    >
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  {(role === 'ADMIN' || hasPermissao('assistencia-social-editar')) && (
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleDeleteClick(row.id)}
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
              <div className="lista-assistencia-social-pagination">
                <div className="lista-assistencia-social-pagination-container">
                  <div className="lista-assistencia-social-pagination-items-per-page">
                    <span className="lista-assistencia-social-pagination-items-label">Itens por página:</span>
                    <select
                      value={String(itemsPerPage)}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                      className="lista-assistencia-social-pagination-select"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="lista-assistencia-social-pagination-info">
                    <span className="lista-assistencia-social-pagination-info-text">
                      Mostrando {startIndex + 1} a {endIndex} de {totalElements} registros
                    </span>
                  </div>

                  <div className="lista-assistencia-social-pagination-controls">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Anterior
                    </Button>
                    
                    <div className="lista-assistencia-social-pagination-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber: number;
                        if (totalPages <= 5) {
                          pageNumber = i;
                        } else if (currentPage <= 2) {
                          pageNumber = i;
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 5 + i;
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
                            {pageNumber + 1}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
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

            {registros.length === 0 && !loading && (
              <div className="lista-assistencia-social-empty">
                <p></p>
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
        title="Excluir Registro de Assistência Social"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
