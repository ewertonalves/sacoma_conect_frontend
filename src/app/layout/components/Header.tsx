import { Menu, LogOut } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button/Button';

export const Header = () => {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Sacomã Conect</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600">
            {user.nome}{user.role === 'ADMIN' && ' (Admin)'}
          </span>
        )}
        <Button variant="ghost" size="small" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
          Sair
        </Button>
      </div>
    </header>
  );
};

