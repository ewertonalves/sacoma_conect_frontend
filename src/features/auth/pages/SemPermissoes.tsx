import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/stores/authStore';
import { useUIStore } from '../../../app/stores/uiStore';
import { permissaoService } from '../../permissoes/services/permissaoService';
import { Card } from '../../../shared/ui/Card/Card';
import { AlertCircle } from 'lucide-react';
import './css/SemPermissoes.css';

export const SemPermissoes = () => {
  const navigate = useNavigate();
  const { user, setPermissoes, role, permissoes } = useAuthStore();
  const { setSidebarOpen } = useUIStore();

  useEffect(() => {
    // Garante que o sidebar esteja aberto
    setSidebarOpen(true);

    // Se não for usuário comum, redireciona
    if (role && role !== 'USER') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Se já tem permissões, redireciona
    if (permissoes.length > 0) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Verifica periodicamente se o usuário recebeu permissões
    const checkPermissoes = async () => {
      if (user?.id) {
        try {
          console.log('[SemPermissoes] Verificando permissões para usuário:', user.id);
          // Usa o endpoint /minhas que permite qualquer usuário autenticado buscar suas próprias permissões
          const permissoesUsuario = await permissaoService.buscarMinhasPermissoes();
          console.log('[SemPermissoes] Permissões encontradas:', permissoesUsuario);
          console.log('[SemPermissoes] Permissões atuais no store:', permissoes);
          
          if (permissoesUsuario.length > 0) {
            console.log('[SemPermissoes] Atualizando permissões e redirecionando...');
            setPermissoes(permissoesUsuario);
            // Pequeno delay para garantir que o estado foi atualizado
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 100);
          }
        } catch (error) {
          console.error('[SemPermissoes] Erro ao verificar permissões:', error);
        }
      }
    };

    // Verifica a cada 5 segundos
    const interval = setInterval(checkPermissoes, 5000);

    return () => clearInterval(interval);
  }, [user, role, permissoes, navigate, setPermissoes, setSidebarOpen]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 w-full">
      <Card className="max-w-2xl w-full">
        <div className="text-center flex flex-col gap-6 py-8 px-6">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-yellow-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Aguardando Permissões</h1>
          
          <p className="text-lg text-gray-700">
            Olá, <strong>{user?.nome || 'Usuário'}</strong>!
          </p>
          
          <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
            Você ainda não possui permissões para acessar as funcionalidades do sistema.
            Por favor, entre em contato com o administrador para solicitar o acesso às telas necessárias.
          </p>
          
          <p className="text-sm text-gray-500 italic mt-4">
            Esta página será atualizada automaticamente quando suas permissões forem concedidas.
          </p>
        </div>
      </Card>
    </div>
  );
};
