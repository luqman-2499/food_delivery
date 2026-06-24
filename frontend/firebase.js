// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "food-delivery-e64c9.firebaseapp.com",
  projectId: "food-delivery-e64c9",
  storageBucket: "food-delivery-e64c9.firebasestorage.app",
  messagingSenderId: "916248920827",
  appId: "1:916248920827:web:df53b6c2e9c72451f4665e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // starts firebase
const auth = getAuth(app)  // creates authentication service
export {app, auth} 
