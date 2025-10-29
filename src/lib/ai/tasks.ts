type TaskResult = { text: string; meta?: Record<string, unknown> };

async function ensureTask<T>(taskKey: string): Promise<T> {
  //first character capital
  const capitalized = taskKey.charAt(0).toUpperCase() + taskKey.slice(1);
  return (self as any)[capitalized] as T;
}

// Summarizer
export async function summarize(
  input: string,
  options?: Record<string, unknown>
): Promise<TaskResult> {
  // Prefer global Summarizer if present
  if (typeof self !== "undefined" && (self as any).Summarizer) {
    const Summarizer: any = (self as any).Summarizer;
    const instance = await Summarizer.create({ ...(options ?? {}) });
    const text: string = await instance.summarize(input);
    await instance.destroy?.();
    return { text };
  }
  const summarizer = await ensureTask<any>("summarizer");
  const instance = await summarizer.create(options ?? {});
  const text: string = await instance.summarize(input, options ?? {});
  return { text };
}

// Prompt API (generic LLM prompting)
let sharedPromptSession: any | null = null;

export type Availability =
  | { status: "ready" }
  | { status: "downloadable" | "downloading" }
  | { status: "unavailable" };

export async function ensureLanguageModelAvailability(): Promise<Availability> {
  try {
    const LM: any = (self as any).LanguageModel;
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

async function getPromptSession(): Promise<any> {
  const LM: any = (self as any).LanguageModel;
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
  // Prefer LanguageModel Prompt API if available
  if (typeof self !== "undefined" && (self as any).LanguageModel) {
    const avail = await ensureLanguageModelAvailability();
    if (avail.status === "unavailable") {
      throw new Error("Prompt API is unavailable on this device/browser");
    }
    const session = await getPromptSession();
    const text: string = await session.prompt(input, options ?? {});
    return { text };
  }
  // Fallback to window.ai.prompt
  const promptApi = await ensureTask<any>("prompt");
  const session = await promptApi.create();
  const text: string = await session.prompt(input, options ?? {});
  return { text };
}

// Summarize HTML content into concise key points suitable for SEO blog generation
export async function summarizeWebContent(
  content: string,
  meta?: { url?: string; title?: string }
): Promise<string> {
  if (!content || !content.trim()) return "";
  // Prefer Summarizer if available
  try {
    const res = await summarize(content, {
      type: "key-points",
      format: "markdown",
    });
    return res.text;
  } catch {
    // Fallback to Prompt API summarization
    const sys = `Summarize the following web page HTML into concise, factual key points.
Avoid marketing fluff. Output in markdown bullet points.`;
    const input = `${sys}\nPage: ${meta?.title ?? ""} ${
      meta?.url ?? ""
    }\n\n"""Web content:\n${content}\n"""`;
    const { text } = await prompt(input, { temperature: 0.1 });
    return text;
  }
}

// Generate an SEO-friendly markdown blog post based on a page summary and category
export async function generateSeoMarkdown(
  summary: string,
  category:
    | "Educational/How-to Content"
    | "Use Case Articles"
    | "Problem-Solution Articles"
    | "Best Practices and Tips"
    | "Case Studies and Success Stories",
  meta?: { url?: string; title?: string }
): Promise<string> {
  const sys = `You are an expert technical copywriter. Create a high-quality markdown blog post optimized for SEO.
Requirements:
- Start with an H1 title.
- Include a compelling meta description (as a comment).
- Use clear H2/H3 sections with descriptive headings.
- Weave primary/secondary keywords naturally.
- Include a short intro, actionable body, and a conclusion with CTA.
- Avoid hallucinating product features; stick to the provided summary.
- Use markdown only.
- Directly write the markdown content, don't include any other text or comments.
`;

  const promptBody = `Category: ${category}
Target page: ${meta?.title ?? ""} ${meta?.url ?? ""}

Page summary (facts to rely on):
"""
${summary}
"""

Write the complete markdown article now.`;

  const { text } = await prompt(`${sys}\n\n${promptBody}`, {
    temperature: 0.3,
  });
  return text;
}

export async function generateKeywords(summary: string): Promise<string> {
  const { text } = await prompt(
    `Extract 15-25 high-intent SEO keywords and keyphrases from this summary.
Return as a simple comma-separated list.
"""
${summary}
"""`,
    { temperature: 0.2 }
  );
  return text;
}
