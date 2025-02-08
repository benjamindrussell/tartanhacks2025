document.addEventListener('DOMContentLoaded', function() {
    const testButton = document.getElementById('testButton');
    const responseContainer = document.getElementById('responseContainer');

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "triggerScreenshot") {
            testButton.click();
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "closePopup") {
            window.close();
        }
    });
  

    async function captureScreen() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 100 });
            
            // Convert data URL to base64
            const base64Image = screenshot.split(',')[1];
            return base64Image;
        } catch (error) {
            throw new Error('Failed to capture screenshot: ' + error.message);
        }
    }

    testButton.addEventListener('click', async () => {
        try {
            testButton.disabled = true;
            responseContainer.textContent = 'Capturing screenshot...';

            const screenshot = await captureScreen();
            responseContainer.textContent = 'Analyzing screenshot...';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "This is a screenshot of what the user is currently working on. Based on what you see in this image, provide 2-3 concise sentences suggesting how they should best proceed with their work. Be specific but brief."
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        "url": `data:image/jpeg;base64,${screenshot}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 300
                })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            const result = data.choices[0].message.content;
            responseContainer.textContent = result;
        } catch (error) {
            responseContainer.textContent = `Error: ${error.message}`;
        } finally {
            testButton.disabled = false;
        }
    });
});

// Set interval to decrease focus over time
setInterval(() => updateFocus(true), 30000); // Decrease focus every 30 seconds of inactivity

async function loadWorkflows() {
  try {
    const response = await fetch('http://localhost:5050/api/workflows');
    const workflows = await response.json();
    
    const activeWorkflows = workflows.filter(w => w.active);
    const recentWorkflows = workflows.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Update active workflows
    const activeContainer = document.getElementById('activeWorkflows');
    activeContainer.innerHTML = activeWorkflows.map(workflow => `
      <div class="workflow-item">
        <div class="workflow-text">${workflow.description}</div>
        <input type="checkbox" 
               class="workflow-checkbox" 
               data-id="${workflow._id}" 
               ${workflow.active ? 'checked' : ''}
               onchange="toggleWorkflowActive('${workflow._id}')">
      </div>
    `).join('') || '<div class="workflow-text">No active workflows</div>';

    // Update recent workflows
    const recentContainer = document.getElementById('recentWorkflows');
    recentContainer.innerHTML = recentWorkflows.map(workflow => `
      <div class="workflow-item">
        <div class="workflow-text">${workflow.description}</div>
        <input type="checkbox" 
               class="workflow-checkbox" 
               data-id="${workflow._id}" 
               ${workflow.active ? 'checked' : ''}
               onchange="toggleWorkflowActive('${workflow._id}')">
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading workflows:', error);
  }
}

async function toggleWorkflowActive(id) {
  try {
    await fetch(`http://localhost:5050/api/workflows/${id}/toggle-active`, {
      method: 'PATCH'
    });
    loadWorkflows(); // Refresh the display
  } catch (error) {
    console.error('Error toggling workflow:', error);
  }
}

// Load workflows when popup opens
document.addEventListener('DOMContentLoaded', loadWorkflows);
