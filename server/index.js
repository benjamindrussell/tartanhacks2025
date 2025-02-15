const { Neurosity } = require("@neurosity/sdk");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Workflow = require('./models/Workflow');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const workflowRoutes = require('./routes/workflows');

// Use routes
app.use('/api/workflows', workflowRoutes);

const PORT = process.env.PORT || 5050;
const URI = process.env.ATLAS_URI || '';

let cachedWorkflows = [];

const updateWorkflowCache = (workflow) => {
    cachedWorkflows = cachedWorkflows.filter(w => w.action !== workflow.action);
    cachedWorkflows.push({
        ...workflow.toObject(),
        active: false
    });
    console.log(`Updated workflow cache. Total workflows: ${cachedWorkflows.length}`);
};

const findWorkflowByAction = (action) => {
    return cachedWorkflows.find(workflow => workflow.action === action);
};

const loadWorkflows = async () => {
    try {
        const workflows = await Workflow.find({});
        cachedWorkflows = workflows.map(w => ({
            ...w.toObject(),
            active: false
        }));
        console.log(`Loaded ${cachedWorkflows.length} workflows from database`);
    } catch (error) {
        console.error("Error loading workflows:", error);
    }
};

mongoose.connect(URI)
.then(async () => {
    console.log("Connected to mongodb");
    await loadWorkflows();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.log(error);
});

const deviceId = process.env.DEVICE_ID || "";
const email = process.env.EMAIL || "";
const password = process.env.PASSWORD || "";

const verifyEnvs = (email, password, deviceId) => {
  const invalidEnv = (env) => {
    return (env === "");
  }
  if (invalidEnv(email) || invalidEnv(password) || invalidEnv(deviceId)) {
      console.error("Please verify deviceId, email and password are in .env file, quitting...");
      process.exit(0);
  }
}
verifyEnvs(email, password, deviceId);
console.log(`${email} attempting to authenticate with ${deviceId}`);

const wss = new WebSocket.Server({ port: 8080 });

const neurosity = new Neurosity({
  deviceId
});

const main = async () => {
    try {
        await neurosity.login({ email, password });
        console.log("Logged in");

        wss.on("connection", (ws) => {
            console.log("Client connected to WebSocket");

            // Add test interval for rightArm signal
            // const testInterval = setInterval(() => {
            //     console.log("Simulating right arm gesture!");
            //     const workflow = findWorkflowByAction("rightArm");
            //     if (workflow) {
            //         ws.send(JSON.stringify({ 
            //             type: "kinesis", 
            //             action: "rightArm",
            //             workflow: {
            //                 description: workflow.description,
            //                 urls: workflow.urls
            //             }
            //         }));
            //     } else {
            //         ws.send(JSON.stringify({ type: "kinesis", action: "rightArm" }));
            //     }
            // }, 10000); // Sends signal every 10 seconds

            // Add test interval for low focus trigger
            // const focusTestInterval = setInterval(() => {
            //     console.log("Simulating low focus condition!");
            //     ws.send(JSON.stringify({ 
            //         type: "triggerScreenshot", 
            //         message: "Test low focus detected - initiating screenshot",
            //         average: 0.25 // Simulated low focus value
            //     }));
            // }, 10000); // Sends signal every 30 seconds

            // const rightArmSubscription = neurosity.kinesis("rightArm").subscribe(() => {
            //     console.log("Right arm gesture detected!");

            //     const workflow = findWorkflowByAction("rightArm");
            //     if (workflow) {
            //         ws.send(JSON.stringify({ 
            //             type: "kinesis", 
            //             action: "rightArm",
            //             workflow: {
            //                 description: workflow.description,
            //                 urls: workflow.urls
            //             }
            //         }));
            //     } else {
            //         ws.send(JSON.stringify({ type: "kinesis", action: "rightArm" }));
            //     }

            //     rightArmSubscription.unsubscribe();
            //     console.log("Unsubscribed from rightArm.");

            //     // Stall for 10 seconds before moving forward   
            //     setTimeout(() => {
            //         console.log("Stalling for 10 seconds");
            //     }, 10000);
            // }).then(() => {
            //     const focusValues = [];
            //     const WINDOW_SIZE = 30; // Number of samples to average
            //     const LOW_FOCUS_THRESHOLD = 0.3; // 30% focus threshold
            //     let lastTriggerTime = 0;
            //     const COOLDOWN_PERIOD = 60000; // 60 seconds cooldown

            //     neurosity.focus().subscribe((focus) => {
            //         console.log(`Focus: ${focus.probability}`);
                    
            //         // Add new focus value and maintain window size
            //         focusValues.push(focus.probability);
            //         if (focusValues.length > WINDOW_SIZE) {
            //             focusValues.shift();
            //         }
                    
            //         // Only check average once we have enough samples
            //         if (focusValues.length === WINDOW_SIZE) {
            //             const average = focusValues.reduce((a, b) => a + b, 0) / WINDOW_SIZE;
            //             console.log(`Focus average over last ${WINDOW_SIZE} samples: ${average}`);
                        
            //             const currentTime = Date.now();
            //             if (average < LOW_FOCUS_THRESHOLD && currentTime - lastTriggerTime > COOLDOWN_PERIOD) {
            //                 lastTriggerTime = currentTime;
            //                 ws.send(JSON.stringify({ 
            //                     type: "triggerScreenshot", 
            //                     message: "Low focus average detected - initiating screenshot",
            //                     average: average
            //                 }));
            //             }
            //         }
                    
            //         // Still send regular focus updates
            //         ws.send(JSON.stringify({ type: "focus", probability: focus.probability }));
            //     });
            // });

            handleGestures(ws);
      
            ws.on("close", () => {
                console.log("Client disconnected");
            });

            // Send initial connection confirmation
            ws.send(JSON.stringify({ type: "connection", status: "connected" }));
        });

        console.log("WebSocket server running on ws://localhost:8080");
    } catch (error) {
        console.error("Login failed:", error);
        process.exit(1);
    }
};

async function handleGestures(ws) {
    await new Promise((resolve) => {
        const rightArmSubscription = neurosity.kinesis("rightArm").subscribe(() => {
            console.log("Right arm gesture detected!");

            const workflow = findWorkflowByAction("rightArm");
            if (workflow) {
                ws.send(JSON.stringify({ 
                    type: "kinesis", 
                    action: "rightArm",
                    workflow: {
                        description: workflow.description,
                        urls: workflow.urls
                    }
                }));
            } else {
                ws.send(JSON.stringify({ type: "kinesis", action: "rightArm" }));
            }

            rightArmSubscription.unsubscribe();
            console.log("Unsubscribed from rightArm.");

            // Stall for 10 seconds before resolving the promise
            setTimeout(() => {
                console.log("Stalling for 10 seconds completed");
                resolve(); 
            }, 10000);
        });
    });

    await handleFocusSubscription(ws);
}

async function handleFocusSubscription(ws) {
    await new Promise((resolve) => {
        const focusValues = [];
        const WINDOW_SIZE = 30; // Number of samples to average
        const LOW_FOCUS_THRESHOLD = 0.75; // 75% focus threshold
        let lastTriggerTime = 0;
        const COOLDOWN_PERIOD = 60000; // 60 seconds cooldown

        const focusSubscription = neurosity.focus().subscribe((focus) => {
            console.log(`Focus: ${focus.probability}`);
            
            // Add new focus value and maintain window size
            focusValues.push(focus.probability);
            if (focusValues.length > WINDOW_SIZE) {
                focusValues.shift();
            }

            let sceenshotExecuted = false;
            
            // Only check average once we have enough samples
            if (focusValues.length === WINDOW_SIZE) {
                const average = focusValues.reduce((a, b) => a + b, 0) / WINDOW_SIZE;
                console.log(`Focus average over last ${WINDOW_SIZE} samples: ${average}`);
                
                const currentTime = Date.now();
                if (average < LOW_FOCUS_THRESHOLD && currentTime - lastTriggerTime > COOLDOWN_PERIOD) {
                    lastTriggerTime = currentTime;
                    ws.send(JSON.stringify({ 
                        type: "triggerScreenshot", 
                        message: "Low focus average detected - initiating screenshot",
                        average: average
                    }));

                    sceenshotExecuted = true;
                }
            }
            
            // Still send regular focus updates
            ws.send(JSON.stringify({ type: "focus", probability: focus.probability }));

            if (sceenshotExecuted) {
                focusSubscription.unsubscribe();
                console.log("Unsubscribed from focus");

                // Stall for 10 seconds before resolving the promise
                setTimeout(() => {
                    console.log("Stalling for 10 seconds completed");
                    resolve(); 
                }, 10000);
            }
        });
    });
    
    await handleLeftFootSubscription(ws);
}

async function handleLeftFootSubscription(ws) {
    await new Promise((resolve) => {
        const leftFootSubscription = neurosity.kinesis("leftFoot").subscribe(() => {
            console.log("Left Foot gesture detected!");

            ws.send(JSON.stringify({ 
                type: "closePopup", 
            }));

            leftFootSubscription.unsubscribe();
            console.log("Unsubscribed from leftFoot.");

            // Stall for 10 seconds before resolving the promise
            setTimeout(() => {
                console.log("Stalling for 10 seconds completed");
                resolve(); 
            }, 10000);
        });
    });
}

main();