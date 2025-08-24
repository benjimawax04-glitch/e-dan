// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const sessionsCollection = collection(db, "sessions");
