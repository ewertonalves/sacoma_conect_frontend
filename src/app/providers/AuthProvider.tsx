import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Usa seletores para evitar problemas de re-render
  const initialize = useAuthStore((state) => state.initialize);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Inicializa o store do localStorage
    initialize();
    // Verifica autenticação
    checkAuth();
  }, [initialize, checkAuth]);

  return <>{children}</>;
};

