let map;
let heatmap;
let requestData = [];  // Array to hold request coordinates

// Initialize map
function initMap() {
    // Get the user's current location or set a default center
    const userLocation = { lat: 12.9716, lng: 77.5946 };  // Example: Bangalore coordinates

    // Create the map, centered at user's location
    map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 12,
    });

    // Add a marker for the user's location
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "You are here",
    });

    // Initialize the heatmap layer
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: requestData,  // Initially empty
        map: map,  // Add heatmap to the map
        radius: 20,  // Size of each point in heatmap
        opacity: 0.6,  // Transparency of heatmap
        maxIntensity: 10  // Max intensity value
    });

    // Fetch requests and prepare heatmap data
    loadRequests();

    // Set up event listener for the toggle button
    document.getElementById("toggle-heatmap").addEventListener("click", toggleHeatmap);
}

// Load request data from a source (e.g., Firebase, API)
function loadRequests() {
    const requestsRef = firebase.database().ref("requests");

    // Fetch data from Firebase or your database
    requestsRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Loop through the data to extract coordinates
            Object.keys(data).forEach((key) => {
                const request = data[key];
                const location = { lat: request.lat, lng: request.lng };

                // Add location to requestData
                requestData.push(new google.maps.LatLng(location.lat, location.lng));
            });

            // Update heatmap data with the new coordinates
            heatmap.setData(requestData);
        } else {
            console.log("No requests found.");
        }
    });
}
console.log("Heatmap data loaded:", requestData); // To check if data is loaded

// Toggle heatmap visibility
function toggleHeatmap() {
    if (heatmap.getMap()) {
        console.log("Hiding heatmap");
        heatmap.setMap(null);  // Hide heatmap
    } else {
        console.log("Displaying heatmap");
        heatmap.setMap(map);  // Show heatmap
    }
}


// Load the map when the page is ready
google.maps.event.addDomListener(window, "load", initMap);

heatmap.set('radius', 30);  // Increase the size of each heatmap point
heatmap.set('opacity', 0.8);  // Change opacity for better visibility
heatmap.set('maxIntensity', 20);  // Set maximum intensity value to better reflect high-density areas
