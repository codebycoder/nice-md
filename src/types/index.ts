export type ThemeMode = 'light' | 'dark';

export type TranslationDisplayMode = 'replace' | 'bilingual';

export type TranslationModelId =
  | 'google/gemini-2.5-flash-lite'
  | 'qwen/qwen3.5-9b'
  | 'deepseek/deepseek-chat'
  | 'google/gemini-3.1-flash-lite'
  | 'openai/gpt-5-mini'
  | 'openai/gpt-5.6-luna';

export interface TranslationSettings {
  model: TranslationModelId;
  displayMode: TranslationDisplayMode;
}

export interface TabTranslationState {
  originalContent: string;
  mode: TranslationDisplayMode;
  bilingualBlocks?: BilingualBlock[];
}

export type BilingualBlock =
  | { type: 'code'; content: string }
  | {
      type: 'pair';
      original: string;
      translation: string;
      kind?: 'text' | 'table';
    };

export interface TranslationProgress {
  current: number;
  total: number;
}

export type MarkdownDirection = 'rtl' | 'ltr';

export type MarkdownFontFamilyId = 'vazirmatn' | 'system' | 'serif' | 'mono';

export type MarkdownFontWeight = 400 | 500 | 600 | 700;

export interface MarkdownSettings {
  direction: MarkdownDirection;
  fontFamily: MarkdownFontFamilyId;
  /** Body font size in pixels (13–26). */
  fontSize: number;
  fontWeight: MarkdownFontWeight;
  /** Unitless line height (1.4–2.6). */
  lineHeight: number;
  /** Letter spacing in em (-0.05–0.12). */
  letterSpacing: number;
  /** Content column max width in pixels (640–1200). */
  contentWidth: number;
  /** Vertical spacing multiplier for blocks (0.5–2). */
  paragraphSpacing: number;
  /** Heading size scale in percent (85–130). */
  headingScale: number;
  /** Empty string uses theme default (inherit). */
  textColor: string;
  /** Empty string follows body text color. */
  headingColor: string;
  /** Empty string uses theme default link colors. */
  linkColor: string;
  linkUnderline: boolean;
  /** Empty string uses default accent for blockquotes. */
  blockquoteColor: string;
}

export interface LoadedFileState {
  name: string;
  content: string;
  lastModified: number;
  size: number;
  source: 'picker' | 'drop';
  handle?: FileSystemFileHandle;
}

export interface PersistedFileMeta {
  name: string;
  lastModified: number;
  size: number;
}

export interface TabSearchState {
  open: boolean;
  query: string;
  activeMatchIndex: number;
  totalMatches: number;
}

export interface DocumentTab {
  id: string;
  file: LoadedFileState;
  search: TabSearchState;
  scrollTop: number;
  createdAt: number;
  lastActivatedAt: number;
  translation?: TabTranslationState;
}

export function getArticleId(tabId: string): string {
  return `reader-article-${tabId}`;
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
  openFileNewTab: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  searchNext: () => void;
  searchPrevious: () => void;
  reloadFile: () => void;
  closeTab: () => void;
  activateNextTab: () => void;
  activatePreviousTab: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  isSearchOpen: boolean;
  isShortcutsModalOpen: boolean;
  hasActiveTab: boolean;
}
