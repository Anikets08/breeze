// Utility functions for content extraction
export interface PageContent {
  title: string;
  url: string;
  textContent: string;
  htmlContent: string;
}

export async function extractPageContent(): Promise<PageContent> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.id) {
    throw new Error("No active tab found");
  }

  // Inject script to extract content
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Extract clean text content (better for small context windows)
      let text =
        document.body?.innerText ?? document.documentElement.innerText ?? "";

      // Clean up text: remove extra whitespace, normalize line breaks
      text = text
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, "\n") // Remove empty lines
        .trim();

      const data = {
        title: document.title,
        url: window.location.href,
        textContent: text,
        htmlContent: "", // Not using HTML for Gemini Nano's small context window
      };

      return data;
    },
  });
  console.log("results", results);
  if (!results || !results[0]?.result) {
    throw new Error("Failed to extract page content");
  }

  return results[0].result;
}
