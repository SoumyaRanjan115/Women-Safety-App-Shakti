import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  writeBatch,
  doc,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from 'firebase/auth';

import { Contact } from '../types';

// Your Firebase web config (Expo app)
const firebaseConfig = {
  apiKey: 'AIzaSyCcr239Ly7JQiUbSwY_XcIxAEaFS615Qj4',
  authDomain: 'women-safety-app-3cd27.firebaseapp.com',
  projectId: 'women-safety-app-3cd27',
  storageBucket: 'women-safety-app-3cd27.firebasestorage.app',
  messagingSenderId: '703193379193',
  appId: '1:703193379193:web:b4cf26def935d81d9e3fa8',
};

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function ensureFirebase() {
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
  }
}

export const getFirebaseApp = (): FirebaseApp => {
  ensureFirebase();
  return firebaseApp as FirebaseApp;
};

export const getDb = (): Firestore => {
  ensureFirebase();
  return db as Firestore;
};

export const getAuthInstance = (): Auth => {
  ensureFirebase();
  return auth as Auth;
};

// Ensure we always have a user (anonymous auth is enough)
export const ensureUser = async (): Promise<User> => {
  const auth = getAuthInstance();

  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise<User>((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsub();
          resolve(user);
        }
      },
      (err) => {
        unsub();
        reject(err);
      }
    );

    signInAnonymously(auth).catch((err) => {
      console.error('[Firebase] Anonymous sign-in failed', err);
      reject(err);
    });
  });
};

export const syncContactsToCloud = async (
  userId: string,
  contacts: Contact[]
): Promise<void> => {
  try {
    if (!userId) {
      console.warn('[Firebase] Missing userId – skipping contact sync.');
      return;
    }

    const db = getDb();
    const colRef = collection(db, 'users', userId, 'contacts');
    const batch = writeBatch(db);

    contacts.forEach((contact) => {
      const ref = doc(colRef, contact.id);
      batch.set(ref, contact, { merge: true });
    });

    await batch.commit();
    console.log(
      `[Firebase] Synced ${contacts.length} contacts for user ${userId}`
    );
  } catch (err) {
    console.error('[Firebase] Failed to sync contacts to Firestore', err);
  }
};

export const fetchContactsFromCloud = async (
  userId: string
): Promise<Contact[]> => {
  try {
    if (!userId) return [];

    const db = getDb();
    const colRef = collection(db, 'users', userId, 'contacts');
    const snapshot = await getDocs(colRef);

    const contacts: Contact[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Partial<Contact>;
      if (data && data.id && data.name && data.phone) {
        contacts.push({
          id: data.id,
          name: data.name,
          phone: data.phone,
          isEmergency: data.isEmergency ?? true,
        });
      }
    });

    console.log(
      `[Firebase] Loaded ${contacts.length} contacts for user ${userId}`
    );
    return contacts;
  } catch (err) {
    console.error('[Firebase] Failed to fetch contacts from Firestore', err);
    return [];
  }
};


