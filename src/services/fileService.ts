import { STORAGE_KEYS } from '../constants/storage';
import type { LoadedFileState, PersistedFileMeta } from '../types';
import {
  convertDocxToMarkdown,
  isDocxFile,
  isLegacyDocFile,
} from '../utils/docxToMarkdown';

export class UnsupportedDocumentFileError extends Error {
  readonly code: 'LEGACY_DOC' | 'UNSUPPORTED';

  constructor(code: 'LEGACY_DOC' | 'UNSUPPORTED') {
    super(code);
    this.name = 'UnsupportedDocumentFileError';
    this.code = code;
  }
}

async function readFileContent(file: File): Promise<string> {
  if (isLegacyDocFile(file.name)) {
    throw new UnsupportedDocumentFileError('LEGACY_DOC');
  }

  if (isDocxFile(file.name)) {
    const buffer = await file.arrayBuffer();
    return convertDocxToMarkdown(buffer);
  }

  return file.text();
}

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
        {
          description: 'Word',
          accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
              ['.docx'],
          },
        },
      ],
    });

    if (!handle) {
      return null;
    }

    const file = await handle.getFile();
    const content = await readFileContent(file);
    return toLoadedFileState(file, content, 'picker', handle);
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      '.md,.markdown,.docx,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const content = await readFileContent(file);
        resolve(toLoadedFileState(file, content, 'picker'));
      } catch (error) {
        reject(error);
      }
    };
    input.click();
  });
}

export async function readDroppedMarkdownFile(
  file: File,
): Promise<LoadedFileState> {
  const content = await readFileContent(file);
  return toLoadedFileState(file, content, 'drop');
}

export async function reloadMarkdownFile(
  fileState: LoadedFileState,
): Promise<LoadedFileState | null> {
  if (fileState.handle) {
    const file = await fileState.handle.getFile();
    const content = await readFileContent(file);
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
