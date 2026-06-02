import type { DragEvent, ReactNode } from 'react';

interface DropZoneProps {
  isActive: boolean;
  onDragStateChange: (value: boolean) => void;
  onFileDrop: (file: File) => void;
  children: ReactNode;
}

export function DropZone({
  isActive,
  onDragStateChange,
  onFileDrop,
  children,
}: DropZoneProps) {
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    onDragStateChange(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDragStateChange(false);
    const file = event.dataTransfer.files?.[0];

    if (file && /\.(md|markdown)$/i.test(file.name)) {
      onFileDrop(file);
    }
  };

  return (
    <div
      className="relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {isActive && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-[2rem] border-2 border-dashed border-accent-400 bg-accent-500/10 text-center text-lg font-semibold text-accent-600 backdrop-blur-sm dark:text-accent-300">
          فایل Markdown را اینجا رها کنید
        </div>
      )}
    </div>
  );
}
