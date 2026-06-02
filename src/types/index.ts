export type ThemeMode = 'light' | 'dark';

export interface LoadedFileState {
  name: string;
  content: string;
  lastModified: number;
  size: number;
  source: 'picker' | 'drop' | 'sample';
  handle?: FileSystemFileHandle;
}

export interface PersistedFileMeta {
  name: string;
  lastModified: number;
  size: number;
}

export interface TocItem {
  id: string;
  level: number;
  text: string;
}

export interface SearchState {
  query: string;
  totalMatches: number;
  activeIndex: number;
}

export interface SearchNavigateDirection {
  direction: 'next' | 'previous';
}

export interface TechnicalTokenMatch {
  value: string;
  kind: 'env' | 'path' | 'command' | 'tech';
}

export interface KeyboardActionMap {
  openFile: () => void;
  focusSearch: () => void;
  reloadFile: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
}
