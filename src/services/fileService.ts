import { STORAGE_KEYS } from '../constants/storage';
import type { LoadedFileState, PersistedFileMeta } from '../types';

function toLoadedFileState(
  file: File,
  content: string,
  source: LoadedFileState['source'],
  handle?: FileSystemFileHandle,
): LoadedFileState {
  return {
    name: file.name,
    content,
    lastModified: file.lastModified,
    size: file.size,
    source,
    handle,
  };
}

export async function openMarkdownFile(): Promise<LoadedFileState | null> {
  if (window.showOpenFilePicker) {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: 'Markdown',
          accept: {
            'text/markdown': ['.md', '.markdown'],
            'text/plain': ['.md'],
          },
        },
      ],
    });

    if (!handle) {
      return null;
    }

    const file = await handle.getFile();
    const content = await file.text();
    return toLoadedFileState(file, content, 'picker', handle);
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,text/markdown';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const content = await file.text();
      resolve(toLoadedFileState(file, content, 'picker'));
    };
    input.click();
  });
}

export async function readDroppedMarkdownFile(
  file: File,
): Promise<LoadedFileState> {
  const content = await file.text();
  return toLoadedFileState(file, content, 'drop');
}

export async function reloadMarkdownFile(
  fileState: LoadedFileState,
): Promise<LoadedFileState | null> {
  if (fileState.handle) {
    const file = await fileState.handle.getFile();
    const content = await file.text();
    return toLoadedFileState(file, content, fileState.source, fileState.handle);
  }

  return null;
}

export function persistLastFileMeta(fileState: LoadedFileState) {
  const value: PersistedFileMeta = {
    name: fileState.name,
    lastModified: fileState.lastModified,
    size: fileState.size,
  };

  localStorage.setItem(STORAGE_KEYS.lastFileMeta, JSON.stringify(value));
}

export function readPersistedLastFileMeta(): PersistedFileMeta | null {
  const raw = localStorage.getItem(STORAGE_KEYS.lastFileMeta);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedFileMeta;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.lastFileMeta);
    return null;
  }
}
