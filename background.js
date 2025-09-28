chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("geminiApiKey", (data) => {
    if (!data.geminiApiKey) {
      chrome.runtime.openOptionsPage();
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveApiKey") {
    chrome.storage.sync.set({ geminiApiKey: request.apiKey }, () => {
      sendResponse({ success: true, message: "API key saved successfully" });
    });
    return true;
  }
});
