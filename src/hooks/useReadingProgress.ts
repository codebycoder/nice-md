import { useEffect, useState } from 'react';

export function useReadingProgress(containerId: string) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const element = document.getElementById(containerId);

      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const total = element.offsetHeight - window.innerHeight;

      if (total <= 0) {
        setProgress(100);
        return;
      }

      const consumed = Math.min(Math.max(-rect.top, 0), total);
      setProgress(Math.round((consumed / total) * 100));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [containerId]);

  return progress;
}
