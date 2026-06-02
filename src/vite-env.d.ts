/// <reference types="vite/client" />

interface OpenFilePickerType {
  description?: string;
  accept: Record<string, string[]>;
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: OpenFilePickerType[];
}

declare global {
  interface Window {
    showOpenFilePicker?: (
      options?: OpenFilePickerOptions,
    ) => Promise<globalThis.FileSystemFileHandle[]>;
  }
}

export {};
