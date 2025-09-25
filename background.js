let apiKeyResetTimeout;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get("geminiApiKey", (data) => {
        if (!data.geminiApiKey) {
            chrome.runtime.openOptionsPage();
        }
    });
});

function setupApiKeyReset() {
    if (apiKeyResetTimeout) {
        clearTimeout(apiKeyResetTimeout);
    }
    
    const delay = 180000;
    
    apiKeyResetTimeout = setTimeout(() => {
        chrome.storage.sync.remove("geminiApiKey", () => {
            console.log("API key cleared due to timeout");
        });
        
        setupApiKeyReset();
    }, delay);
}

setupApiKeyReset();

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.storage.sync.remove("geminiApiKey", () => {
        console.log("API key cleared due to tab change");
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveApiKey") {
        chrome.storage.sync.set({geminiApiKey: request.apiKey}, () => {
            sendResponse({success: true, message: "API key saved successfully"});
        });
        return true;
    }
});