import { useState, useEffect } from 'react';

export function useProgress(isStreaming: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isStreaming) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 99) return 99;
          return Math.min(99, p + Math.max(1, Math.floor((99 - p) * 0.08)));
        });
      }, 250);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 1000);
      return () => clearTimeout(t);
    }
  }, [isStreaming]);

  return progress;
}
