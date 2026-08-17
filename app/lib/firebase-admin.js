// app/lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// 1. Structure the credentials properly
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The replace function fixes newline characters in the private key
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// 2. Initialize the app only if it hasn't been initialized already
const app = getApps().length === 0 
  ? initializeApp({ credential: cert(serviceAccount) }) 
  : getApps()[0];

// 3. Export the auth instance and firestore
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };