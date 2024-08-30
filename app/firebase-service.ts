// https://github.com/aaronksaunders/remix-firebase-sample-app/tree/main
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// read firebase config from app config
import firebaseConfig from "../firebase-config.json";

// Initialize Firebase
console.log("initializing firebase app: " + JSON.stringify(firebaseConfig));
// console.log('Initializing firebase app');

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
