# Nice MD

Persian-first Markdown reader for technical documentation with mixed RTL/LTR content.

## Features

- RTL-optimized Markdown rendering
- Persian typography with `Vazirmatn`
- Technical tokens styled with `JetBrains Mono`
- Safe Markdown rendering with `react-markdown`, `remark-gfm`, and `rehype-sanitize`
- Local file open, drag and drop, reload, and filename display
- Search with match count, highlight, next, and previous
- Auto-generated table of contents with active section tracking
- Light and dark themes with persistence
- Copy code, reading progress, fullscreen mode, collapsible sidebar, and keyboard shortcuts

## Install

```bash
pnpm install
pnpm dev
```

If `pnpm` is not usable in your shell because of a parent workspace toolchain override, `npm install` will also install the dependencies for this project, but the project configuration itself is still pnpm-ready.

## Keyboard Shortcuts

- `Ctrl/Cmd + O`: open file
- `Ctrl/Cmd + F`: focus search
- `Ctrl/Cmd + R`: reload current file
- `T`: toggle theme
- `B`: collapse or expand sidebar
- `F`: toggle fullscreen

## Notes

- Last opened file metadata is persisted locally, but browsers may require you to reselect the file after a full refresh before it can be read again.
- The smart normalizer only changes content in memory for rendering. It does not modify the original file.
