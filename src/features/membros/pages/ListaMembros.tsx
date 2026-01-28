import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { membroService } from '../services/membroService';
import type { Membro } from '../../../shared/types';
import { Table } from '../../../shared/ui/Table/Table';
import type { TableColumn } from '../../../shared/ui/Table/Table';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal/ConfirmModal';
import { useUIStore } from '../../../app/stores/uiStore';
import { useAuthStore } from '../../../app/stores/authStore';
import { formatCPF } from '../../../shared/lib/formatters';
import { Eye, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '../../../shared/ui/Select/Select';
import './css/ListaMembros.css';

export const ListaMembros = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useUIStore();
  const { role, hasPermissao } = useAuthStore();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [membroToDelete, setMembroToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cacheRef = useRef<Map<string, Membro[]>>(new Map());
  const isInitialLoadRef = useRef(true);
  const membrosLengthRef = useRef(0);

  const loadMembros = useCallback(async (search: string = '') => {
    const cacheKey = search.trim().toLowerCase();
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      if (cachedData) {
        setMembros(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      if (isInitialLoadRef.current || membrosLengthRef.current === 0) {
        setLoading(true);
      }

      const data = search.trim()
        ? await membroService.searchByName(search.trim())
        : await membroService.list();

      const membrosArray = Array.isArray(data) ? data : [];
      setMembros(membrosArray);
      membrosLengthRef.current = membrosArray.length;

      if (cacheKey && membrosArray.length > 0) {
        cacheRef.current.set(cacheKey, membrosArray);
        if (cacheRef.current.size > 10) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) {
            cacheRef.current.delete(firstKey);
          }
        }
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao carregar membros',
      });
      setMembros([]);
      membrosLengthRef.current = 0;
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [showNotification]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    loadMembros('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        loadMembros('');
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const debounceTime = searchTerm.length < 3 ? 300 : 500;
    
    const timeoutId = setTimeout(() => {
      loadMembros(searchTerm);
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadMembros]);

  const handleDeleteClick = useCallback((id: number, nome: string) => {
    setMembroToDelete({ id, nome });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!membroToDelete) return;

    try {
      setDeleting(true);
      await membroService.delete(membroToDelete.id);
      showNotification({
        type: 'success',
        message: 'Membro excluído com sucesso',
      });
      setDeleteModalOpen(false);
      setMembroToDelete(null);
      cacheRef.current.clear();
      await loadMembros(searchTerm);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao excluir membro',
      });
    } finally {
      setDeleting(false);
    }
  }, [membroToDelete, showNotification, loadMembros, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(membros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembros = membros.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const columns: TableColumn<Membro>[] = [
    { field: 'nome', label: 'Nome', sortable: true },
    {
      field: 'cpf',
      label: 'CPF',
      render: (value) => formatCPF(value),
    },
    { field: 'ri', label: 'RI' },
    { field: 'cargo', label: 'Cargo' },
  ];

  return (
    <div className="lista-membros-container">
      <div className="lista-membros-header">
        <div className="lista-membros-header-content">
          <h1 className="lista-membros-title">Membros</h1>
          <p className="lista-membros-subtitle">Gerenciar membros cadastrados</p>
        </div>
        {(role === 'ADMIN' || hasPermissao('membros-novo')) && (
          <Button
            onClick={() => navigate('/membros/novo')}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Novo Membro
          </Button>
        )}
      </div>

      <Card>
        <div className="lista-membros-search">
          <Input
            placeholder="Digite o nome do membro"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {paginatedMembros.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum membro encontrado</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedMembros}
                actions={(row) => (
                  <>
                    {(role === 'ADMIN' || hasPermissao('membros-detalhes')) && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/membros/${row.id}`)}
                        icon={<Eye className="w-4 h-4" />}
                        aria-label="Ver detalhes"
                      >
                        <span className="sr-only">Ver</span>
                      </Button>
                    )}
                    {(role === 'ADMIN' || hasPermissao('membros-editar')) && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/membros/${row.id}/editar`)}
                        icon={<Edit className="w-4 h-4" />}
                        aria-label="Editar membro"
                      >
                        <span className="sr-only">Editar</span>
                      </Button>
                    )}
                    {(role === 'ADMIN' || hasPermissao('membros-editar')) && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteClick(row.id, row.nome)}
                        icon={<Trash2 className="w-4 h-4" />}
                        aria-label="Excluir membro"
                      >
                        <span className="sr-only">Excluir</span>
                      </Button>
                    )}
                  </>
                )}
              />
            )}

            {membros.length > 0 && (
              <div className="lista-membros-pagination">
                <div className="lista-membros-pagination-container">
                  <div className="lista-membros-pagination-items-per-page">
                    <span className="lista-membros-pagination-items-label">Itens por página:</span>
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

                  <div className="lista-membros-pagination-info">
                    <span className="lista-membros-pagination-info-text">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, membros.length)} de {membros.length} registros
                    </span>
                  </div>

                  <div className="lista-membros-pagination-controls">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Anterior
                    </Button>
                    
                    <div className="lista-membros-pagination-numbers">
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
          setMembroToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Membro"
        message={`Tem certeza que deseja excluir o membro "${membroToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
