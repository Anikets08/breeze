import { useCallback, useEffect, useState } from "react";
import "./App.css";
import MainAnimation from "../assets/main-animation.json";
import Lottie from "lottie-react";

type Result = { text: string; meta?: Record<string, unknown> } | null;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [mode, setMode] = useState<"blog" | "keywords">("blog");
  const [category, setCategory] = useState<
    | "Educational/How-to Content"
    | "Use Case Articles"
    | "Problem-Solution Articles"
    | "Best Practices and Tips"
    | "Case Studies and Success Stories"
    | null
  >(null);

  // Theme-aware colors
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : true
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    // Safari uses 'change'; older browsers may need addListener
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if ((mq as any).addListener) (mq as any).addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else if ((mq as any).removeListener) (mq as any).removeListener(handler);
    };
  }, []);

  const COLOR_TEXT = isDark ? "#D9D9D9" : "#1B1B1B";
  const COLOR_MUTE = isDark ? "rgba(217, 217, 217, 0.65)" : "rgba(0,0,0,0.55)";
  const COLOR_BORDER = isDark
    ? "rgba(217, 217, 217, 0.12)"
    : "rgba(0,0,0,0.10)";
  const COLOR_ACCENT = "#6E7BFF";
  const COLOR_ACCENT_DIM = isDark
    ? "rgba(110, 123, 255, 0.18)"
    : "rgba(110,123,255,0.12)";

  const handleSubmit = useCallback(async () => {
    setResult(null);
    setLoading(true);
    try {
      const ai = await import("@/lib/ai/tasks");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      let pageText = "";
      let pageMeta: { title?: string; url?: string } = {};
      if (tab?.id) {
        try {
          const content = await chrome.tabs.sendMessage(tab.id, {
            type: "breeze:getContent",
          });
          if (content?.ok) {
            pageText =
              content.selection && content.selection.trim().length > 0
                ? content.selection
                : content.text || "";
            pageMeta = { title: content.title, url: content.url };
          }
        } catch (err) {
          // Receiving end does not exist -> no content script on this page (chrome://, file://, or not matched)
          pageText = "";
        }
      }
      if (mode === "blog") {
        if (!category) throw new Error("Please select a blog category");
        const summary = await ai.summarizeWebContent(pageText, pageMeta);
        const markdown = await ai.generateSeoMarkdown(
          summary,
          category,
          pageMeta
        );
        setResult({ text: markdown });
      } else if (mode === "keywords") {
        const summary = await ai.summarizeWebContent(pageText, pageMeta);
        const keywords = await ai.generateKeywords(summary);
        setResult({ text: keywords });
      }
    } catch (e: any) {
    } finally {
      setLoading(false);
    }
  }, [mode, category]);

  const download = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = (category || "blog") + "-" + Date.now() + "-breeze.md";
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: COLOR_TEXT,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
      }}
    >
      <Lottie
        animationData={MainAnimation}
        loop={true}
        style={{ width: "80%", height: "100%", alignSelf: "center" }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>
          Breeze
        </div>
        <div style={{ fontSize: 12, color: COLOR_MUTE }}>
          Generate SEO content from any page
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid ${COLOR_BORDER}`,
          borderRadius: 10,
          width: "100%",
          marginBottom: 16,
        }}
      >
        {[
          { key: "blog", label: "Blog" },
          { key: "keywords", label: "Keywords" },
        ].map((opt) => {
          const active = mode === (opt.key as typeof mode);
          return (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key as any)}
              disabled={loading}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${active ? COLOR_ACCENT : "transparent"}`,
                background: active ? COLOR_ACCENT_DIM : "transparent",
                color: COLOR_TEXT,
                cursor: "pointer",
                width: "100%",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {mode === "blog" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 8,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COLOR_BORDER}`,
            borderRadius: 10,
            padding: 8,
          }}
        >
          <div style={{ fontSize: 12, color: COLOR_MUTE }}>Select category</div>
          {[
            "Educational/How-to Content",
            "Use Case Articles",
            "Problem-Solution Articles",
            "Best Practices and Tips",
            "Case Studies and Success Stories",
          ].map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c as any)}
                disabled={loading}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  textAlign: "left",
                  border: `1px solid ${selected ? COLOR_ACCENT : COLOR_BORDER}`,
                  background: selected ? COLOR_ACCENT_DIM : "transparent",
                  color: COLOR_TEXT,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => handleSubmit()}
        disabled={loading || (mode === "blog" && !category)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border:
            loading || (mode === "blog" && !category)
              ? "none"
              : `1px solid ${COLOR_ACCENT}`,
          background: loading
            ? COLOR_ACCENT
            : mode === "blog" && !category
            ? isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)"
            : COLOR_ACCENT,
          color: loading
            ? "#0B0B0B"
            : mode === "blog" && !category
            ? isDark
              ? "rgba(217,217,217,0.6)"
              : "rgba(0,0,0,0.45)"
            : "white",
          fontWeight: 600,
          width: "100%",
          cursor:
            loading || (mode === "blog" && !category) ? "default" : "pointer",
          marginTop: 16,
          opacity: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {loading && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 50 50"
            style={{ display: "inline-block" }}
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="#0B0B0B"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="90 150"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 25 25"
                to="360 25 25"
                dur="0.9s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        )}
        {loading ? "Generating..." : "Generate"}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {mode === "blog" && result?.text && (
          <button
            onClick={download}
            style={{
              alignSelf: "flex-start",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${COLOR_BORDER}`,
              background: "transparent",
              color: COLOR_TEXT,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Download .md
          </button>
        )}
      </div>
    </div>
  );
}
