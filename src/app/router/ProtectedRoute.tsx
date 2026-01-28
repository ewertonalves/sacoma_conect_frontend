import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../../shared/types';
import { Loading } from '../../shared/ui/Loading/Loading';
import { permissaoService } from '../../features/permissoes/services/permissaoService';
import { getPrimeiraRotaPermitida } from '../../shared/utils/routeUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];
  telaId?: string;
}

export const ProtectedRoute = ({ children, roles, telaId }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const permissoes = useAuthStore((state) => state.permissoes);
  const setPermissoes = useAuthStore((state) => state.setPermissoes);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const lastLoadTimeRef = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);
  const navegacaoRef = useRef<string | null>(null);
  const navegacaoExecutadaRef = useRef<boolean>(false);

  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  const storedUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPermissoesCarregadas(false);
      navegacaoRef.current = null;
    }
  }, [user?.id, role, isAuthenticated]);

  useEffect(() => {
    const loadPermissoes = async () => {
      if (
        loadingRef.current ||
        Date.now() - lastLoadTimeRef.current < 2000 ||
        !isAuthenticated ||
        !token ||
        !user
      ) {
        if (!isAuthenticated || !token || !user) setPermissoesCarregadas(true);
        return;
      }
      if (role === 'USER' && isAuthenticated) {
        loadingRef.current = true;
        try {
          const permissoesUsuario = await permissaoService.buscarMinhasPermissoes();
          setPermissoes(permissoesUsuario);
        } catch (error: any) {
          if (error?.status === 403 || error?.status === 401) {
            setPermissoes([]);
          }
        } finally {
          setPermissoesCarregadas(true);
          lastLoadTimeRef.current = Date.now();
          loadingRef.current = false;
        }
      } else {
        setPermissoesCarregadas(true);
      }
    };

    if (isAuthenticated && token && user) loadPermissoes();
    else setPermissoesCarregadas(true);

    const intervalTime = location.pathname === '/sem-permissoes' ? 3000 : 10000;
    const interval = setInterval(() => {
      if (isAuthenticated && token && user) loadPermissoes();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [user?.id, role, isAuthenticated, setPermissoes, location.pathname, token, user]);

  useEffect(() => {
    if (navegacaoRef.current === location.pathname) {
      navegacaoRef.current = null;
      navegacaoExecutadaRef.current = false;
    }
  }, [location.pathname]);

  useEffect(() => {
    const destino = navegacaoRef.current;
    if (destino && destino !== location.pathname && !navegacaoExecutadaRef.current) {
      navegacaoExecutadaRef.current = true;
      setTimeout(() => navigate(destino, { replace: true }), 0);
    }
  }, [location.pathname, navigate, permissoesCarregadas, permissoes.length]);

  // ====== Regras de navegação condensadas ======

  // Caso não autenticado (precisa autenticar)
  if ((token && storedUser && !isAuthenticated)) {
    checkAuth();
    return <Loading fullScreen message="Carregando..." />;
  }

  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Checagem de roles gerais
  if (roles?.length) {
    if (!role) return <Navigate to="/login" replace />;
    if (!roles.includes(role)) return <Navigate to="/dashboard" replace />;
  }

  // Checagens do usuário comum
  const isUser = role === 'USER';
  const onDashboard = location.pathname === '/dashboard';
  const onSemPermissoes = location.pathname === '/sem-permissoes';
  const temPermissaoDireta = telaId && permissoes.includes(telaId);
  const temPermissaoRelacionada =
    telaId === 'membros'
      ? permissoes.some(p => p === 'membros' || p.startsWith('membros-'))
      : telaId === 'financeiro'
        ? permissoes.some(p => p === 'financeiro' || p.startsWith('financeiro-'))
        : telaId === 'assistencia-social'
          ? permissoes.some(p => p === 'assistencia-social' || p.startsWith('assistencia-social-'))
          : telaId === 'dashboard'
            ? permissoes.includes('dashboard')
            : false;

  // Carregando permissões (quando precisa de telaId)
  if (isUser && telaId && !permissoesCarregadas) {
    return <Loading fullScreen message="Carregando permissões..." />;
  }

  // Processamento de permissões para telas específicas
  if (isUser && telaId && permissoesCarregadas) {
    if (navegacaoRef.current && navegacaoRef.current !== location.pathname)
      return <Loading fullScreen message="Redirecionando..." />;

    const temPermissao = temPermissaoDireta || temPermissaoRelacionada;

    if (!temPermissao) {
      // Sem permissão para a tela
      if (navegacaoRef.current && navegacaoRef.current !== location.pathname)
        return <Loading fullScreen message="Redirecionando..." />;

      if (onSemPermissoes) return <>{children}</>;

      if (permissoes.length === 0) {
        if (navegacaoRef.current !== '/sem-permissoes') {
          navegacaoRef.current = '/sem-permissoes';
          navegacaoExecutadaRef.current = false;
        }
        return <Loading fullScreen message="Redirecionando..." />;
      }

      // Redireciona pra primeira rota permitida
      const primeiraRota = getPrimeiraRotaPermitida(permissoes);
      if (primeiraRota) {
        if (location.pathname === primeiraRota) {
          navegacaoRef.current = null;
          navegacaoExecutadaRef.current = false;
          return <>{children}</>;
        }
        if (navegacaoRef.current !== primeiraRota) {
          navegacaoRef.current = primeiraRota;
          navegacaoExecutadaRef.current = false;
        }
        return <Loading fullScreen message="Redirecionando..." />;
      }

      // Se não achou nenhuma rota válida, vai para sem permissões
      if (navegacaoRef.current !== '/sem-permissoes') {
        navegacaoRef.current = '/sem-permissoes';
        navegacaoExecutadaRef.current = false;
      }
      return <Loading fullScreen message="Redirecionando..." />;
    }
    // Usuário tem permissão na tela
  }

  if (
    isUser &&
    permissoesCarregadas &&
    permissoes.length === 0 &&
    !telaId &&
    (!onSemPermissoes || (navegacaoRef.current && navegacaoRef.current !== location.pathname))
  ) {
    if (!onSemPermissoes) {
      if (navegacaoRef.current !== '/sem-permissoes') {
        navegacaoRef.current = '/sem-permissoes';
        navegacaoExecutadaRef.current = false;
      }
      return <Loading fullScreen message="Redirecionando..." />;
    }
  }

  // Se está no dashboard e não tem permissão para dashboard, vai pra primeira rota permitida
  if (
    isUser &&
    permissoesCarregadas &&
    !telaId &&
    onDashboard &&
    permissoes.length > 0 &&
    !permissoes.includes('dashboard')
  ) {
    if (navegacaoRef.current && navegacaoRef.current !== location.pathname)
      return <Loading fullScreen message="Redirecionando..." />;

    const primeiraRota = getPrimeiraRotaPermitida(permissoes);
    if (primeiraRota && location.pathname !== primeiraRota) {
      if (navegacaoRef.current !== primeiraRota) {
        navegacaoRef.current = primeiraRota;
        navegacaoExecutadaRef.current = false;
      }
      return <Loading fullScreen message="Redirecionando..." />;
    }
  }

  return <>{children}</>;
};
