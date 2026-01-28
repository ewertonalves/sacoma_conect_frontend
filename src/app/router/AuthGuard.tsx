import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ['/login', '/cadastro'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    // Só redireciona se não estiver em uma rota pública e não estiver autenticado
    if (!isAuthenticated && !isPublicRoute) {
      navigate('/login', { replace: true });
      return;
    }

    // Se estiver autenticado e tentar acessar rota pública, redireciona para dashboard
    if (isAuthenticated && isPublicRoute) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
};

