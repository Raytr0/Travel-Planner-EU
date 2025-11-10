// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// require('dotenv').config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebase = {
    // apiKey: process.env.API_KEY,
    // authDomain: process.env.AUTH_DOMAIN,
    // projectId: process.env.PROJECT_ID,
    // storageBucket: process.env.STORAGE_BUCKET,
    // messagingSenderId: process.env.MESSAGING_SENDER_ID,
    // appId: process.env.APP_ID,
    // measurementId: process.env.MEASUREMENT_ID
    apiKey: "AIzaSyCSjxmgZMylD4H2DVp16zDY-JOAW7tsqF8",
    authDomain: "lab4-7aa80.firebaseapp.com",
    projectId: "lab4-7aa80",
    storageBucket: "lab4-7aa80.firebasestorage.app",
    messagingSenderId: "397431813543",
    appId: "1:397431813543:web:3deeecaadd7d099f44f282",
    measurementId: "G-B6E2P191K5"
};

// Initialize Firebase
const app = initializeApp(firebase);
const auth = getAuth(app);

export { app, auth };
