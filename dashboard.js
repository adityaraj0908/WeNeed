import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Configuration with filled values
const firebaseConfig = {
    apiKey: "AIzaSyD6ApniHy7LJYXEidee8fhsbd2xaL2zRyg",
    authDomain: "weneedonceagain.firebaseapp.com",
    databaseURL: "https://weneedonceagain-default-rtdb.firebaseio.com/",
    projectId: "weneedonceagain",
    storageBucket: "weneedonceagain.appspot.com",
    messagingSenderId: "202660184556",
    appId: "1:202660184556:web:feedd16d5e31c179e380c9",
    measurementId: "G-QRRZDRTER4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Google Maps Initialization
let map;
const userLocation = { lat: 0, lng: 0 };

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 12
    });

    // Add marker for user location
    const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here"
    });

    loadRequests();
}

// Load requests from Firebase
function loadRequests() {
    const requestsRef = ref(db, "requests");
    onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach((key) => {
                const request = data[key];
                const requestLocation = { lat: request.lat, lng: request.lng };
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(userLocation),
                    new google.maps.LatLng(requestLocation)
                );

                // Filter and display markers
                if (distance <= 3000) {
                    new google.maps.Marker({
                        position: requestLocation,
                        map: map,
                        title: request.description
                    });
                }
            });
        }
    });
}

// Add user geolocation
navigator.geolocation.getCurrentPosition(
    (position) => {
        userLocation.lat = position.coords.latitude;
        userLocation.lng = position.coords.longitude;
        initMap();
    },
    () => {
        alert("Could not fetch your location!");
    }
);

// Add Event Listeners for Buttons
document.getElementById("add-request").addEventListener("click", () => {
    // const description = prompt("Enter request description:");
    if (description) {
        const newRequestRef = ref(db, "requests/" + Date.now());
        set(newRequestRef, {
            description: description,
            lat: userLocation.lat,
            lng: userLocation.lng
        });
        alert("Request added!");
    }
});

// Modal Logic
const modal = document.getElementById("request-modal");
const addRequestButton = document.getElementById("add-request");
const cancelRequestButton = document.getElementById("cancel-request");
const requestForm = document.getElementById("request-form");

// Show the modal when "Add Request" is clicked
addRequestButton.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

// Hide the modal when "Cancel" is clicked
cancelRequestButton.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Submit the request and hide the modal
requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const userEmail = localStorage.getItem('userEmail');
    const name = document.getElementById("name").value;
    const description = document.getElementById("request").value;
    const address = document.getElementById("address").value;
    const pincode = document.getElementById("pincode").value;
    const countryCode = document.getElementById("country-code").value;
    const phoneNumber = document.getElementById("phone").value;
    const urgency = document.querySelector('input[name="urgency"]:checked').value;

    // Add request to Firebase
    const newRequestRef = ref(db, "requests/" + Date.now());
    set(newRequestRef, {
        name: name,
        description: description,
        address: address,
        pincode: pincode,
        phone: `${countryCode} ${phoneNumber}`,
        urgency: urgency,
        lat: userLocation.lat,
        lng: userLocation.lng,
        mail: userEmail
    });

    alert("Request added!");
    modal.classList.add("hidden"); // Hide the modal after submission
    requestForm.reset(); // Reset the form
});

let nearbyRequests = [];
let currentRequestIndex = 0;
document.getElementById("view-nearby").addEventListener("click", () => {
    const requestsRef = ref(db, "requests");
    const nearbyPanel = document.getElementById("nearby-panel");

    // Reset the state
    nearbyRequests = [];
    currentRequestIndex = 0;

    onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach((key) => {
                const request = data[key];
                const requestLocation = { lat: request.lat, lng: request.lng };
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(userLocation),
                    new google.maps.LatLng(requestLocation)
                );

                // Filter requests within 3km
                if (distance <= 3000) {
                    nearbyRequests.push({ id: key, ...request });
                }
            });

            if (nearbyRequests.length > 0) {
                showRequestDetails(nearbyRequests[currentRequestIndex]);
                nearbyPanel.classList.remove("hidden");
            } else {
                alert("No requests found within 3km.");
            }
        }
    });
});

function showRequestDetails(request) {
    const requestDetails = document.getElementById("request-details");
    requestDetails.innerHTML = `
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Urgency:</strong> ${request.urgency}</p>
        <p><strong>Description:</strong> ${request.description}</p>
        <p><strong>Address:</strong> ${request.address}</p>
        <p><strong>Pincode:</strong> ${request.pincode}</p>
        <p><strong>Phone:</strong> ${request.phone}</p>
    `;

    // Center the map on the request location
    const requestLocation = { lat: request.lat, lng: request.lng };
    map.setCenter(requestLocation);

    // Add a marker for the request
    new google.maps.Marker({
        position: requestLocation,
        map: map,
        title: request.description,
    });
}

document.getElementById("next-request").addEventListener("click", () => {
    currentRequestIndex = (currentRequestIndex + 1) % nearbyRequests.length;
    showRequestDetails(nearbyRequests[currentRequestIndex]);
});
document.getElementById("accept-request").addEventListener("click", () => {
    const request = nearbyRequests[currentRequestIndex];
    const requestRef = ref(db, "requests/" + request.id);

    set(requestRef, null) // Remove request from the database
        .then(() => {
            alert("Request accepted and removed!");
            nearbyRequests.splice(currentRequestIndex, 1); // Remove from local array

            if (nearbyRequests.length > 0) {
                currentRequestIndex = currentRequestIndex % nearbyRequests.length;
                showRequestDetails(nearbyRequests[currentRequestIndex]);
            } else {
                document.getElementById("nearby-panel").classList.add("hidden");
            }
        })
        .catch((error) => {
            alert("Error accepting request: " + error.message);
        });
});
document.getElementById("close-panel").addEventListener("click", () => {
    document.getElementById("nearby-panel").classList.add("hidden");
});


document.getElementById("sos-button").addEventListener("click", function () {
    logSOSRequest();
});

// Function to log SOS request in the database
function logSOSRequest() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        alert("Please log in first!");
        return;
    }

    const sosRef = ref(db, "sos/" + Date.now());
    set(sosRef, {
        email: userEmail,
        lat: userLocation.lat,
        lng: userLocation.lng,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        alert("SOS logged successfully!");
        // sendSOSviaTwilio(userLocation.lat, userLocation.lng);
    })
    .catch((error) => {
        alert("Error logging SOS: " + error.message);
    });
}





// function sendSOSviaTwilio(latitude, longitude) {
    
//     const twilioAccountSid = "AC8bf72ec4909530f15ae9bb367af50b2e";
//     const twilioAuthToken = "43a788a561ff238143b8449ebcb12f2e";
//     const twilioFromNumber = "+17754380114";
//     const userPhoneNumber = "+919341157250";

//     const message = `SOS Alert! I need help.\nLocation: Latitude ${latitude}, Longitude ${longitude}`;

//     // Twilio API endpoint
//     const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

//     fetch(url, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
//         },
//         body: new URLSearchParams({
//             From: twilioFromNumber,
//             To: userPhoneNumber,
//             Body: message,
//         }),
//     })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.sid) {
//                 console.log("SOS SMS sent successfully!");
//             } else {
//                 console.error("Failed to send SOS SMS:", data);
//             }
//         })
//         .catch((error) => {
//             console.error("Error sending SOS SMS:", error);
//         });
// }






// document.getElementById("sos-button").addEventListener("click", function () {
//     logSOSRequest();
// });

// // Function to log SOS request and send an SMS using Twilio
// function logSOSRequest() {
//     const userEmail = localStorage.getItem("userEmail");
//     if (!userEmail) {
//         alert("Please log in first!");
//         return;
//     }

//     const sosData = {
//         email: userEmail,
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//         timestamp: new Date().toISOString(),
//     };

//     // Log the SOS in your database (optional, here assumed in Firebase)
//     const sosRef = ref(db, "sos/" + Date.now());
//     set(sosRef, sosData)
//         .then(() => {
//             alert("SOS logged successfully!");
//             sendSOSviaTwilio(sosData.lat, sosData.lng);
//         })
//         .catch((error) => {
//             alert("Error logging SOS: " + error.message);
//         });
// }

// // Function to send SOS SMS using Twilio
// function sendSOSviaTwilio(latitude, longitude) {
//     const twilioAccountSid = "AC8bf72ec4909530f15ae9bb367af50b2e";
//     const twilioAuthToken = "43a788a561ff238143b8449ebcb12f2e";
//     const twilioFromNumber = "+17754380114";
//     const userPhoneNumber = "+919341157250";

//     const message = `SOS Alert! I need help.\nLocation: Latitude ${latitude}, Longitude ${longitude}`;

//     // Twilio API endpoint
//     const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

//     fetch(url, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
//         },
//         body: new URLSearchParams({
//             From: twilioFromNumber,
//             To: userPhoneNumber,
//             Body: message,
//         }),
//     })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.sid) {
//                 alert("SOS SMS sent successfully!");
//                 console.log("SMS Response:", data);
//             } else {
//                 console.error("Failed to send SOS SMS:", data);
//                 alert("Failed to send SOS SMS.");
//             }
//         })
//         .catch((error) => {
//             console.error("Error sending SOS SMS:", error);
//             alert("Error sending SOS SMS. Check console for details.");
//         });
// }









let allRequests = [];
let currentPendingRequestIndex = 0;

document.getElementById("view-pending").addEventListener("click", () => {
    const requestsRef = ref(db, "requests");
    const pendingPanel = document.getElementById("pending-panel");

    // Reset the state
    allRequests = [];
    currentPendingRequestIndex = 0;

    onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            Object.keys(data).forEach((key) => {
                const request = data[key];
                allRequests.push({ id: key, ...request });
            });

            if (allRequests.length > 0) {
                showPendingRequestDetails(allRequests[currentPendingRequestIndex]);
                pendingPanel.classList.remove("hidden");
            } else {
                alert("No pending requests available.");
            }
        }
    });
});

function showPendingRequestDetails(request) {
    const requestDetails = document.getElementById("pending-request-details");
    requestDetails.innerHTML = `
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Urgency:</strong> ${request.urgency}</p>
        <p><strong>Description:</strong> ${request.description}</p>
        <p><strong>Address:</strong> ${request.address}</p>
        <p><strong>Pincode:</strong> ${request.pincode}</p>
        <p><strong>Phone:</strong> ${request.phone}</p>
    `;

    // Center the map on the request location
    const requestLocation = { lat: request.lat, lng: request.lng };
    map.setCenter(requestLocation);

    // Add a marker for the request
    new google.maps.Marker({
        position: requestLocation,
        map: map,
        title: request.description,
    });
}

document.getElementById("next-pending-request").addEventListener("click", () => {
    currentPendingRequestIndex = (currentPendingRequestIndex + 1) % allRequests.length;
    showPendingRequestDetails(allRequests[currentPendingRequestIndex]);
});

document.getElementById("back-pending-request").addEventListener("click", () => {
    currentPendingRequestIndex = (currentPendingRequestIndex - 1 + allRequests.length) % allRequests.length;
    showPendingRequestDetails(allRequests[currentPendingRequestIndex]);
});

document.getElementById("accept-pending-request").addEventListener("click", () => {
    const request = allRequests[currentPendingRequestIndex];
    const requestRef = ref(db, "requests/" + request.id);

    set(requestRef, null) // Remove request from the database
        .then(() => {
            alert("Request accepted and removed!");
            allRequests.splice(currentPendingRequestIndex, 1); // Remove from local array

            if (allRequests.length > 0) {
                currentPendingRequestIndex = currentPendingRequestIndex % allRequests.length;
                showPendingRequestDetails(allRequests[currentPendingRequestIndex]);
            } else {
                document.getElementById("pending-panel").classList.add("hidden");
            }
        })
        .catch((error) => {
            alert("Error accepting request: " + error.message);
        });
});

document.getElementById("cancel-pending-panel").addEventListener("click", () => {
    document.getElementById("pending-panel").classList.add("hidden");
});
