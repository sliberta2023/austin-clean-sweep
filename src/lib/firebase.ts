
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const configValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingOrPlaceholderKeys: string[] = [];

Object.entries(configValues).forEach(([key, value]) => {
  const envVarName = "NEXT_PUBLIC_FIREBASE_" + key.replace(/([A-Z])/g, '_$1').toUpperCase().replace("CONFIG_","");
  if (!value || (typeof value === 'string' && (value.startsWith("YOUR_") || value.includes("PLACEHOLDER") || value.length < 5))) {
    missingOrPlaceholderKeys.push(`${key} (expected as ${envVarName}=${value || 'undefined'})`);
  }
});

if (missingOrPlaceholderKeys.length > 0) {
  const errorMessage =
    "CRITICAL: Firebase configuration is incomplete or contains placeholders. " +
    "Please ensure all required Firebase environment variables are correctly set in your .env file (located in the project root) " +
    "and that you have RESTARTED your development server after any changes. " +
    "Problematic keys found: \n" + missingOrPlaceholderKeys.map(k => `  - ${k}`).join("\n") +
    "\n\nExample .env structure:\n" +
    "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXX\n" +
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com\n" +
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id\n" +
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com\n" +
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012\n" +
    "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef\n" +
    "NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com\n";
  throw new Error(errorMessage);
}

const firebaseConfig = {
  apiKey: configValues.apiKey!,
  authDomain: configValues.authDomain!,
  projectId: configValues.projectId!,
  storageBucket: configValues.storageBucket!,
  messagingSenderId: configValues.messagingSenderId!,
  appId: configValues.appId!,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
