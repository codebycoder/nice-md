import { useEffect, useState } from 'react';
import type { TocItem } from '../types';

export function useActiveHeading(toc: TocItem[]) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (toc.length === 0) {
      setActiveId('');
      return;
    }

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: [0, 0.25, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [toc]);

  return activeId;
}
