import { ReactNode } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useUIStore } from '../stores/uiStore';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? 'ml-64' : 'ml-0'}
          `}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

