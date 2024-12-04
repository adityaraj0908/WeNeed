// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

//   // TODO: Add SDKs for Firebase products that you want to use
//   // https://firebase.google.com/docs/web/setup#available-libraries

//   // Your web app's Firebase configuration
//   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyD6ApniHy7LJYXEidee8fhsbd2xaL2zRyg",
//     authDomain: "weneedonceagain.firebaseapp.com",
//     projectId: "weneedonceagain",
//     storageBucket: "weneedonceagain.firebasestorage.app",
//     messagingSenderId: "202660184556",
//     appId: "1:202660184556:web:feedd16d5e31c179e380c9",
//     measurementId: "G-QRRZDRTER4"
//   };

//   // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);



// const submit1 = document.getElementById('auth-button1')

// submit1.addEventListener("click",function(event)
// {
//     event.preventDefault()
//     const signup_mail = document.getElementById('signup-email').value;
//     const signup_pass = document.getElementById('signup-password').value;
//     createUserWithEmailAndPassword(auth, signup_mail, signup_pass)
//   .then((userCredential) => {
//     // Signed up 
//     const user = userCredential.user;
//     alert("Creating Account...")
//     // ...
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     alert(errorMessage)
//     // ..
//   });
// })

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD6ApniHy7LJYXEidee8fhsbd2xaL2zRyg",
    authDomain: "weneedonceagain.firebaseapp.com",
    projectId: "weneedonceagain",
    storageBucket: "weneedonceagain.appspot.com",
    messagingSenderId: "202660184556",
    appId: "1:202660184556:web:feedd16d5e31c179e380c9",
    measurementId: "G-QRRZDRTER4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Firebase Authentication

// Event Listener for Sign-Up
const submit1 = document.getElementById('auth-button1');

submit1.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form default submission

    const signup_mail = document.getElementById('signup-email').value;
    const signup_pass = document.getElementById('signup-password').value;

    // Check for empty fields
    if (!signup_mail || !signup_pass) {
        alert("Please fill in all fields.");
        return;
    }

    createUserWithEmailAndPassword(auth, signup_mail, signup_pass)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            console.log("User created successfully:", user);
            alert("Account created successfully!");
            window.location.href='login.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during sign-up:", errorCode, errorMessage);
            alert(`Error: ${errorMessage}`);
        });
});
