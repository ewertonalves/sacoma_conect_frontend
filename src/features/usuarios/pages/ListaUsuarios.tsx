import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usuarioService } from '../services/usuarioService';
import type { User } from '../../../shared/types';
import { Table } from '../../../shared/ui/Table/Table';
import type { TableColumn } from '../../../shared/ui/Table/Table';
import { Button } from '../../../shared/ui/Button/Button';
import { Input } from '../../../shared/ui/Input/Input';
import { Badge } from '../../../shared/ui/Badge/Badge';
import { Card } from '../../../shared/ui/Card/Card';
import { Loading } from '../../../shared/ui/Loading/Loading';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal/ConfirmModal';
import { useUIStore } from '../../../app/stores/uiStore';
import { ROLE_LABELS, ROLE_COLORS } from '../../../shared/lib/constants';
import { Edit, Trash2, UserPlus, Shield, UserMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../../app/stores/authStore';
import { Select } from '../../../shared/ui/Select/Select';
import './css/ListaUsuarios.css';

export const ListaUsuarios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useUIStore();
  const { user: currentUser, updateUser } = useAuthStore();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalOpen, setDemoteModalOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<{ id: number; nome: string } | null>(null);
  const [usuarioToPromote, setUsuarioToPromote] = useState<{ id: number; nome: string } | null>(null);
  const [usuarioToDemote, setUsuarioToDemote] = useState<{ id: number; nome: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const cacheRef = useRef<Map<string, User[]>>(new Map());
  const isInitialLoadRef = useRef(true);

  const loadUsuarios = useCallback(async (search: string = '') => {
    const cacheKey = search.trim().toLowerCase();
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      if (cachedData) {
        setUsuarios(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      if (isInitialLoadRef.current || usuarios.length === 0) {
        setLoading(true);
      }

      const data = search.trim()
        ? await usuarioService.search(search.trim())
        : await usuarioService.list();

      const usuariosArray = Array.isArray(data) ? data : [];
      setUsuarios(usuariosArray);

      if (cacheKey && usuariosArray.length > 0) {
        cacheRef.current.set(cacheKey, usuariosArray);
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
        message: error.message || 'Erro ao carregar usuários',
      });
      setUsuarios([]);
    } finally {
      setLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [showNotification, usuarios.length]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    loadUsuarios('');
  }, [location.pathname]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        loadUsuarios('');
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    const debounceTime = searchTerm.length < 3 ? 300 : 500;
    
    const timeoutId = setTimeout(() => {
      loadUsuarios(searchTerm);
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadUsuarios]);

  const handleDeleteClick = useCallback((id: number, nome: string) => {
    setUsuarioToDelete({ id, nome });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!usuarioToDelete) return;

    try {
      setDeleting(true);
      await usuarioService.delete(usuarioToDelete.id);
      showNotification({
        type: 'success',
        message: 'Usuário excluído com sucesso',
      });
      setDeleteModalOpen(false);
      setUsuarioToDelete(null);
      cacheRef.current.clear();
      await loadUsuarios(searchTerm);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao excluir usuário',
      });
    } finally {
      setDeleting(false);
    }
  }, [usuarioToDelete, showNotification, loadUsuarios, searchTerm]);

  const handlePromoteClick = useCallback((id: number, nome: string) => {
    setUsuarioToPromote({ id, nome });
    setPromoteModalOpen(true);
  }, []);

  const handlePromoteConfirm = useCallback(async () => {
    if (!usuarioToPromote) return;

    try {
      setPromoting(true);
      await usuarioService.promote(usuarioToPromote.id);
      
      // Se o usuário promovido for o usuário logado, atualiza o store
      if (currentUser && currentUser.id === usuarioToPromote.id) {
        const updatedUser = await usuarioService.get(usuarioToPromote.id);
        updateUser({ ...updatedUser, role: 'ADMIN' });
      }
      
      showNotification({
        type: 'success',
        message: 'Usuário promovido com sucesso. Todas as permissões anteriores foram removidas.',
      });
      setPromoteModalOpen(false);
      setUsuarioToPromote(null);
      cacheRef.current.clear();
      await loadUsuarios(searchTerm);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao promover usuário',
      });
    } finally {
      setPromoting(false);
    }
  }, [usuarioToPromote, currentUser, updateUser, showNotification, loadUsuarios, searchTerm]);

  const handleDemoteClick = useCallback((id: number, nome: string) => {
    setUsuarioToDemote({ id, nome });
    setDemoteModalOpen(true);
  }, []);

  const handleDemoteConfirm = useCallback(async () => {
    if (!usuarioToDemote) return;

    try {
      setDemoting(true);
      await usuarioService.demote(usuarioToDemote.id);
      showNotification({
        type: 'success',
        message: 'Administrador rebaixado a usuário comum com sucesso',
      });
      setDemoteModalOpen(false);
      setUsuarioToDemote(null);
      cacheRef.current.clear();
      await loadUsuarios(searchTerm);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Erro ao rebaixar administrador',
      });
    } finally {
      setDemoting(false);
    }
  }, [usuarioToDemote, showNotification, loadUsuarios, searchTerm]);

  const isAdminMaster = useCallback((usuario: User): boolean => {
    return usuario.nome.toLowerCase().includes('administrador master') || 
           (usuario.email.toLowerCase().includes('admin') && usuario.role === 'ADMIN' && usuario.id === 1);
  }, []);

  const isCurrentUserAdminMaster = useCallback((): boolean => {
    if (!currentUser) return false;
    return isAdminMaster(currentUser);
  }, [currentUser, isAdminMaster]);

  const columns: TableColumn<User>[] = useMemo(() => [
    { field: 'id', label: 'ID', sortable: true },
    { field: 'nome', label: 'Nome', sortable: true },
    { field: 'email', label: 'Email', sortable: true },
    {
      field: 'role',
      label: 'Perfil',
      sortable: true,
      render: (value) => (
        <Badge color={ROLE_COLORS[value as string] || 'default'}>
          {ROLE_LABELS[value as string] || value}
        </Badge>
      ),
    },
    {
      field: 'dataCriacao',
      label: 'Data de Cadastro',
      sortable: true,
      format: 'date',
    },
  ], []);

  // Paginação
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsuarios = usuarios.slice(startIndex, endIndex);

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

  const renderActions = useCallback((row: User) => {
    const isMaster = isAdminMaster(row);
    const isCurrentUserMaster = isCurrentUserAdminMaster();
    const isCurrentUserAdmin = currentUser?.role === 'ADMIN' && !isCurrentUserMaster;
    const isOwnUser = currentUser?.id === row.id;
    const demoteDisabled = isCurrentUserAdmin;
    const deleteDisabled = isCurrentUserAdmin && isOwnUser;
    const showDemoteButton = row.role === 'ADMIN' && !isMaster;
    
    return (
      <>
        {!isMaster && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate(`/usuarios/${row.id}/editar`)}
            icon={<Edit className="w-4 h-4" />}
            aria-label="Editar usuário"
          >
            <span className="sr-only">Editar</span>
          </Button>
        )}
        {row.role === 'USER' && !isMaster && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => handlePromoteClick(row.id, row.nome)}
            icon={<Shield className="w-4 h-4" />}
            aria-label="Promover a admin"
          >
            <span className="sr-only">Promover</span>
          </Button>
        )}
        {showDemoteButton && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => handleDemoteClick(row.id, row.nome)}
            icon={<UserMinus className="w-4 h-4" />}
            aria-label="Rebaixar a usuário comum"
            disabled={demoteDisabled}
            title={demoteDisabled ? 'Você não tem permissão para rebaixar administradores' : ''}
          >
            <span className="sr-only">Rebaixar</span>
          </Button>
        )}
        {!isMaster && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => handleDeleteClick(row.id, row.nome)}
            icon={<Trash2 className="w-4 h-4" />}
            aria-label="Excluir usuário"
            disabled={deleteDisabled}
            title={deleteDisabled ? 'Você não pode excluir seu próprio usuário' : ''}
          >
            <span className="sr-only">Excluir</span>
          </Button>
        )}
      </>
    );
  }, [isAdminMaster, isCurrentUserAdminMaster, currentUser, navigate, handlePromoteClick, handleDemoteClick, handleDeleteClick]);

  return (
    <div className="lista-usuarios-container">
      <div className="lista-usuarios-header">
        <div className="lista-usuarios-header-content">
          <h1 className="lista-usuarios-title">Usuários</h1>
          <p className="lista-usuarios-subtitle">Gerenciar usuários do sistema</p>
        </div>
        <Button
          onClick={() => navigate('/usuarios/novo')}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Novo Usuário
        </Button>
      </div>

      <Card>
        <div className="lista-usuarios-search">
          <Input
            placeholder="Digite o nome do usuário"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            {paginatedUsuarios.length === 0 && !loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={paginatedUsuarios}
                actions={renderActions}
              />
            )}

            {usuarios.length > 0 && (
              <div className="lista-usuarios-pagination">
                <div className="lista-usuarios-pagination-container">
                  <div className="lista-usuarios-pagination-items-per-page">
                    <span className="lista-usuarios-pagination-items-label">Itens por página:</span>
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

                  <div className="lista-usuarios-pagination-info">
                    <span className="lista-usuarios-pagination-info-text">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, usuarios.length)} de {usuarios.length} registros
                    </span>
                  </div>

                  <div className="lista-usuarios-pagination-controls">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Anterior
                    </Button>
                    
                    <div className="lista-usuarios-pagination-numbers">
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
          setUsuarioToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${usuarioToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />

      <ConfirmModal
        open={promoteModalOpen}
        onClose={() => {
          setPromoteModalOpen(false);
          setUsuarioToPromote(null);
        }}
        onConfirm={handlePromoteConfirm}
        title="Promover Usuário"
        message={`Tem certeza que deseja promover o usuário "${usuarioToPromote?.nome}" a administrador?`}
        confirmText="Promover"
        cancelText="Cancelar"
        variant="info"
        loading={promoting}
      />

      <ConfirmModal
        open={demoteModalOpen}
        onClose={() => {
          setDemoteModalOpen(false);
          setUsuarioToDemote(null);
        }}
        onConfirm={handleDemoteConfirm}
        title="Rebaixar Administrador"
        message={`Tem certeza que deseja rebaixar o administrador "${usuarioToDemote?.nome}" a usuário comum? Ele perderá todas as permissões de administrador.`}
        confirmText="Rebaixar"
        cancelText="Cancelar"
        variant="warning"
        loading={demoting}
      />
    </div>
  );
};
