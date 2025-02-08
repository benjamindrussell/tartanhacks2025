const { Neurosity } = require("@neurosity/sdk");
const WebSocket = require("ws");
require('dotenv').config();

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

            neurosity.kinesis("doubleBlink").subscribe(() => {
                console.log("Double blink detected!");
                ws.send(JSON.stringify({ type: "kinesis", action: "doubleBlink" }));
            });

            ws.on("close", () => {
                console.log("Client disconnected");
            });
        });

        console.log("WebSocket server running on ws://localhost:8080");
    } catch (error) {
        console.error("Login failed:", error);
        process.exit(1);
    }
};

main();