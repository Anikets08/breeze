// Copy of examples.ts functions adapted for Chrome extension context
type TaskResult = { text: string; meta?: Record<string, unknown> };

async function ensureTask<T>(taskKey: string): Promise<T> {
  const capitalized = taskKey.charAt(0).toUpperCase() + taskKey.slice(1);
  return (self as any)[capitalized] as T;
}

export type Availability =
  | { status: "ready" }
  | { status: "downloadable" | "downloading" }
  | { status: "unavailable" };

export async function ensureLanguageModelAvailability(): Promise<Availability> {
  try {
    // Check both self and window for Chrome AI APIs
    const LM: any =
      (self as any).LanguageModel || (window as any).LanguageModel;
    if (!LM) return { status: "unavailable" };
    const availability = await LM.availability();
    if (availability === "available") return { status: "ready" };
    if (availability === "downloadable" || availability === "downloading") {
      return { status: availability } as const;
    }
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

let sharedPromptSession: any | null = null;

async function getPromptSession(): Promise<any> {
  // Check both self and window for Chrome AI APIs
  const LM: any = (self as any).LanguageModel || (window as any).LanguageModel;
  if (!LM) throw new Error("Prompt API not available");
  if (sharedPromptSession) return sharedPromptSession;
  sharedPromptSession = await LM.create();
  return sharedPromptSession;
}

export async function destroyPromptSession(): Promise<void> {
  try {
    await sharedPromptSession?.destroy?.();
  } finally {
    sharedPromptSession = null;
  }
}

export async function prompt(
  input: string,
  options?: Record<string, unknown>
): Promise<TaskResult> {
  // Check both self and window for Chrome AI APIs
  const hasLanguageModel =
    (typeof self !== "undefined" &&
      ((self as any).LanguageModel || (window as any).LanguageModel)) ||
    (typeof window !== "undefined" && (window as any).LanguageModel);

  if (hasLanguageModel) {
    const avail = await ensureLanguageModelAvailability();
    if (avail.status === "unavailable") {
      throw new Error("Prompt API is unavailable on this device/browser");
    }
    const session = await getPromptSession();
    const text: string = await session.prompt(input, options ?? {});
    return { text };
  }

  // Fallback to window.ai.prompt if available
  if (typeof window !== "undefined" && (window as any).ai?.prompt) {
    const promptApi = await ensureTask<any>("prompt");
    const session = await promptApi.create();
    const text: string = await session.prompt(input, options ?? {});
    return { text };
  }

  throw new Error(
    "No AI API available. Please ensure Chrome's built-in AI features are enabled."
  );
}

export async function summarize(
  input: string,
  options?: Record<string, unknown>
): Promise<TaskResult> {
  // Check both self and window for Chrome AI APIs
  const Summarizer: any =
    (typeof self !== "undefined" &&
      ((self as any).Summarizer || (window as any).Summarizer)) ||
    (typeof window !== "undefined" && (window as any).Summarizer) ||
    null;

  if (Summarizer) {
    const instance = await Summarizer.create({ ...(options ?? {}) });
    const text: string = await instance.summarize(input);
    await instance.destroy?.();
    return { text };
  }

  // Fallback to ensureTask
  try {
    const summarizer = await ensureTask<any>("summarizer");
    const instance = await summarizer.create(options ?? {});
    const text: string = await instance.summarize(input, options ?? {});
    return { text };
  } catch {
    throw new Error(
      "Summarizer API not available. Please ensure Chrome's built-in AI features are enabled."
    );
  }
}

/**
 * Truncate content intelligently for small context windows
 * Keeps the beginning and end, removes middle if too long
 */
function truncateContent(content: string, maxLength: number = 12000): string {
  if (content.length <= maxLength) return content;

  // Keep first 60% and last 30% of allowed length
  const keepStart = Math.floor(maxLength * 0.6);
  const keepEnd = Math.floor(maxLength * 0.3);
  const removeStart = content.length - keepEnd;

  return `${content.slice(
    0,
    keepStart
  )}\n\n[... content truncated ...]\n\n${content.slice(removeStart)}`;
}

export async function summarizeWebContent(
  content: string,
  meta?: { url?: string; title?: string }
): Promise<string> {
  if (!content || !content.trim()) return "";

  // Truncate content for small context windows (Gemini Nano)
  const truncatedContent = truncateContent(content.trim(), 12000);

  try {
    const res = await summarize(truncatedContent, {
      type: "key-points",
      format: "markdown",
    });
    return res.text;
  } catch {
    // Optimized prompt for small context windows - concise and direct
    const sys = `Summarize the web page into concise key points. Output markdown bullets only.`;
    const title = meta?.title ? `Title: ${meta.title}` : "";
    const input = `${sys}\n${title}\n\nContent:\n${truncatedContent}`;
    const { text } = await prompt(input, { temperature: 0.1 });
    return text;
  }
}

export type BlogCategory =
  | "Educational/How-to Content"
  | "Use Case Articles"
  | "Problem-Solution Articles"
  | "Best Practices and Tips"
  | "Case Studies and Success Stories";


const prompt1 = `Create SEO-optimized markdown blog post. Requirements:
- H1 title first
- Meta description as HTML comment
- Clear H2/H3 sections
- Natural keyword integration
- Intro, body, conclusion with CTA
- Use only provided facts
- Markdown only, no extra text`;

const prompt2= `You are a blog writing assistant. 
Write a complete SEO-optimized markdown article with the following structure:
- H1: Compelling, keyword-rich title
- Engaging intro summarizing the topic and reader benefit.
- Use clear H2 and H3 headings.
- Explain key points naturally using keywords from context.
- Summarize and end with a short call to action (CTA).
Rules:
- Output markdown only (no explanations or comments)
- Be factual; use only info from summary
- Keep sentences short and natural
- Avoid repetition or generic filler
- Maintain coherent flow`;

const redditPrompt = `
You are writing a Reddit post for a relevant subreddit.
Write in a natural, human tone — no marketing or promotional language.
Be curious, authentic, and informal, like a real Redditor sharing insights or asking for feedback.

Rules:
- Keep it under 300 words.
- Start with a relatable hook or question.
- Use short paragraphs for readability.
- Avoid hashtags, emojis, or marketing tone.
- Optionally end with an open-ended question to invite discussion.

Use only the facts or ideas from the provided content summary.
Output plain text only (no markdown or HTML).
`;

export async function generateSeoMarkdown(
  summary: string,
  category: BlogCategory,
  meta?: { url?: string; title?: string }
): Promise<string> {
  // Optimized prompt for small context windows - more concise
  const sys = prompt2;

  // Truncate summary if too long (keep it well under context limit)
  const truncatedSummary =
    summary.length > 4000
      ? `${summary.slice(0, 4000)}\n[... summary truncated ...]`
      : summary;

  const promptBody = `Category: ${category}
${meta?.title ? `Source: ${meta.title}` : ""}

Summary:
${truncatedSummary}

Write the complete markdown article:`;

  const { text } = await prompt(`${sys}\n\n${promptBody}`, {
    temperature: 0.3,
  });
  return text;
}

export async function generateKeywords(summary: string): Promise<string> {
  // Truncate summary if too long
  const truncatedSummary =
    summary.length > 3000
      ? `${summary.slice(0, 3000)}\n[... truncated ...]`
      : summary;

  // Concise prompt for small context windows
  const { text } = await prompt(
    `Extract 15-25 SEO keywords/keyphrases. Return comma-separated list only.\n\n${truncatedSummary}`,
    { temperature: 0.2 }
  );
  return text;
}

export async function generateRedditPost(
  summary: string,
  meta?: { url?: string; title?: string }
): Promise<string> {
  // Truncate summary if too long
  const truncatedSummary =
    summary.length > 3000
      ? `${summary.slice(0, 3000)}\n[... truncated ...]`
      : summary;

  const promptBody = `${redditPrompt}\n\n${meta?.title ? `Source: ${meta.title}\n` : ""}Summary:\n${truncatedSummary}`;

  const { text } = await prompt(promptBody, { temperature: 0.3 });
  return text;
}
