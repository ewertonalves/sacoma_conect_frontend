import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, DollarSign, Shield, HeartHandshake } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'USER'], telaId: 'dashboard', exact: true },
  { label: 'Usuários', path: '/usuarios', icon: Users, roles: ['ADMIN'], telaId: null, exact: true },
  { label: 'Permissões', path: '/usuarios/permissoes', icon: Shield, roles: ['ADMIN'], telaId: null, exact: true },
  { label: 'Membros', path: '/membros', icon: UserCircle, roles: ['ADMIN', 'USER'], telaId: 'membros', exact: false },
  { label: 'Financeiro', path: '/financeiro', icon: DollarSign, roles: ['ADMIN', 'USER'], telaId: 'financeiro', exact: false },
  { label: 'Assistência Social', path: '/assistencia-social', icon: HeartHandshake, roles: ['ADMIN', 'USER'], telaId: 'assistencia-social', exact: false },
];

export const Sidebar = () => {
  const { sidebarOpen } = useUIStore();
  const { role, permissoes } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!role) return false;
    if (role === 'ADMIN') {
      return item.roles.includes(role);
    }
    if (role === 'USER') {
      if (!item.roles.includes(role)) {
        return false;
      }
      if (!item.telaId) {
        return false;
      }
      
      // Verifica se tem permissão direta
      const temPermissaoDireta = permissoes.includes(item.telaId);
      
      // Para telas principais (membros, financeiro, assistencia-social), verifica se tem qualquer permissão relacionada
      let temPermissaoRelacionada = false;
      if (item.telaId === 'membros') {
        temPermissaoRelacionada = permissoes.some(p => p === 'membros' || p.startsWith('membros-'));
      } else if (item.telaId === 'financeiro') {
        temPermissaoRelacionada = permissoes.some(p => p === 'financeiro' || p.startsWith('financeiro-'));
      } else if (item.telaId === 'assistencia-social') {
        temPermissaoRelacionada = permissoes.some(p => p === 'assistencia-social' || p.startsWith('assistencia-social-'));
      } else if (item.telaId === 'dashboard') {
        temPermissaoRelacionada = permissoes.includes('dashboard');
      }
      
      const temPermissao = temPermissaoDireta || temPermissaoRelacionada;
      
      return temPermissao;
    }
    return false;
  });

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-30 flex flex-col">
      <nav className="p-4 space-y-2 flex-1">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma permissão concedida</p>
          </div>
        )}
      </nav>
    </aside>
  );
};
