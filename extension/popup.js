// Define your Next.js API URL
const API_URL = 'http://localhost:3000/api'; // Update this with your actual URL in production

document.getElementById('actionButton').addEventListener('click', async () => {
  try {
    // Call the Next.js API
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error('No active tab found');
    }

    // Execute script in the active tab to show the message
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (message) => {
        alert(message);
      },
      args: [data.message]
    });
  } catch (error) {
    console.error('Error:', error);
  }
});