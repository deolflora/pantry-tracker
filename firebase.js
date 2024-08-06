// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAthKZk1X6gVyE7DuJleCeYIXT_eU2LM4A",
  authDomain: "pantry-tracker-ee790.firebaseapp.com",
  projectId: "pantry-tracker-ee790",
  storageBucket: "pantry-tracker-ee790.appspot.com",
  messagingSenderId: "632082925372",
  appId: "1:632082925372:web:9bd9612348e339c4084039"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };