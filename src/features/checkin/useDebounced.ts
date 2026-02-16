import { useEffect } from 'react';

export function useDebounced(effect: () => void, deps: unknown[], delay: number) {
  useEffect(() => {
    const t = setTimeout(effect, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
