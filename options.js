document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["geminiApiKey"], ({geminiApiKey}) => {
        if (geminiApiKey) {
            document.getElementById("gemini-api-key-input").value = geminiApiKey;
        }
    });
    
    document.getElementById("save-api-key").addEventListener("click", () => {
        const geminiApiKey = document.getElementById("gemini-api-key-input").value;
        if(!geminiApiKey) {
            document.getElementById("status-message").textContent = "Please enter an API key";
            return;
        }
        
        chrome.runtime.sendMessage({action: "saveApiKey", apiKey: geminiApiKey}, (response) => {
            if (response && response.success) {
                document.getElementById("status-message").textContent = response.message;
            } else {
                document.getElementById("status-message").textContent = response ? response.message : "Failed to save API key";
            }
        });
    });
});