let apiKeyResetTimeout = null;

// ✅ Clear and set timeout for API key removal
function setupApiKeyReset() {
  if (apiKeyResetTimeout) {
    clearTimeout(apiKeyResetTimeout);
  }

  const delay = 180000; // 3 minutes

  apiKeyResetTimeout = setTimeout(() => {
    chrome.storage.sync.remove("geminiApiKey", () => {
      console.log("API key cleared due to timeout");
    });
  }, delay);
}

// ✅ Handle incoming messages (avoids duplicate listeners)
function handleMessages(request, sender, sendResponse) {
  if (request.action === "saveApiKey") {
    chrome.storage.sync.set(
      { geminiApiKey: request.apiKey },
      () => {
        sendResponse({
          success: true,
          message: "API key saved successfully",
        });
      }
    );

    // Start/reset timeout whenever API key is saved
    setupApiKeyReset();
    return true; // Keep the message channel open
  }
}

// ✅ Listener: Add only if not already added
if (!chrome.runtime.onMessage.hasListener(handleMessages)) {
  chrome.runtime.onMessage.addListener(handleMessages);
}

// ✅ Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("geminiApiKey", (data) => {
    if (!data.geminiApiKey) {
      chrome.runtime.openOptionsPage();
    }
  });
});

// ✅ Listener: Clear API key when tabs change (avoid re-registering)
function handleTabChange(activeInfo) {
  chrome.storage.sync.remove("geminiApiKey", () => {
    console.log("API key cleared due to tab change");
  });
}

if (!chrome.tabs.onActivated.hasListener(handleTabChange)) {
  chrome.tabs.onActivated.addListener(handleTabChange);
}
