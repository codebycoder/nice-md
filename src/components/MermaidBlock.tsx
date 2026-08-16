import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { ThemeMode } from '../types';

interface MermaidBlockProps {
  code: string;
  theme: ThemeMode;
}

function configureMermaid(theme: ThemeMode) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: theme === 'dark' ? 'dark' : 'default',
    fontFamily: 'Vazirmatn, system-ui, sans-serif',
  });
}

export function MermaidBlock({ code, theme }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    configureMermaid(theme);

    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    const render = async () => {
      setError(null);

      try {
        const { svg, bindFunctions } = await mermaid.render(
          `mermaid-${renderId}`,
          code,
        );

        if (cancelled) {
          return;
        }

        container.innerHTML = svg;
        bindFunctions?.(container);
      } catch (renderError) {
        if (cancelled) {
          return;
        }

        const message =
          renderError instanceof Error
            ? renderError.message
            : 'Failed to render diagram.';
        setError(message);
        container.innerHTML = '';
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [code, renderId, theme]);

  if (error) {
    return (
      <div className="diagram-block diagram-block--error" dir="ltr">
        <p className="diagram-block__label">Mermaid diagram error</p>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div
      className="diagram-block mermaid-block"
      dir="ltr"
      ref={containerRef}
      aria-label="Mermaid diagram"
    />
  );
}
