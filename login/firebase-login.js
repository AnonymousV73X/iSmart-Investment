// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjo5Q7udPIXCVUFJYG4Dp1hcpLvAElg6o",
  authDomain: "money-92adb.firebaseapp.com",
  databaseURL: "https://money-92adb-default-rtdb.firebaseio.com",
  projectId: "money-92adb",
  storageBucket: "money-92adb.appspot.com",
  messagingSenderId: "1042572717494",
  appId: "1:1042572717494:web:f056df88597e53c3a0e517",
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to map Firebase error codes to user-friendly error messages
function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "User not found!";
    case "auth/wrong-password":
      return "Incorrect password!";
    case "auth/invalid-email":
      return "Please enter a valid email!";
    case "auth/user-disabled":
      return "Account disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts!";
    case "auth/network-request-failed":
      return "Check your internet connection!";
    default:
      return "Something's wrong. Verify your details.";
  }
}

// Function to retrieve and store user data
function retrieveAndStoreUserData(userUid, app) {
  const userRef = ref(getDatabase(app), "users/" + userUid);

  return get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Retrieve data from userData object
        const email = userData.email;
        const username = userData.username;
        const mpesaNumber = userData.mpesaNumber;
        const gender = userData.gender;
        const registrationTime = userData.registrationTime;
        const defaultBio = userData.bio;
        const darkMode = userData.darkMode;

        const weekInvestmentSum = Object.values(userData.weekInvestment)
          .slice(0, -1) // Slice to exclude the most recent week
          .reduce((sum, value) => sum + value, 0);

        // Find the most recent week by checking the largest number in weekInvestment keys
        let mostRecentWeek = 1;
        for (const key in userData.weekInvestment) {
          const weekNumber = parseInt(key.replace("week", ""));
          if (!isNaN(weekNumber) && weekNumber > mostRecentWeek) {
            mostRecentWeek = weekNumber;
          }
        }

        // Set the most recent week's value as recentWeekInvestment
        const recentWeekInvestment =
          userData.weekInvestment[`week${mostRecentWeek}`];
        // Change this based on your structure

        // Store user's data in localStorage
        localStorage.setItem("userUid", userUid);
        localStorage.setItem("email", email);
        localStorage.setItem("userName", username);
        localStorage.setItem("mpesaNumber", mpesaNumber);
        localStorage.setItem("gender", gender);
        localStorage.setItem("registrationTime", registrationTime);
        localStorage.setItem("defaultBio", defaultBio);
        localStorage.setItem("darkMode", darkMode);
        localStorage.setItem("weekInvestmentSum", weekInvestmentSum);
        localStorage.setItem("recentWeekInvestment", recentWeekInvestment);

        // Store transactions in localStorage
        localStorage.setItem(
          "transactions",
          JSON.stringify(userData.transactions || {})
        );
      } else {
        console.error("User data not found.");
      }
    })

    .catch((error) => {
      console.error("Error retrieving user data:", error);
    });
}

// Event listeners...
$(".close-btn").click(function () {
  $(".alert").removeClass("show");
  $(".alert").addClass("hide");
});

//Actual Login...
const submitButton = document.getElementById("submit");

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Capture the current time when the user logs in
  const currentTime = new Date();

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const userUid = user.uid;

      // Retrieve and store user's data
      retrieveAndStoreUserData(userUid, app).then(() => {
        // Success action
        window.location.href = "./dashboard/";

        // Update the login timestamp
        localStorage.setItem("loginTimestamp", currentTime.toString());
        // Set the local storage value to indicate logout (e.g., 'true')
        localStorage.setItem("logout", "false");
      });
    })

    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = getFriendlyErrorMessage(errorCode);

      // Display user-friendly error message in the custom alert popup
      $(".msg").text(errorMessage);
      $(".alert").addClass("show");
      $(".alert").removeClass("hide");
      $(".alert").addClass("showAlert");

      // Hide the alert popup after 3 seconds
      setTimeout(function () {
        $(".alert").removeClass("show");
        $(".alert").addClass("hide");
      }, 3000);
    });
});

// Forgot Password
const forgotPasswordLink = document.getElementById("forgot-password-link");

// Add a click event listener to the "Forgot Password" link
forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  try {
    // Send a password reset email
    await sendPasswordResetEmail(auth, email);
    // Password reset email sent successfully
    displayCustomAlert("Password reset email sent. Check your inbox.");
  } catch (error) {
    const errorCode = error.code;
    let errorMessage =
      "An error occurred while sending the password reset email.";

    // Customize error message based on error code
    switch (errorCode) {
      case "auth/user-not-found":
        errorMessage =
          "No account found with this email. ";
        break;
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/network-request-failed":
        errorMessage = " Check internet connection.";
        break;

      case "auth/missing-email":
        errorMessage =
          "Enter Your Email Address";
        break;

      default:
        errorMessage = "Something's Wrong! Try Again Later!";
        break;
    }

    displayCustomAlert(errorMessage);
  }
});

// Function to display the custom alert
function displayCustomAlert(message) {
  $(".msg").text(message);
  $(".alert").addClass("show");
  $(".alert").removeClass("hide");
  $(".alert").addClass("showAlert");

  // Hide the alert popup after 10 seconds
  setTimeout(function () {
    $(".alert").removeClass("show");
    $(".alert").addClass("hide");
  }, 10000);
}

// HREF To Registration
const registerLink = document.getElementById("registerLink");
registerLink.addEventListener("click", () => {
  window.location.href = "../register";
});

// Restrict Scroll-X
document.body.addEventListener(
  "touchmove",
  function (event) {
    if (document.body.scrollLeft !== 0) {
      event.preventDefault();
    }
  },
  { passive: false }
);
