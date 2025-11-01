# Breeze 🌬️

> Generate SEO-optimized content from any webpage using Chrome's built-in AI features

Breeze is a Chrome browser extension that leverages Chrome's native AI capabilities to transform web content into SEO-optimized blog posts, keyword lists, and Reddit posts. Simply navigate to any webpage and let Breeze generate professional content for you.

## ✨ Features

- **📝 Blog Post Generation**: Create SEO-optimized blog posts in multiple categories:
  - Educational/How-to Content
  - Use Case Articles
  - Problem-Solution Articles
  - Best Practices and Tips
  - Case Studies and Success Stories

- **🔑 Keyword Research**: Extract SEO-optimized keywords and keyphrases from any webpage

- **📱 Reddit Post Generation**: Generate authentic, conversational Reddit posts optimized for engagement

- **🎨 Modern UI**: Beautiful, responsive interface with dark mode support

- **💾 Easy Export**: Download blog posts as Markdown files or copy Reddit posts to clipboard

## 🚀 Requirements

- **Chrome Browser** (version 121 or later)
- **Chrome's Built-in AI Features**: Must be enabled and available
  - The extension uses Chrome's `LanguageModel` and `Summarizer` APIs
  - These features are available in Chrome Canary or stable Chrome with AI features enabled

## 🔧 Enabling Chrome AI Features

Before using Breeze, you need to enable Chrome's built-in AI features:

1. Open Chrome and navigate to `chrome://flags/`
2. Search for and enable the following flags:
   - **Prompt API for Gemini Nano**
   - **Summarization API for Gemini Nano**
3. **Restart your browser** for the changes to take effect

Once these flags are enabled, Breeze will be able to use Chrome's AI capabilities to generate content.

## 📦 Installation

### From Source

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd breeze
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

### Development Mode

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Load the extension as described above (the `dist` folder will be updated automatically)

## 🎯 Usage

1. **Navigate to any webpage** you want to use as source material

2. **Open Breeze**:
   - Click the Breeze extension icon in your Chrome toolbar
   - The side panel will open with the extension interface

3. **Choose your content type**:
   - **Generate Blog**: Select a blog category and generate an SEO-optimized blog post
   - **Generate Keywords**: Extract SEO keywords from the page
   - **Generate Reddit Post**: Create a Reddit post based on the page content

4. **Review and export**:
   - Blog posts can be downloaded as Markdown files
   - Reddit posts can be copied to clipboard
   - Keywords are displayed for easy copying

## 🛠️ Development

### Project Structure

```
breeze/
├── src/
│   ├── background/          # Service worker for extension lifecycle
│   ├── components/          # React components
│   │   ├── Button.tsx
│   │   ├── Loading.tsx
│   │   ├── ResultHeader.tsx
│   │   ├── SectionTitle.tsx
│   │   └── SourceBar.tsx
│   ├── sidepanel/           # Main extension UI
│   │   ├── App.tsx          # Main application component
│   │   ├── App.css
│   │   ├── index.html
│   │   ├── index.css
│   │   └── main.tsx
│   └── utils/
│       ├── aiService.ts     # Chrome AI API integration
│       └── contentExtractor.ts  # Page content extraction
├── public/                  # Static assets
├── manifest.config.ts       # Chrome extension manifest
├── vite.config.ts          # Vite configuration
└── package.json
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the extension for production
- `npm run preview` - Preview the production build

### Building for Production

When you run `npm run build`, the extension will be packaged and a zip file will be created in the `release/` directory.

## 🔧 Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **@crxjs/vite-plugin** - Chrome extension support for Vite
- **react-markdown** - Markdown rendering
- **Chrome Extension APIs**:
  - Side Panel API
  - Tabs API
  - Scripting API
  - Chrome AI APIs (LanguageModel, Summarizer)

## 📝 How It Works

1. **Content Extraction**: The extension extracts text content from the currently active tab
2. **Content Summarization**: Chrome's AI Summarizer API creates a concise summary
3. **Content Generation**: Chrome's LanguageModel API generates the requested content type:
   - Blog posts with SEO optimization
   - Keyword lists for SEO research
   - Reddit posts with authentic, conversational tone
4. **Display & Export**: Generated content is displayed in a formatted view with export options

## ⚠️ Notes

- The extension requires Chrome's built-in AI features to be available
- Content generation quality depends on the source page content
- Large web pages may have content truncated to fit AI context windows
- The extension works best with content-rich pages

---

Made with ❤️ using Chrome's built-in AI capabilities

