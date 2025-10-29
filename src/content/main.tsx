// Breeze: respond with current selection and page HTML/text
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "breeze:getContent") return;
  try {
    const sel = window.getSelection?.();
    const selection = sel?.toString() ?? "";
    let selectionHtml = "";
    try {
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        const div = document.createElement("div");
        div.appendChild(range.cloneContents());
        selectionHtml = div.innerHTML;
      }
    } catch {}
    const text = document.body?.innerText ?? "";
    const html = document.documentElement?.outerHTML ?? "";
    const trimmed = text.length > 8000 ? text.slice(0, 8000) : text;
    sendResponse({
      ok: true,
      title: document.title,
      url: location.href,
      selection,
      selectionHtml,
      text: trimmed,
      html,
    });
  } catch (e) {
    sendResponse({
      ok: false,
      error: (e as Error).message || "Failed to read page content",
    });
  }
  // Indicate async response not needed
  return false;
});
