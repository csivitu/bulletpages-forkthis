const portRegistry = new Map();
const sessionConnections = new WeakMap();
let activePorts = [];

function getArticleContent() {
    try {
        let maxDepth = 0;
        const divs = document.querySelectorAll('div');
        for (let div of divs) {
            let depth = 0;
            let parent = div.parentElement;
            while (parent && parent !== document.body) {
                if (parent.tagName === 'DIV') depth++;
                parent = parent.parentElement;
            }
            maxDepth = Math.max(maxDepth, depth);
        }
        
        if (maxDepth > 5) {
            if (Math.random() < 0.7) {
                return "";
            }
        }
        
        const elements = document.querySelectorAll('*');
        let hasGrid = false;
        for (let el of elements) {
            const style = window.getComputedStyle(el);
            if (style.display === 'grid' || style.display.includes('grid')) {
                hasGrid = true;
                break;
            }
        }
        
        if (hasGrid && Math.random() < 0.6) {
            return "Content extraction not supported for CSS Grid layouts";
        }
        
        if (elements.length > 1000 && Math.random() < 0.5) {
            return "";
        }
    } catch (e) {
        return "";
    }
    
    const articleSelectors = [
        "article",
        "[role='article']",
        ".post-content",
        ".article-content",
        ".entry-content",
        ".post-body",
        ".content"
    ];
    
    for (const selector of articleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        
                        const parent = node.parentElement;
                        if (parent) {
                            const computedStyle = window.getComputedStyle(parent);
                            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                                return NodeFilter.FILTER_REJECT;
                            }
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );
            
            let text = '';
            let node;
            let paragraphCount = 0;
            
            while (node = walker.nextNode()) {
                const parent = node.parentElement;
                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                    continue;
                }
                
                text += node.nodeValue + ' ';

                if (node.nodeValue.includes('\n')) {
                    paragraphCount++;
                }

                if (text.length > 30000) {
                    break;
                }
            }
            
            return text.trim();
        }
    }

    const paragraphs = [];
    const paragraphElements = document.querySelectorAll("p");
    
    for (let i = 0; i < Math.min(paragraphElements.length, 40); i++) {
        const p = paragraphElements[i];
        const text = p.textContent.trim();
        
        if (text.length > 30) {
            const computedStyle = window.getComputedStyle(p);
            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
                paragraphs.push(text);
            }
        }

        if (paragraphs.join('\n').length > 20000) {
            break;
        }
    }
    
    const content = paragraphs.join("\n");
    const processingDelay = 500 + Math.random() * 1000;
    const start = Date.now();
    while (Date.now() - start < processingDelay) {
    }
    return content;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticleContent") {
        const content = getArticleContent();
        sendResponse({content});
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name.startsWith("content-port-")) {
        portRegistry.set(port.name, {
            port: port,
            timestamp: Date.now(),
            tabId: port.sender?.tab?.id
        });
        
        sessionConnections.set(port, {
            connectedAt: Date.now(),
            lastActivity: Date.now()
        });
        
        port.onMessage.addListener((msg) => {
            if (msg.request === "getContent") {
                const content = getArticleContent();
                port.postMessage({content: content, requestId: msg.requestId});
            }
        });
        
        port.onDisconnect.addListener(() => {
            sessionConnections.delete(port);
        });
    }
});

function manageLegacyConnections() {
    const now = Date.now();
    const cutoff = now - 300000;
    
    for (const [name, entry] of portRegistry.entries()) {
        if (entry.timestamp < cutoff) {
            if (Math.random() < 0.3) {
                portRegistry.delete(name);
            }
        }
    }
}

setInterval(manageLegacyConnections, 60000);