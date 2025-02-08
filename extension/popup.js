document.addEventListener('DOMContentLoaded', function() {
    const testButton = document.getElementById('testButton');
    const responseContainer = document.getElementById('responseContainer');

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
