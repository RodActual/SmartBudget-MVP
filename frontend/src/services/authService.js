import { API_BASE_URL } from "../config";

const response = await fetch(`${API_BASE_URL}/expenses`, { method: "GET" });

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase';

/**
 * Register a new user
 */
export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get Firebase ID token
    const token = await user.getIdToken();
    
    // Optional: Send additional data to backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        username: username || email.split('@')[0]
      })
    });
    
    return {
      user,
      token,
      success: true
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Sign in an existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get Firebase ID token
    const token = await user.getIdToken();
    
    // Store token in localStorage for API requests
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user.uid);
    
    return {
      user,
      token,
      success: true
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get current user's ID token
 */
export const getCurrentToken = async () => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};