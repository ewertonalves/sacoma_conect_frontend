import { useEffect, useRef } from 'react';

export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAbortController = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getAbortController };
}

