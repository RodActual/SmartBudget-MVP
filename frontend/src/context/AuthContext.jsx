import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from "./firebase";

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';

// The Firebase configuration and app initialization are assumed to be in a separate file (e.g., ../firebase.js)
// You must ensure 'auth' is exported from your firebase initialization file.
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Change the export of the component below to just 'const'
const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get the auth instance (assuming it's initialized globally in your project setup)
    // NOTE: Replace 'getAuth()' with the actual imported 'auth' instance if stored in a variable.
    const auth = getAuth(); 

    // --- Authentication Functions ---
    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    // --- Effect for State Management ---
    useEffect(() => {
        // Sets up a listener that runs when the auth state changes (login, logout, token refresh)
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, [auth]);

    // Value provided to components
    const value = {
        currentUser,
        signup,
        login,
        logout,
        // The user ID (UID) is the critical piece for filtering data securely
        userId: currentUser ? currentUser.uid : null, 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Add default export to make it easier for App.jsx to import it
export default AuthProvider;

// Re-export AuthProvider as a named export for explicit imports, if desired
export { AuthProvider };