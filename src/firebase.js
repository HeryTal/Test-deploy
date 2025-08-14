// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChI7UOlkP87YMd-UqCDOyUY105BAF2c7E",
  authDomain: "react-chess-324a6.firebaseapp.com",
  projectId: "react-chess-324a6",
  storageBucket: "react-chess-324a6.firebasestorage.app",
  messagingSenderId: "396019867086",
  appId: "1:396019867086:web:16c7f184b48f10aaf25f9f",
  measurementId: "G-M61S56S92H"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
