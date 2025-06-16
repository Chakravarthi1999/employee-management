import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyA5aMsKd4D6x81tp4EkYOr3Jp83eaQbu9I",
  authDomain: "emsp-1e4b0.firebaseapp.com",
  projectId: "emsp-1e4b0",
  storageBucket: "emsp-1e4b0.firebasestorage.app",
  messagingSenderId: "464460155431",
  appId: "1:464460155431:web:871c9dc6be7c772dce5c02",
  measurementId: "G-F7P97TZP6E"
};

const app = initializeApp(firebaseConfig);
const authentic = getAuth(app);
const database = getDatabase(app);

export { authentic,database };
