import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<string[]>([]);

  const showToast = (message: string) => {
    setToasts((prev) => [...prev, message]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000); // Auto-dismiss after 3s
  };

  return { toasts, showToast };
}
