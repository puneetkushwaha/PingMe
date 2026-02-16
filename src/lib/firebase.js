// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeE5DWzl53vJy5Ri117rN6d_fCLD62Z9w",
    authDomain: "connectly-7ut07.firebaseapp.com",
    projectId: "connectly-7ut07",
    storageBucket: "connectly-7ut07.firebasestorage.app",
    messagingSenderId: "848634889696",
    appId: "1:848634889696:web:758463e66ef61e6e695785"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// VAPID key for web push
const VAPID_KEY = "pLZ6OhKcHAmf4BBdMer2i_WOljRkfI_LoknEcRnwvbc";

export { messaging, getToken, onMessage, VAPID_KEY };
