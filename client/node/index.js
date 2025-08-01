// Code to communicate with Suprema G10 device using the real G-SDK Node.js client

const finger = require("./example/finger/finger"); // Use the provided finger module
const { EventEmitter } = require("events");
const FingerprintEmitter = new EventEmitter();

const SERVER_IP = "192.168.0.2"; // Update as needed
const SERVER_PORT = 4000; // Update as needed
const CA_FILE = "../../cert/ca.crt"; // Update path as needed

const fs = require("fs");
const grpc = require("grpc");

function initFingerClient() {
  const rootCa = fs.readFileSync(CA_FILE);
  const sslCreds = grpc.credentials.createSsl(rootCa);
  finger.initClient(`${SERVER_IP}:${SERVER_PORT}`, sslCreds);
}

// 442 group codes based on Suprema G-SDK conventions
const GROUPS_442 = [
  { name: "Right Four Fingers", groupCode: 1 }, // Usually 1 for right slap
  { name: "Left Four Fingers", groupCode: 2 }, // Usually 2 for left slap
  { name: "Two Thumbs", groupCode: 3 }, // Usually 3 for thumbs slap
];

FingerprintEmitter.on("fingerprintCaptured", (data) => {
  console.log("Fingerprint captured:", data);
  // Add code to send the fingerprint data to the server if needed
});

// Capture 442 slap fingerprints using group capture
const capture442Groups = async (deviceID, format = 0, threshold = 50) => {
  for (const group of GROUPS_442) {
    try {
      console.log(`Place ${group.name} on the scanner.`);
      // The finger.scan method should accept groupCode for slap/group capture
      const templateData = await finger.scan(
        deviceID,
        format,
        threshold,
        group.groupCode
      );
      FingerprintEmitter.emit("fingerprintCaptured", {
        group: group.name,
        data: templateData,
      });
      // Optionally, add a delay or prompt user to continue
    } catch (error) {
      console.error(`Error capturing ${group.name}:`, error);
    }
  }
};

const startFingerprintCapture = async (deviceID) => {
  try {
    initFingerClient();
    console.log("Fingerprint client initialized.");
    await capture442Groups(deviceID);
    console.log("4-4-2 fingerprint group capture completed.");
  } catch (error) {
    console.error("Error starting fingerprint capture:", error);
  }
};

module.exports = {
  startFingerprintCapture,
  FingerprintEmitter,
};

// Usage example
if (require.main === module) {
  const DEVICE_ID = 1; // Replace with your actual device ID
  startFingerprintCapture(DEVICE_ID)
    .then(() => console.log("Fingerprint capture initialized."))
    .catch((error) =>
      console.error("Failed to initialize fingerprint capture:", error)
    );
}

// This code uses the real G-SDK Node.js client to capture fingerprints from a Suprema device in 4-4-2 slap format.
// Make sure to update SERVER_IP, SERVER_PORT, CA_FILE, and DEVICE_ID as needed.
