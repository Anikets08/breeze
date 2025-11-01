import { useState, useEffect } from "react";
import { extractPageContent } from "../utils/contentExtractor";
import {
  generateSeoMarkdown,
  generateKeywords,
  summarizeWebContent,
  type BlogCategory,
  generateRedditPost,
  destroyPromptSession,
} from "../utils/aiService";
import "./App.css";
import Markdown from "react-markdown";
import Button from "../components/Button";
import SourceBar from "../components/SourceBar";
import SectionTitle from "../components/SectionTitle";
import ResultHeader from "../components/ResultHeader";
import Loading from "../components/Loading";

type Mode = "select" | "blog" | "keywords" | "loading" | "result";
type GenerationType = "blog" | "keywords" | "reddit" | null;

const BLOG_CATEGORIES: BlogCategory[] = [
  "Educational/How-to Content",
  "Use Case Articles",
  "Problem-Solution Articles",
  "Best Practices and Tips",
  "Case Studies and Success Stories",
];

export default function App() {
  const [mode, setMode] = useState<Mode>("select");
  // Removed selectedCategory; category is passed directly to generator
  const [blogContent, setBlogContent] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [redditContent, setRedditContent] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [generationType, setGenerationType] = useState<GenerationType>(null);

  useEffect(() => {
    // Check browser color scheme preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Load initial source URL
  useEffect(() => {
    void refreshPageInfo();
  }, []);

  const refreshPageInfo = async () => {
    try {
      // Destroy any existing LM session to avoid stale session across tabs
      await destroyPromptSession();
      // Prefer active tab URL to reflect user's current tab selection
      if (typeof chrome !== "undefined" && chrome?.tabs?.query) {
        const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) =>
          chrome.tabs.query({ active: true, currentWindow: true }, resolve)
        );
        const active = tabs && tabs[0];
        if (active?.url) {
          setCurrentUrl(active.url);
        }
      } else {
        // Fallback: derive from extracted page content
        const pageContent = await extractPageContent();
        setCurrentUrl(pageContent.url);
      }
    } catch (error) {
      console.error("Error refreshing page info:", error);
    }
  };

  const handleGenerateBlog = async (category: BlogCategory) => {
    setGenerationType("blog");
    setMode("loading");
    try {
      await destroyPromptSession();
      // Extract page content
      const pageContent = await extractPageContent();
      setCurrentUrl(pageContent.url);

      // Summarize content (using textContent for better context efficiency)
      const summary = await summarizeWebContent(pageContent.textContent, {
        url: pageContent.url,
        title: pageContent.title,
      });

      // Generate blog
      const blog = await generateSeoMarkdown(summary, category, {
        url: pageContent.url,
        title: pageContent.title,
      });

      setBlogContent(blog);
      setMode("result");
    } catch (error) {
      console.error("Error generating blog:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Error generating blog: ${errorMessage}\n\nMake sure Chrome's built-in AI features are available and enabled.`
      );
      setMode("select");
    }
  };

  const handleGenerateKeywords = async () => {
    setGenerationType("keywords");
    setMode("loading");

    try {
      await destroyPromptSession();
      // Extract page content
      const pageContent = await extractPageContent();
      setCurrentUrl(pageContent.url);

      // Summarize content (using textContent for better context efficiency)
      const summary = await summarizeWebContent(pageContent.textContent, {
        url: pageContent.url,
        title: pageContent.title,
      });

      // Generate keywords
      const keywordsText = await generateKeywords(summary);

      setKeywords(keywordsText);
      setMode("result");
    } catch (error) {
      console.error("Error generating keywords:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Error generating keywords: ${errorMessage}\n\nMake sure Chrome's built-in AI features are available and enabled.`
      );
      setMode("select");
    }
  };

  const handleGenerateReddit = async () => {
    setGenerationType("reddit");
    setMode("loading");

    try {
      await destroyPromptSession();
      const pageContent = await extractPageContent();
      setCurrentUrl(pageContent.url);
      const summary = await summarizeWebContent(pageContent.textContent, {
        url: pageContent.url,
        title: pageContent.title,
      });

      const redditText = await generateRedditPost(summary, {
        url: pageContent.url,
        title: pageContent.title,
      });

      setRedditContent(redditText);
      setMode("result");
    } catch (error) {
      console.error("Error generating reddit post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Error generating reddit post: ${errorMessage}\n\nMake sure Chrome's built-in AI features are available and enabled.`
      );
      setMode("select");
    }
  };

  const handleDownloadBlog = () => {
    if (!blogContent) return;

    const blob = new Blob([blogContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    setMode("select");
    setBlogContent("");
    setKeywords("");
    setRedditContent("");
    setGenerationType(null);
  };

  if (mode === "select") {
    return (
      <div className={`app ${isDarkMode ? "dark" : "light"}`}>
        <div className="container">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1 className="title">SEO Content Generator</h1>
          <p className="subtitle">Choose what you'd like to generate</p>
          <SourceBar url={currentUrl} onRefresh={refreshPageInfo} />
          <div className="options">
            <TitileSubtitleTile title="Generate Blog" subtitle="Generate SEO optimized blog post for your website" icon="/blog.svg" onClick={() => setMode("blog")} />
            <TitileSubtitleTile title="Generate Keywords" subtitle="Generate SEO optimized keywords for your website" icon="/keyword-research.svg" onClick={handleGenerateKeywords} />
            <TitileSubtitleTile title="Generate Reddit Post" subtitle="Generate SEO optimized Reddit post for your website" icon="/reddit.svg" onClick={handleGenerateReddit} />
          </div>
        </div>
      </div>
    );
  }

  if (mode === "blog") {
    return (
      <div className={`app ${isDarkMode ? "dark" : "light"}`}>
        <div className="container">
          <Button variant="ghost" className="back-button" onClick={handleBack}>
            ← Back
          </Button>

          <SourceBar url={currentUrl} onRefresh={refreshPageInfo} />

          <SectionTitle>Select Blog Category</SectionTitle>

          <div className="categories">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                className="category-button"
                onClick={() => handleGenerateBlog(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "loading") {
    return (
      <div className={`app ${isDarkMode ? "dark" : "light"}`}>
        <div className="container">
          <SourceBar url={currentUrl} onRefresh={refreshPageInfo} />
          <Loading
            text={
              generationType === "blog"
                ? "Generating your blog post..."
                : generationType === "reddit"
                ? "Generating reddit post..."
                : "Generating keywords..."
            }
          />
        </div>
      </div>
    );
  }

  if (mode === "result") {
    return (
      <div className={`app ${isDarkMode ? "dark" : "light"}`}>
        <div className="container">
          <Button variant="ghost" className="back-button" onClick={handleBack}>
            ← Back
          </Button>

          <SourceBar url={currentUrl} onRefresh={refreshPageInfo} />

          {blogContent ? (
            <>
              <ResultHeader
                title="Generated Blog Post"
                actionLabel="⬇ Download Blog"
                onAction={handleDownloadBlog}
              />

              <div className="result-content markdown-content">
                <Markdown>{blogContent}</Markdown>
              </div>
            </>
          ) : redditContent ? (
            <>
              <ResultHeader
                title="Generated Reddit Post"
                actionLabel="📋 Copy"
                onAction={async () => {
                  try {
                    await navigator.clipboard.writeText(redditContent);
                  } catch (e) {}
                }}
              />

              <div className="result-content keywords-content">
                <pre>{redditContent}</pre>
              </div>
            </>
          ) : (
            <>
              <SectionTitle>Generated Keywords</SectionTitle>
              <div className="result-content keywords-content">
                <pre>{keywords}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function TitileSubtitleTile(
  { title, subtitle, icon, onClick }: { title: string, subtitle: string, icon: string, onClick: () => void }
) {
  return (
    <Button className="blog-button" onClick={onClick}>
      <img src={icon} alt={title} className="icon" />
      <div className="col">
        <p className="button-text">{title}</p>
        <p className="button-subtext">{subtitle}</p>
      </div>
    </Button>
  );
}
