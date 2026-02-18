import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    User
} from 'firebase/auth';
import { getAuthInstance } from './firebaseService';

// WEB CLIENT ID: 703193379193-b4cf26def935d81d9e3fa8.apps.googleusercontent.com (from firebase config appId hinting or separate setup)
// Note: User needs to configure Google Cloud Console for actual keys.
// For this implementation, I will set up the structure.
// The user provided '703193379193' as messagingSenderId, often related to project number.
// I will use a placeholder or the likely Client ID if visible, but usually it needs distinct iOS/Android/Web IDs.
// I'll use a generic setup that the user can fill or matches standard expo-auth-session patterns.

export const AuthService = {
    // Subscribe to auth state changes
    subscribeToAuthState(callback: (user: User | null) => void) {
        const auth = getAuthInstance();
        return onAuthStateChanged(auth, callback);
    },

    async signUpWithEmail(email: string, password: string): Promise<User> {
        const auth = getAuthInstance();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Sign Up Error", error);
            throw error;
        }
    },

    async signInWithEmail(email: string, password: string): Promise<User> {
        const auth = getAuthInstance();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Sign In Error", error);
            throw error;
        }
    },

    // Sign in with Google ID Token (obtained from Expo Auth Session)
    async signInWithGoogle(idToken: string) {
        try {
            const auth = getAuthInstance();
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
        } catch (error) {
            console.error('[AuthService] Google Sign-In failed', error);
            throw error;
        }
    },

    // Sign out
    async signOut() {
        try {
            const auth = getAuthInstance();
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('[AuthService] Sign Out failed', error);
            throw error;
        }
    },

    getCurrentUser() {
        const auth = getAuthInstance();
        return auth.currentUser;
    },
};
