// WebSocket connection
let ws;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function initializeWebSocket() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received data:', data);

            // Handle Kinesis action data
            if (data.type === 'kinesis' && data.workflow) {
                // Open each URL in a new tab
                data.workflow.urls.forEach(url => {
                    chrome.tabs.create({ url: url });
                });
            }
            
            // Handle low focus trigger
            if (data.type === 'triggerScreenshot') {
                // Get current window and tab
                chrome.windows.getCurrent(async (window) => {
                    // Open the popup
                    chrome.action.openPopup();
                    
                    // Wait a short moment for popup to open
                    setTimeout(() => {
                        // Simulate clicking the test button
                        chrome.runtime.sendMessage({ action: "triggerScreenshot" });
                    }, 500);
                });
            }

            // Handle closing the popup
            if (data.type === 'closePopup') {
                chrome.windows.getCurrent(async (window) => {
                    // chrome.action.closePopup();
                    chrome.runtime.sendMessage({ action: "closePopup" });
                    
                    // Wait a short moment for popup to close
                    setTimeout(() => {
                    }, 500);
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            setTimeout(initializeWebSocket, timeout);
        }
    };
}

// Initialize WebSocket when the background script starts
initializeWebSocket();

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed or updated');
}); 