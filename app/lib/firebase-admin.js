// app/lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminAuth = new Proxy({}, {
  get: (target, prop) => {
    const auth = getAuth(getFirebaseAdminApp());
    const val = auth[prop];
    return typeof val === "function" ? val.bind(auth) : val;
  }
});

export const adminDb = new Proxy({}, {
  get: (target, prop) => {
    const db = getFirestore(getFirebaseAdminApp());
    const val = db[prop];
    return typeof val === "function" ? val.bind(db) : val;
  }
});