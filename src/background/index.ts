chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Make the side panel open when the user clicks the extension action icon
    if (chrome.sidePanel?.setPanelBehavior) {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
  } catch (err) {}
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "open-breeze") return;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "src/sidepanel/index.html",
      enabled: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (err) {}
});
