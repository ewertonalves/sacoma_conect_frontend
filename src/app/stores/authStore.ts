import { create } from 'zustand';
import type { User, Role } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  permissoes: string[]; // IDs das telas permitidas

  login: (token: string, user: User, permissoes?: string[]) => void;
  logout: () => void;
  checkAuth: () => boolean;
  hasRole: (role: Role) => boolean;
  hasPermissao: (telaId: string) => boolean;
  setPermissoes: (permissoes: string[]) => void;
  updateUser: (user: User) => void; // Atualiza o usuário e limpa permissões se virar ADMIN
  initialize: () => void;
}

// Função para carregar do localStorage
const loadFromStorage = (): { user: User | null; token: string | null; permissoes: string[] } => {
  try {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const permissoesStr = localStorage.getItem('auth_permissoes');
    const user = userStr ? JSON.parse(userStr) : null;
    const permissoes = permissoesStr ? JSON.parse(permissoesStr) : [];
    return { token, user, permissoes };
  } catch {
    return { token: null, user: null, permissoes: [] };
  }
};

// Função para salvar no localStorage
const saveToStorage = (token: string | null, user: User | null, permissoes: string[] = []) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('auth_user');
  }
  if (permissoes.length > 0) {
    localStorage.setItem('auth_permissoes', JSON.stringify(permissoes));
  } else {
    localStorage.removeItem('auth_permissoes');
  }
};

// Inicializa o store de forma segura
const getInitialState = (): Pick<AuthState, 'user' | 'token' | 'isAuthenticated' | 'role' | 'permissoes'> => {
  try {
    const { token, user, permissoes } = loadFromStorage();
    if (token && user) {
      return {
        token,
        user,
        isAuthenticated: true,
        role: user.role,
        permissoes: permissoes || [],
      };
    }
  } catch (error) {
    console.error('Erro ao carregar estado inicial:', error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    role: null,
    permissoes: [],
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialState(),

  initialize: () => {
    const { token, user, permissoes } = loadFromStorage();
    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
        role: user.role,
        permissoes: permissoes || [],
      });
    }
  },

  login: (token: string, user: User, permissoes: string[] = []) => {
    saveToStorage(token, user, permissoes);
    set({
      token,
      user,
      isAuthenticated: true,
      role: user.role,
      permissoes: permissoes || [],
    });
  },

  logout: () => {
    saveToStorage(null, null, []);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      role: null,
      permissoes: [],
    });
  },

  checkAuth: () => {
    try {
      const { token, user, permissoes } = loadFromStorage();
      const isAuthenticated = !!token && !!user;
      if (isAuthenticated) {
        set({
          token,
          user,
          isAuthenticated: true,
          role: user.role,
          permissoes: permissoes || [],
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          role: null,
          permissoes: [],
        });
      }
      return isAuthenticated;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  },

  hasRole: (role: Role) => {
    const { role: userRole } = get();
    return userRole === role || userRole === 'ADMIN';
  },

  hasPermissao: (telaId: string) => {
    const { role, permissoes } = get();
    // ADMIN tem acesso a tudo
    if (role === 'ADMIN') {
      return true;
    }
    // USER precisa ter a permissão específica
    return permissoes.includes(telaId);
  },

  setPermissoes: (permissoes: string[]) => {
    const { token, user } = get();
    saveToStorage(token, user, permissoes);
    set({ permissoes });
  },

  updateUser: (updatedUser: User) => {
    const { token, user: currentUser } = get();
    
    // Se o usuário atual foi atualizado e virou ADMIN, limpa as permissões
    if (currentUser && currentUser.id === updatedUser.id && updatedUser.role === 'ADMIN') {
      saveToStorage(token, updatedUser, []);
      set({
        user: updatedUser,
        role: updatedUser.role,
        permissoes: [], // ADMIN não precisa de permissões específicas
      });
    } else if (currentUser && currentUser.id === updatedUser.id) {
      // Atualiza o usuário mantendo as permissões atuais
      saveToStorage(token, updatedUser, get().permissoes);
      set({
        user: updatedUser,
        role: updatedUser.role,
      });
    }
  },
}));

