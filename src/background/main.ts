// Background service worker for Chrome extension
// Handles sidepanel opening per tab

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Ensure sidepanel is tab-specific
// Note: Sidepanel state is automatically tab-specific in Chrome
// This listener is kept for potential future tab-specific logic
chrome.tabs.onActivated.addListener(async () => {
  // Sidepanel state is automatically tab-specific in Chrome
});

