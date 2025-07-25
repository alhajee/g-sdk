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

FingerprintEmitter.on("fingerprintCaptured", (data) => {
  console.log("Fingerprint captured:", data);
  // Add code to send the fingerprint data to the server if needed
});

const captureFingerprint = async (deviceID, format = 0, threshold = 50) => {
  try {
    const templateData = await finger.scan(deviceID, format, threshold);
    FingerprintEmitter.emit("fingerprintCaptured", templateData);
  } catch (error) {
    console.error("Error capturing fingerprint:", error);
  }
};

const startFingerprintCapture = async (deviceID) => {
  try {
    initFingerClient();
    console.log("Fingerprint client initialized.");
    await captureFingerprint(deviceID);
    console.log("Fingerprint capture started.");
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

// This code uses the real G-SDK Node.js client to capture fingerprints from a Suprema device.
// Make sure to update SERVER_IP, SERVER_PORT, CA_FILE, and DEVICE_ID as needed.
