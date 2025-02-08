// document.getElementById('actionButton').addEventListener('click', async () => {
//   try {
//     // Get the active tab
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
//     if (!tab?.id) {
//       throw new Error('No active tab found');
//     }

//     // Execute script in the active tab
//     await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: () => {
//         alert('Hello from the extension!');
//       }
//     });
//   } catch (error) {
//     console.error('Error:', error);
//   }
// });

// // Predefined task types
// const tasks = {
//   'essay': {
//     name: 'Essay Writing',
//     checkProgress: {
//       wordCount: true
//     }
//   },
//   'email': {
//     name: 'Email Writing',
//     checkProgress: {
//       wordCount: true
//     }
//   },
//   'calendar': {
//     name: 'Calendar Event',
//     checkProgress: {
//       inputActivity: true
//     }
//   }
// };

// // Define todo list with just 3 tasks
// const todoList = {
//   'task1': {
//     name: 'Write Research Essay',
//     type: 'essay',
//     completed: false
//   },
//   'task2': {
//     name: 'Write Project Update Email',
//     type: 'email',
//     completed: false
//   },
//   'task3': {
//     name: 'Schedule Team Meeting',
//     type: 'calendar',
//     completed: false
//   }
// };

// async function checkEssayProgress(taskId) {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   if (!tab?.id) return null;

//   try {
//     const result = await chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       func: () => {
//         // Get just the main content area where user types
//         const contentArea = document.querySelector('.kix-appview-editor');
//         if (!contentArea) {
//           console.log('Could not find Google Docs editor');
//           return null;
//         }

//         // Get only the paragraphs of user-typed content
//         const contentElements = contentArea.querySelectorAll('.kix-paragraphrenderer');
//         const content = Array.from(contentElements)
//           // Get text content of each paragraph
//           .map(p => {
//             // Get only the text spans, which contain actual content
//             const textSpans = p.querySelectorAll('.kix-wordhtmlgenerator-word-node');
//             return Array.from(textSpans)
//               .map(span => span.textContent)
//               .join(' ');
//           })
//           // Filter out empty paragraphs
//           .filter(text => text.trim().length > 0)
//           // Join paragraphs with newlines
//           .join('\n');

//         console.log('Found content:', content);
//         const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
        
//         return {
//           content,
//           wordCount
//         };
//       }
//     });

//     console.log('Content extraction result:', {
//       found: !!result[0]?.result?.content,
//       wordCount: result[0]?.result?.wordCount,
//       sample: result[0]?.result?.content?.substring(0, 100) + '...'
//     });

//     return result[0]?.result;
//   } catch (error) {
//     console.log('Progress check error:', error);
//     return null;
//   }
// }

// async function askOpenAIForNextTask(content, wordCount) {
//   const responseContainer = document.getElementById('responseContainer');
  
//   try {
//     // Formulate the prompt
//     const prompt = `
// Current essay status:
// - Focus level: ${focusLevel.toFixed(2)} (below threshold of ${FOCUS_THRESHOLD})
// - Word count: ${wordCount}
// - Full essay content: "${content}"

// Available tasks:
// ${Object.entries(todoList)
//   .filter(([_, task]) => !task.completed)
//   .map(([_, task]) => `${task.name} (${task.type})`)
//   .join(', ')}

// Based on the essay content, current focus level, and cognitive science research:
// 1. Analyze the current state of the essay and if this is a good stopping point.
// 2. Recommend whether to switch to email writing or calendar event creation.
// 3. Explain why this switch would be beneficial given the current mental state and essay progress.

// Format response as: "ANALYSIS: [essay content and progress analysis]. RECOMMENDATION: [email or calendar]. REASONING: [scientific explanation]"`;

//     // Show what we're sending to OpenAI
//     responseContainer.innerHTML = `
//       <div style="margin: 10px 0; padding: 5px; background: #e6f3ff; border-radius: 4px;">
//         <strong>Sending to OpenAI:</strong><br>
//         <pre style="white-space: pre-wrap;">${prompt}</pre>
//       </div>
//       <div>Waiting for OpenAI response...</div>
//     `;

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${config.OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [{
//           role: "system",
//           content: "You are a productivity assistant. When focus drops below threshold, analyze the essay content and recommend whether to switch tasks."
//         }, {
//           role: "user",
//           content: prompt
//         }]
//       })
//     });

//     const data = await response.json();
    
//     if (data.error) {
//       responseContainer.innerHTML += `<div style="color: red;">Error: ${data.error.message}</div>`;
//     } else if (data.choices && data.choices[0]) {
//       const recommendation = data.choices[0].message.content;
//       responseContainer.innerHTML = `
//         <div style="margin: 10px 0; padding: 5px; background: #e6f3ff; border-radius: 4px;">
//           <strong>Sent to OpenAI:</strong><br>
//           <pre style="white-space: pre-wrap;">${prompt}</pre>
//         </div>
//         <div style="margin: 10px 0; padding: 5px; background: #f0fff0; border-radius: 4px;">
//           <strong>OpenAI Response:</strong><br>
//           ${recommendation}
//         </div>
//         <div class="button-container">
//           <button id="yesButton">Switch Task</button>
//           <button id="noButton">Continue Writing</button>
//         </div>
//       `;
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     responseContainer.textContent = 'Error analyzing writing progress';
//   }
// }

// // Create task selector UI
// function createTaskSelector() {
//   const container = document.createElement('div');
//   container.innerHTML = `
//     <select id="taskSelector" style="width: 100%; margin-bottom: 10px; padding: 5px;">
//       <option value="">Select your current task</option>
//       ${Object.entries(todoList).map(([id, task]) => 
//         `<option value="${id}" ${task.completed ? 'disabled' : ''}>
//           ${task.name} ${task.completed ? '(Done)' : ''}
//         </option>`
//       ).join('')}
//     </select>
//   `;
  
//   document.getElementById('responseContainer').prepend(container);
// }

// // Initialize
// document.addEventListener('DOMContentLoaded', function() {
//   createTaskSelector();
//   const testButton = document.getElementById('testButton');
//   testButton.addEventListener('click', () => {
//     const currentTask = todoList[document.getElementById('taskSelector').value];
//     if (currentTask && currentTask.type === 'essay') {
//       checkEssayProgress(currentTask.id).then(progress => {
//         if (progress) {
//           askOpenAIForNextTask(progress.content, progress.wordCount);
//         }
//       });
//     }
//   });
// });

// // Add focus level tracking
// let focusLevel = 0.2;  // Set to 0.2, which is below FOCUS_THRESHOLD of 0.3
// const FOCUS_THRESHOLD = 0.3;

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

async function captureAndAnalyzeDoc() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  const responseContainer = document.getElementById('responseContainer');
  
  try {
    // Check if Tesseract is loaded
    if (typeof Tesseract === 'undefined') {
      throw new Error('Tesseract library not loaded');
    }

    // Capture the visible part of the page
    responseContainer.innerHTML = `<div>Capturing screenshot...</div>`;
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });

    responseContainer.innerHTML = `
      <div style="margin: 10px 0; padding: 5px; background: #f0fff0; border-radius: 4px;">
        <strong>Captured Screenshot:</strong><br>
        <img src="${screenshot}" style="max-width: 100%; margin-top: 10px;">
      </div>
      <div id="progress">Starting OCR analysis...</div>
    `;

    const progressDiv = document.getElementById('progress');

    // Try to create worker with more error details
    let worker;
    try {
      console.log('Creating worker with path:', chrome.runtime.getURL('lib/worker.min.js'));
      worker = await Tesseract.createWorker({
        workerPath: chrome.runtime.getURL('lib/worker.min.js'),
        // Add these additional configurations
        corePath: chrome.runtime.getURL('lib/tesseract-core.wasm.js'),
        langPath: chrome.runtime.getURL('lib/lang-data'),
        logger: m => {
          console.log('OCR Progress:', m);
          if (progressDiv) {
            progressDiv.textContent = `OCR Progress: ${m.status} (${(m.progress * 100).toFixed(1)}%)`;
          }
        }
      });
    } catch (workerError) {
      console.error('Worker creation error:', {
        error: workerError,
        message: workerError.message,
        stack: workerError.stack
      });
      throw new Error(`Failed to create Tesseract worker: ${workerError.message || 'Worker initialization failed'}`);
    }

    // Initialize worker
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Perform OCR
    const { data: { text } } = await worker.recognize(screenshot);
    await worker.terminate();

    // Calculate word count and prepare summary
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    
    // Get summary from OpenAI
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a summarizer. Provide a 2-3 sentence summary of the given text."
        }, {
          role: "user",
          content: `Summarize this text in 2-3 sentences:\n\n${text}`
        }]
      })
    });

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices?.[0]?.message?.content || 'No summary available';

    // Display results with better formatting
    responseContainer.innerHTML = `
      <div style="margin: 10px 0; padding: 15px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="background: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
            ${wordCount} words
          </div>
        </div>

        <div style="margin-top: 15px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">Content Summary:</div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 13px; line-height: 1.4;">
            ${summary}
          </div>
        </div>

        <details style="margin-top: 15px;">
          <summary style="cursor: pointer; color: #666;">View Full Text</summary>
          <pre style="white-space: pre-wrap; margin-top: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 200px; overflow-y: auto;">
${text}
          </pre>
        </details>
      </div>
    `;

    return {
      content: text,
      wordCount: wordCount,
      summary: summary
    };

  } catch (error) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      tesseractStatus: {
        loaded: typeof Tesseract !== 'undefined',
        version: typeof Tesseract !== 'undefined' ? Tesseract.version : 'not loaded',
        methods: typeof Tesseract !== 'undefined' ? Object.keys(Tesseract) : [],
        createWorkerExists: typeof Tesseract?.createWorker === 'function'
      },
      files: {
        workerPath: chrome.runtime.getURL('lib/worker.min.js'),
        tesseractPath: chrome.runtime.getURL('lib/tesseract.min.js'),
        workerExists: await fetch(chrome.runtime.getURL('lib/worker.min.js'))
          .then(() => true)
          .catch(() => false)
      }
    };

    console.error('Detailed Error:', errorDetails);
    responseContainer.innerHTML = `
      <div style="color: red; padding: 10px; border: 1px solid red; margin: 10px 0; border-radius: 4px;">
        <strong>Error Details:</strong><br>
        Type: ${errorDetails.name}<br>
        Message: ${errorDetails.message}<br>
        Tesseract Loaded: ${errorDetails.tesseractStatus.loaded}<br>
        Tesseract Version: ${errorDetails.tesseractStatus.version}<br>
        <br>
        <details>
          <summary>Technical Details</summary>
          <pre style="font-size: 12px;">${JSON.stringify(errorDetails, null, 2)}</pre>
        </details>
      </div>
    `;
    return null;
  }
}

// Update the checkEssayProgress function to use the new method
async function checkEssayProgress(taskId) {
  return captureAndAnalyzeDoc();
}

async function askOpenAIForNextTask(content, wordCount) {
  const responseContainer = document.getElementById('responseContainer');
  
  try {
    // Formulate a more detailed prompt
    const prompt = `
Current essay analysis:
- Focus level: ${focusLevel.toFixed(2)} (below threshold of ${FOCUS_THRESHOLD})
- Word count: ${wordCount}
- Content structure analysis:
  * Introduction present: ${content.toLowerCase().includes('introduction') || content.includes('background')}
  * Main points identified: ${content.split('.').length} sentences
  * Conclusion present: ${content.toLowerCase().includes('conclusion') || content.toLowerCase().includes('therefore') || content.toLowerCase().includes('in summary')}

Full essay content:
"""
${content}
"""

Available tasks to switch to:
${Object.entries(todoList)
  .filter(([_, task]) => !task.completed)
  .map(([_, task]) => `${task.name} (${task.type})`)
  .join(', ')}

Based on:
1. Current essay structure and completion state
2. Focus level (${focusLevel.toFixed(2)})
3. Cognitive science research about task switching
4. Word count (${wordCount} words)

Please provide:
1. ANALYSIS: Evaluate the current state of the essay (structure, completeness, natural stopping point)
2. RECOMMENDATION: Should the user switch to email writing or calendar event creation?
3. REASONING: Explain why this switch would be beneficial given the current mental state, essay progress, and cognitive load

Format response as: 
"ANALYSIS: [detailed content analysis]
RECOMMENDATION: [email or calendar]
REASONING: [scientific explanation]"`;

    // Show what we're sending to OpenAI
    const systemPrompt = "You are a productivity assistant specializing in analyzing writing progress and recommending optimal task switches based on cognitive load and focus levels.";
    const userPrompt = prompt;  // This is your existing detailed prompt

    responseContainer.innerHTML += `
      <div style="margin: 10px 0; padding: 5px; background: #e6f3ff; border-radius: 4px;">
        <strong>Task Switch Analysis Prompts:</strong><br>
        <div style="margin-top: 10px;">
          <strong>System:</strong>
          <pre style="white-space: pre-wrap; font-size: 12px;">${systemPrompt}</pre>
        </div>
        <div style="margin-top: 10px;">
          <strong>User:</strong>
          <pre style="white-space: pre-wrap; font-size: 12px;">${userPrompt}</pre>
        </div>
      </div>
      <div>Waiting for task switch analysis...</div>
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
          content: systemPrompt
        }, {
          role: "user",
          content: userPrompt
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      responseContainer.innerHTML += `<div style="color: red;">Error: ${data.error.message}</div>`;
    } else if (data.choices && data.choices[0]) {
      const recommendation = data.choices[0].message.content;
      responseContainer.innerHTML += `
        <div style="margin: 10px 0; padding: 5px; background: #f0fff0; border-radius: 4px;">
          <strong>Analysis & Recommendation:</strong><br>
          <pre style="white-space: pre-wrap;">${recommendation}</pre>
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

// Modify your DOMContentLoaded event listener
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