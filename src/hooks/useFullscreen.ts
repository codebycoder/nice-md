import { useEffect, useState } from 'react';

export function useFullscreen(targetId: string) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const target = document.getElementById(targetId);
      setIsFullscreen(Boolean(target && document.fullscreenElement === target));
    };

    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [targetId]);

  const toggleFullscreen = async () => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    if (document.fullscreenElement === target) {
      await document.exitFullscreen();
      return;
    }

    await target.requestFullscreen();
  };

  return { isFullscreen, toggleFullscreen };
}
