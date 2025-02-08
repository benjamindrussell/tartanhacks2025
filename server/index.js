const { Neurosity } = require("@neurosity/sdk");
const WebSocket = require("ws");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

mongoose.connect(URI)
.then(() => {
  console.log("Connected to mongodb")
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

            // Send test data every 5 seconds if no Neurosity data
            const testInterval = setInterval(() => {
                const testData = {
                    type: "focus",
                    probability: Math.random()  // Random focus value between 0-1
                };
                console.log("Sending test data:", testData);
                ws.send(JSON.stringify(testData));
            }, 5000);

            // Real Neurosity data when available
            neurosity.focus().subscribe((focus) => {
                console.log(`Focus: ${focus.probability}`);
                ws.send(JSON.stringify({ type: "focus", probability: focus.probability }));
            });

            neurosity.kinesis("leftHandPinch").subscribe(() => {
                console.log("Left hand pinch detected!");
                ws.send(JSON.stringify({ type: "kinesis", action: "leftHandPinch" }));
            });

            neurosity.kinesis("rightHandPinch").subscribe(() => {
                console.log("Right hand pinch detected!");
                ws.send(JSON.stringify({ type: "kinesis", action: "rightHandPinch" }));
            });

            // neurosity.kinesis("doubleBlink").subscribe(() => {
            //     console.log("Double blink detected!");
            //     ws.send(JSON.stringify({ type: "kinesis", action: "doubleBlink" }));
            // });

            ws.on("close", () => {
                console.log("Client disconnected");
                clearInterval(testInterval);  // Clean up interval on disconnect
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

main();