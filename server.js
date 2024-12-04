const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require("./weneedonceagain-firebase-adminsdk-2dgm3-39527edaa5.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Firebase database reference (Realtime Database or Firestore)
const db = admin.database();  // For Realtime Database
// const db = admin.firestore(); // Uncomment if using Firestore

// Function to send Push Notification via FCM
function sendPushNotification(fcmToken, message) {
    const payload = {
        notification: {
            title: "SOS Alert",
            body: message,
        },
        token: fcmToken, // The device's FCM token
    };

    admin.messaging()
        .send(payload)
        .then((response) => {
            console.log("Successfully sent message:", response);
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
}

// Function to log SOS request in the database
function logSOSRequest(userEmail, timestamp) {
    const sosRequestRef = db.ref("sosRequests").push();  // For Realtime Database

    // For Firestore, use: db.collection("sosRequests").add({ email: userEmail, timestamp: timestamp });

    sosRequestRef.set({
        email: userEmail,
        timestamp: timestamp,
        status: "Pending",  // Add status or other details as needed
    })
    .then(() => {
        console.log("SOS request logged in database.");
    })
    .catch((error) => {
        console.error("Error logging SOS request:", error);
    });
}

// Express route to handle SOS notification requests
app.post("/send-sos-notification", (req, res) => {
    const { token, message, userEmail, timestamp } = req.body;

    // Log SOS request in the database
    logSOSRequest(userEmail, timestamp);

    // Send push notification
    sendPushNotification(token, message);

    res.status(200).send({ success: true });
});

// Start server on port 3000
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

