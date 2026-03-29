import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, setDoc } from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json';

// Check if config is valid (at least apiKey and projectId should be present)
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigValid) {
  console.warn("[Firebase] Configuration is missing or incomplete. Some features like cloud sync and authentication will be disabled.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use default database if not specified or if it's "(default)"
const databaseId = (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)' 
  ? (firebaseConfig as any).firestoreDatabaseId 
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export { isConfigValid };

// Connection test
async function testConnection() {
  if (!isConfigValid) return;
  try {
    // Try to fetch a non-existent document to test connection
    await getDocFromServer(doc(db, '_test_connection', 'ping'));
    console.log("[Firebase] Firestore connection verified.");
    
    // Try a simple write to the unsplash_cache collection to test permissions
    const testRef = doc(db, "unsplash_cache", "_test_write");
    await setDoc(testRef, { test: true, timestamp: new Date().toISOString() });
    console.log("[Firebase] Firestore write permissions verified for unsplash_cache.");
  } catch (error: any) {
    if (error.message?.includes('the client is offline')) {
      console.error("[Firebase] Firestore connection failed: the client is offline. Please check your Firebase configuration (projectId, databaseId).");
    } else if (error.message?.includes('permission-denied')) {
      // This is expected if the test collection is locked down, but it means we ARE connected
      console.error("[Firebase] Firestore permission denied. Please check your security rules for the path being accessed.");
    } else {
      console.warn("[Firebase] Firestore connection test warning:", error.message);
    }
  }
}
testConnection();
