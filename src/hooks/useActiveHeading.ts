import { useCallback, useEffect, useRef, useState } from 'react';
import type { TocItem } from '../types';

const PIN_DURATION_MS = 900;
const ACTIVATION_OFFSET_BUFFER_PX = 48;

function getActivationOffset(): number {
  const header = document.querySelector('header');
  return (header?.getBoundingClientRect().height ?? 120) + ACTIVATION_OFFSET_BUFFER_PX;
}

function resolveActiveHeadingId(headings: HTMLElement[]): string {
  const offset = getActivationOffset();
  let activeId = headings[0]?.id ?? '';

  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= offset) {
      activeId = heading.id;
      continue;
    }

    break;
  }

  return activeId;
}

export function useActiveHeading(toc: TocItem[]) {
  const [activeId, setActiveId] = useState('');
  const pinnedUntilRef = useRef(0);
  const pinnedIdRef = useRef('');

  const pinActiveHeading = useCallback((id: string) => {
    pinnedIdRef.current = id;
    pinnedUntilRef.current = Date.now() + PIN_DURATION_MS;
    setActiveId(id);
  }, []);

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

    const updateActiveHeading = () => {
      if (Date.now() < pinnedUntilRef.current) {
        setActiveId(pinnedIdRef.current);
        return;
      }

      setActiveId(resolveActiveHeadingId(headings));
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [toc]);

  return { activeId, pinActiveHeading };
}
