// app/lib/firebase-admin.js
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  try {
    if (getApps().length > 0) {
      return getApps()[0];
    }

    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.warn("Firebase Admin credentials missing or incomplete.");
      return null;
    }

    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1).trim();
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    return initializeApp({ credential: cert(serviceAccount) });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return null;
  }
}

export const adminAuth = new Proxy({}, {
  get: (target, prop) => {
    try {
      const app = getFirebaseAdminApp();
      if (!app) return () => Promise.resolve({});
      const auth = getAuth(app);
      const val = auth[prop];
      return typeof val === "function" ? val.bind(auth) : val;
    } catch (e) {
      console.error("adminAuth proxy error:", e);
      return () => Promise.resolve({});
    }
  }
});

export const adminDb = new Proxy({}, {
  get: (target, prop) => {
    try {
      const app = getFirebaseAdminApp();
      if (!app) return () => ({ get: async () => ({ docs: [] }), orderBy: () => ({ get: async () => ({ docs: [] }) }) });
      const db = getFirestore(app);
      const val = db[prop];
      return typeof val === "function" ? val.bind(db) : val;
    } catch (e) {
      console.error("adminDb proxy error:", e);
      return () => ({ get: async () => ({ docs: [] }), orderBy: () => ({ get: async () => ({ docs: [] }) }) });
    }
  }
});