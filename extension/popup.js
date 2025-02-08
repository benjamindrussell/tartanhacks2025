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

// Predefined task types
const tasks = {
  'essay': {
    name: 'Essay Writing',
    checkProgress: {
      wordCount: true
    }
  },
  'email': {
    name: 'Email Writing',
    checkProgress: {
      wordCount: true
    }
  },
  'calendar': {
    name: 'Calendar Event',
    checkProgress: {
      inputActivity: true
    }
  }
};

// Define todo list with just 3 tasks
const todoList = {
  'task1': {
    name: 'Write Research Essay',
    type: 'essay',
    completed: false
  },
  'task2': {
    name: 'Write Project Update Email',
    type: 'email',
    completed: false
  },
  'task3': {
    name: 'Schedule Team Meeting',
    type: 'calendar',
    completed: false
  }
};

async function checkEssayProgress(taskId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Debug which selectors are present
        console.log('Available elements:', {
          'kix-appview-editor': !!document.querySelector('.kix-appview-editor'),
          'docs-editor-container': !!document.querySelector('.docs-editor-container'),
          'kix-paragraphrenderer': document.querySelectorAll('.kix-paragraphrenderer').length,
          'docs-editor': !!document.querySelector('.docs-editor')
        });

        let content = '';
        let sourceSelector = '';

        // Try each selector and log which one worked
        if (document.querySelector('.kix-appview-editor')) {
          content = document.querySelector('.kix-appview-editor').innerText;
          sourceSelector = 'kix-appview-editor';
        } else if (document.querySelector('.docs-editor-container')) {
          content = document.querySelector('.docs-editor-container').innerText;
          sourceSelector = 'docs-editor-container';
        } else if (document.querySelectorAll('.kix-paragraphrenderer').length) {
          content = Array.from(document.querySelectorAll('.kix-paragraphrenderer'))
            .map(p => p.innerText)
            .join('\n');
          sourceSelector = 'kix-paragraphrenderer';
        } else if (document.querySelector('.docs-editor')) {
          content = document.querySelector('.docs-editor').innerText;
          sourceSelector = 'docs-editor';
        }

        console.log('Content found using selector:', sourceSelector);
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        
        return {
          content,
          wordCount,
          sourceSelector
        };
      }
    });

    console.log('Content extraction result:', {
      found: !!result[0]?.result?.content,
      selector: result[0]?.result?.sourceSelector,
      wordCount: result[0]?.result?.wordCount
    });

    return result[0]?.result;
  } catch (error) {
    console.log('Progress check error:', error);
    return null;
  }
}

async function askOpenAIForNextTask(content, wordCount) {
  const responseContainer = document.getElementById('responseContainer');
  
  try {
    // Formulate the prompt
    const prompt = `
Current essay status:
- Focus level: ${focusLevel.toFixed(2)} (below threshold of ${FOCUS_THRESHOLD})
- Word count: ${wordCount}
- Full essay content: "${content}"

Available tasks:
${Object.entries(todoList)
  .filter(([_, task]) => !task.completed)
  .map(([_, task]) => `${task.name} (${task.type})`)
  .join(', ')}

Based on the essay content, current focus level, and cognitive science research:
1. Analyze the current state of the essay and if this is a good stopping point.
2. Recommend whether to switch to email writing or calendar event creation.
3. Explain why this switch would be beneficial given the current mental state and essay progress.

Format response as: "ANALYSIS: [essay content and progress analysis]. RECOMMENDATION: [email or calendar]. REASONING: [scientific explanation]"`;

    // Show what we're sending to OpenAI
    responseContainer.innerHTML = `
      <div style="margin: 10px 0; padding: 5px; background: #e6f3ff; border-radius: 4px;">
        <strong>Sending to OpenAI:</strong><br>
        <pre style="white-space: pre-wrap;">${prompt}</pre>
      </div>
      <div>Waiting for OpenAI response...</div>
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a productivity assistant. When focus drops below threshold, analyze the essay content and recommend whether to switch tasks."
        }, {
          role: "user",
          content: prompt
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      responseContainer.innerHTML += `<div style="color: red;">Error: ${data.error.message}</div>`;
    } else if (data.choices && data.choices[0]) {
      const recommendation = data.choices[0].message.content;
      responseContainer.innerHTML = `
        <div style="margin: 10px 0; padding: 5px; background: #e6f3ff; border-radius: 4px;">
          <strong>Sent to OpenAI:</strong><br>
          <pre style="white-space: pre-wrap;">${prompt}</pre>
        </div>
        <div style="margin: 10px 0; padding: 5px; background: #f0fff0; border-radius: 4px;">
          <strong>OpenAI Response:</strong><br>
          ${recommendation}
        </div>
        <div class="button-container">
          <button id="yesButton">Switch Task</button>
          <button id="noButton">Continue Writing</button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error:', error);
    responseContainer.textContent = 'Error analyzing writing progress';
  }
}

// Create task selector UI
function createTaskSelector() {
  const container = document.createElement('div');
  container.innerHTML = `
    <select id="taskSelector" style="width: 100%; margin-bottom: 10px; padding: 5px;">
      <option value="">Select your current task</option>
      ${Object.entries(todoList).map(([id, task]) => 
        `<option value="${id}" ${task.completed ? 'disabled' : ''}>
          ${task.name} ${task.completed ? '(Done)' : ''}
        </option>`
      ).join('')}
    </select>
  `;
  
  document.getElementById('responseContainer').prepend(container);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  createTaskSelector();
  const testButton = document.getElementById('testButton');
  testButton.addEventListener('click', () => {
    const currentTask = todoList[document.getElementById('taskSelector').value];
    if (currentTask && currentTask.type === 'essay') {
      checkEssayProgress(currentTask.id).then(progress => {
        if (progress) {
          askOpenAIForNextTask(progress.content, progress.wordCount);
        }
      });
    }
  });
});

// Add focus level tracking
let focusLevel = 0.2;  // Set to 0.2, which is below FOCUS_THRESHOLD of 0.3
const FOCUS_THRESHOLD = 0.3;

// Function to update focus
function updateFocus(decrease = true) {
  // if (decrease) {
  //   focusLevel = Math.max(0, focusLevel - 0.05);
  // } else {
  //   focusLevel = Math.min(100, focusLevel + 0.05);
  // }
  
  // If focus drops below threshold and we're writing an essay, check progress
  if (focusLevel < FOCUS_THRESHOLD) {
    const currentTask = todoList[document.getElementById('taskSelector').value];
    if (currentTask && currentTask.type === 'essay') {
      checkEssayProgress(currentTask.id).then(progress => {
        if (progress) {
          askOpenAIForNextTask(progress.content, progress.wordCount);
        }
      });
    }
  }
}

// Add focus monitoring
document.addEventListener('keydown', () => updateFocus(false));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    updateFocus(true);
  }
});

// Set interval to decrease focus over time
setInterval(() => updateFocus(true), 30000); // Decrease focus every 30 seconds of inactivity