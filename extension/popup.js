document.getElementById('actionButton').addEventListener('click', async () => {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.id) {
      throw new Error('No active tab found');
    }

    // Execute script in the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        alert('Hello from the extension!');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
});