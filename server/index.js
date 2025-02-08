const { Neurosity } = require("@neurosity/sdk");
require("dotenv").config();

const deviceId = process.env.DEVICE_ID || "";

const verifyEnvs = (deviceId) => {
    const invalidEnv = (env) => {
      return env === "" || env === 0;
    };
    if (invalidEnv(deviceId)) {
      console.error(
        "Please verify deviceId is in .env file, quitting..."
      );
      process.exit(0);
    }
  };
  verifyEnvs(deviceId);

  const neurosity = new Neurosity({
    deviceId
  });