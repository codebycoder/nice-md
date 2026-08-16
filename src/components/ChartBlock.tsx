import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useRef, useState } from 'react';
import type { ThemeMode } from '../types';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Title,
  Tooltip,
);

interface ChartBlockProps {
  code: string;
  theme: ThemeMode;
}

type SupportedChartType = 'bar' | 'line' | 'pie' | 'doughnut';

interface ChartConfig {
  type: SupportedChartType;
  data: Chart['data'];
  options?: Chart['options'];
}

function isSupportedChartType(value: unknown): value is SupportedChartType {
  return (
    value === 'bar' ||
    value === 'line' ||
    value === 'pie' ||
    value === 'doughnut'
  );
}

function parseChartConfig(code: string): ChartConfig {
  const parsed: unknown = JSON.parse(code);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Chart config must be a JSON object.');
  }

  const config = parsed as Record<string, unknown>;

  if (!isSupportedChartType(config.type)) {
    throw new Error('Chart type must be one of: bar, line, pie, doughnut.');
  }

  if (!config.data || typeof config.data !== 'object') {
    throw new Error('Chart config must include a "data" object.');
  }

  return {
    type: config.type,
    data: config.data as Chart['data'],
    options: config.options as Chart['options'] | undefined,
  };
}

function buildChartOptions(
  theme: ThemeMode,
  options: Chart['options'] | undefined,
): Chart['options'] {
  const textColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';
  const gridColor =
    theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(15, 23, 42, 0.08)';

  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      title: {
        color: textColor,
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
    ...options,
  };
}

export function ChartBlock({ code, theme }: ChartBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let chart: Chart | null = null;

    try {
      const config = parseChartConfig(code);
      chart = new Chart(canvas, {
        type: config.type,
        data: config.data,
        options: buildChartOptions(theme, config.options),
      });
      setError(null);
    } catch (parseError) {
      const message =
        parseError instanceof Error
          ? parseError.message
          : 'Failed to render chart.';
      setError(message);
    }

    return () => {
      chart?.destroy();
    };
  }, [code, theme]);

  if (error) {
    return (
      <div className="diagram-block diagram-block--error" dir="ltr">
        <p className="diagram-block__label">Chart error</p>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div className="diagram-block chart-block" dir="ltr" aria-label="Chart">
      <canvas ref={canvasRef} />
    </div>
  );
}
