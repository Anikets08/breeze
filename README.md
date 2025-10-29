## Breeze – SEO side panel for Chrome

Generate SEO-ready content from any page with a single click. Breeze lives in the Chrome Side Panel (no popup) and adapts to your browser’s light/dark theme.

### Features

- **Side Panel UX**: Click the extension icon to open Breeze in the side panel.
- **Two modes**: Blog and Keywords.
  - Blog supports selectable categories; markdown download included.
  - Keywords extracts SEO keyword suggestions.
- **Smart page capture**: Reads selected text (or the page body) via a minimal content script.
- **Theme-aware**: Text and accents adjust to your system/browser theme.

### Screenshots

- Side Panel with category selection, generate, and download controls.

### Getting started (development)

1. Install deps:
   ```bash
   bun install
   ```
2. Start dev server:
   ```bash
   bun run dev
   ```
3. Load the extension in Chrome:
   - Open chrome://extensions
   - Enable Developer mode
   - Click “Load unpacked” and select this project's `dist` folder
   - After changes, click “Reload” on the extension

### Build a production bundle

```bash
bun run build
```

This produces the build output and a zip at `release/crx-Breeze-1.0.0.zip` (via `vite-plugin-zip-pack`).

### How it works

- `side_panel`: Primary UI (`src/sidepanel/`) with a minimal, clean design.
- `content script`: `src/content/main.tsx` listens for `breeze:getContent` and returns the page selection/text/HTML. No UI injected.
- `background`: `src/background/index.ts` enables opening the side panel when you click the toolbar icon and handles the keyboard command.
- `manifest`: `manifest.config.ts` defines the side panel and permissions.

### Usage

1. Navigate to a page with content you want to transform in a SEO friendly way.
2. Click the Breeze icon to open the side panel.
3. Choose a mode:
   - Blog: Pick a category (required) and click Generate, then Download .md.
   - Keywords: Click Generate to get keywords.

### Permissions

- `sidePanel`: Open and manage the Chrome side panel.
- `tabs`, `activeTab`: To query the current tab and message the content script.
- `contentSettings`: Present to support content-related access where required by some pages.

### Tech stack

- Vite + React 19
- TypeScript
- CRXJS Vite plugin
- Lottie for lightweight animations

### Project structure

```
src/
  background/        # service worker
  content/           # minimal content script (no UI)
  sidepanel/         # main UI (React)
```

### Notes

- There is no popup. Clicking the icon opens the side panel directly.
- In Blog mode, the Generate button is disabled until a category is selected.
- Downloaded blogs are saved as markdown files with a timestamp.

### License

Proprietary – for personal use unless otherwise specified.
