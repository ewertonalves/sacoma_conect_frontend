import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const sizeClasses = {
  small: 'max-w-md',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  fullscreen: 'max-w-full mx-4',
};

export const Modal = ({
  open,
  onClose,
  title,
  size = 'medium',
  closable = true,
  children,
  footer,
}: ModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closable, open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/10"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          relative bg-white rounded-lg shadow-xl
          w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-y-auto
          z-10
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="p-6 border-t flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

