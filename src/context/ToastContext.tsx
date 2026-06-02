import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ToastViewport } from '../components/Toast';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ShowToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  show: (message: string, options?: ShowToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;

function createToastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      const id = createToastId();
      const variant = options.variant ?? 'info';
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((current) => [...current, { id, message, variant, duration }]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'success', duration }),
    [show],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'error', duration }),
    [show],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'info', duration }),
    [show],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      show(message, { variant: 'warning', duration }),
    [show],
  );

  const value = useMemo(
    () => ({ toasts, show, success, error, info, warning, dismiss }),
    [toasts, show, success, error, info, warning, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
