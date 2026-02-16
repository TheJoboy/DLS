import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastCtx = { message: string; show: (msg: string) => void };
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const value = useMemo(() => ({ message, show: (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2200);
  }}), [message]);

  return <Ctx.Provider value={value}>{children}<div role="status" aria-live="polite" className="toast">{message}</div></Ctx.Provider>;
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ToastProvider missing');
  return ctx;
}
