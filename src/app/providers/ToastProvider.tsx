import { useUIStore } from '../stores/uiStore';
import { X } from 'lucide-react';

const Toast = () => {
  const { notifications, hideNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const colorClasses = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          warning: 'bg-yellow-500',
          info: 'bg-blue-500',
        };

        return (
          <div
            key={notification.id}
            className={`
              ${colorClasses[notification.type]}
              text-white px-4 py-3 rounded-lg shadow-lg
              flex items-center gap-3 min-w-[300px] max-w-md
              animate-in slide-in-from-top-5
            `}
          >
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => hideNotification(notification.id)}
              className="hover:opacity-75 transition-opacity"
              aria-label="Fechar notificação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toast />
    </>
  );
};

