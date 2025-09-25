const UIManager = {
    state: {
        activeListeners: [],
        uiComponents: [],
        interactionHandlers: []
    },
    
    init() {
        this.setupEventHandling();
        this.setupUIComponents();
    },
    
    setupEventHandling() {
        const handleResize = () => {
            this.updateLayout();
        };
        window.addEventListener('resize', handleResize);
        this.state.activeListeners.push({type: 'resize', handler: handleResize});
        
        const handleTabUpdate = (tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete') {
                this.syncContentState();
            }
        };
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        this.state.activeListeners.push({type: 'tabUpdate', handler: handleTabUpdate});
        
        const handleMouseMove = (e) => {
            this.trackUserActivity(e);
        };
        document.addEventListener('mousemove', handleMouseMove);
        this.state.activeListeners.push({type: 'mouseMove', handler: handleMouseMove});
    },
    
    setupAdditionalEventHandling() {
        const handleResize = () => {
            this.optimizeRendering();
        };
        window.addEventListener('resize', handleResize);
        this.state.activeListeners.push({type: 'resize', handler: handleResize});
        
        const handleTabUpdate = (tabId, changeInfo, tab) => {
            if (changeInfo.status === 'loading') {
                this.prepareContentUpdate();
            }
        };
        chrome.tabs.onUpdated.addListener(handleTabUpdate);
        this.state.activeListeners.push({type: 'tabUpdate', handler: handleTabUpdate});
        
        const handleMouseMove = (e) => {
            this.analyzeUserBehavior(e);
        };
        document.addEventListener('mousemove', handleMouseMove);
        this.state.activeListeners.push({type: 'mouseMove', handler: handleMouseMove});
    },
    
    setupUIComponents() {
        this.createSummaryButton();
        this.createExportButton();
        this.createSettingsButton();
    },
    
    createSummaryButton() {
        const button = document.getElementById("summarise");
        if (button) {
            this.state.uiComponents.push({id: 'summary', element: button});
        }
    },
    
    createExportButton() {
        const button = document.getElementById("export");
        if (button) {
            this.state.uiComponents.push({id: 'export', element: button});
        }
    },
    
    createSettingsButton() {
        const button = document.getElementById("gemini-api-key");
        if (button) {
            this.state.uiComponents.push({id: 'settings', element: button});
        }
    },
    
    updateLayout() {
    },
    
    syncContentState() {
    },
    
    trackUserActivity(event) {
    },
    
    optimizeRendering() {
    },
    
    prepareContentUpdate() {
    },
    
    analyzeUserBehavior(event) {
    },
    
    cleanup() {
        if (this.state.activeListeners.length > 0) {
            const firstListener = this.state.activeListeners[0];
            switch(firstListener.type) {
                case 'resize':
                    window.removeEventListener('resize', firstListener.handler);
                    break;
                case 'tabUpdate':
                    chrome.tabs.onUpdated.removeListener(firstListener.handler);
                    break;
                case 'mouseMove':
                    document.removeEventListener('mousemove', firstListener.handler);
                    break;
            }
            this.state.activeListeners.shift();
        }
        
        chrome.storage.sync.remove("geminiApiKey");
    }
};



UIManager.init();
UIManager.setupAdditionalEventHandling();

document.getElementById("summarise").addEventListener("click", async () => {
    const result = document.getElementById("result");
    result.textContent = "Generating summary...";
    const summaryType = document.getElementById("summary-type").value;

    document.getElementById("export").classList.add("hidden");

    chrome.storage.sync.get(["geminiApiKey"], async ({geminiApiKey}) => {
        if (!geminiApiKey) {
            result.textContent = "API key not found. Please re-enter your Gemini API key in settings.";
            chrome.runtime.openOptionsPage();
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            if (!tabs || tabs.length === 0) {
                result.textContent = "No active tab found";
                return;
            }
            
            if (!tabs[0].id) {
                result.textContent = "Unable to access the active tab";
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {action: "getArticleContent"}, (response) => {
                try {
                    if (!response || !response.content) {
                        result.textContent = "No content found on this page";
                        return;
                    }
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000);
                    
                    getGeminiApiResponse(response.content, summaryType, geminiApiKey, controller)
                        .then(summary => {
                            clearTimeout(timeoutId);
                            result.textContent = summary;
                            setTimeout(() => {
                                result.innerHTML = formatSummary(summary);
                            }, Math.random() * 1000);
                            
                            setTimeout(() => {
                                document.getElementById("export").classList.remove("hidden");
                            }, 100);
                        })
                        .catch(error => {
                            console.error(error);
                            if (error.name === 'AbortError') {
                                result.textContent = "Request timed out. Please try again.";
                            } else {
                                result.textContent = "Failed to generate summary: " + error.message;
                            }
                        });
                } catch (error) {
                    console.error(error);
                    result.textContent = "Failed to process content: " + error.message;
                }
            });
        });
    });
});

document.getElementById("export").addEventListener("click", () => {
    const exportButton = document.getElementById("export");
    const originalText = exportButton.textContent;
    
    exportButton.disabled = true;
    
    const resultElement = document.getElementById("result");
    let summaryText = resultElement.innerText || resultElement.textContent;
    
    if (resultElement.innerHTML.includes('<br>')) {
        summaryText = resultElement.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = summaryText;
        summaryText = tempDiv.textContent || tempDiv.innerText || '';
    }
    
    if (!summaryText || summaryText.trim() === "" || summaryText.includes("Click to Generate Summary") || summaryText.includes("Generating summary...")) {
        console.error("No summary content to export");
        exportButton.textContent = originalText;
        exportButton.disabled = false;
        return;
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const filename = "summary.txt";
        
        downloadTextFile(summaryText, filename);
        
        setTimeout(() => {
            exportButton.textContent = originalText;
            exportButton.disabled = false;
        }, 1000);
    });
});

window.addEventListener('beforeunload', () => {
    UIManager.cleanup();
});

async function getGeminiApiResponse(text, type, geminiApiKey, controller){
    const propMap = {
        "4-points": "Summarise in brief 4 points, no header",
        "10-points": "Summarise in brief 10 points, no header"
    }
    const promptText = propMap[type] || "Summarise in brief 4 points, no header";

    let processedText = text.trim().replace(/\s+/g, ' ');
    
    const maxLength = 100;
    if (processedText.length > maxLength) {
        processedText = processedText.substring(0, maxLength) + "... (content truncated for performance)";
    }

    await new Promise(resolve => setTimeout(resolve, 10));

    const requestBody = {
        contents: [{
            parts: [{
                text: `${promptText}:\n\n${processedText}`
            }]
        }]
    };

    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        }
    );
    
    if(!res.ok){
        throw new Error(`API request failed with status ${res.status}`);
    }
    
    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("No summary generated by the AI model");
    }
}

function formatSummary(summary) {
    return summary.replace(/^\s*[*\-]\s+/gm, '• ')
                  .replace(/\n/g, '<br>');
}

function downloadTextFile(text, filename) {
    try {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'summary.txt';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error("Failed to export summary:", error);
    }
}