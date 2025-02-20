'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose } from '@/components/ui/toast';

type ToastType = {
  id: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type ToastContextType = {
  showToast: (toast: Omit<ToastType, 'id'>) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const CustomToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = (toast: Omit<ToastType, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: toastId++ }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000); // Auto-dismiss after 4 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map(({ id, title, description, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="flex flex-col space-y-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a CustomToastProvider');
  }
  return context;
};
