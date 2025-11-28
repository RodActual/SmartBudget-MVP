// src/hooks/useAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface UserSettings {
  userName: string;
  savingsGoal: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
}

// Inactivity timeout (15 minutes)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    userName: 'User',
    savingsGoal: 0,
    notificationsEnabled: true,
    darkMode: false,
  });

const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Load user settings from Firestore
  const loadUserSettings = useCallback(async (userId: string) => {
    try {
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data() as UserSettings;
        setUserSettings(data);
        
        // Apply dark mode
        if (data.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Create default settings
        await setDoc(settingsRef, userSettings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  }, []);

  // Save user settings to Firestore
  const saveUserSettings = useCallback(async (settings: Partial<UserSettings>) => {
    if (!authState.user) return;

    try {
      const settingsRef = doc(db, 'userSettings', authState.user.uid);
      const updatedSettings = { ...userSettings, ...settings };
      
      await setDoc(settingsRef, updatedSettings, { merge: true });
      setUserSettings(updatedSettings);
      
      // Apply dark mode if changed
      if (settings.darkMode !== undefined) {
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }, [authState.user, userSettings]);

  // Register new user
  const register = useCallback(async (email: string, password: string, username?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user settings document
      const settingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(settingsRef, {
        userName: username || email.split('@')[0],
        savingsGoal: 0,
        notificationsEnabled: true,
        darkMode: false,
      });
      
      return { success: true, user };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Login user
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout user
  const logout = useCallback(async (isAutoLogout = false) => {
    try {
      await signOut(auth);
      
      // Clear timers
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      
      setShowInactivityWarning(false);
      
      if (isAutoLogout) {
        alert('You have been logged out due to inactivity.');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!authState.user) return;

    // Clear existing timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowInactivityWarning(false);

    // Show warning before logout
    warningTimer.current = setTimeout(() => {
      setShowInactivityWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer
    inactivityTimer.current = setTimeout(() => {
      logout(true);
    }, INACTIVITY_TIMEOUT);
  }, [authState.user, logout]);

  // Continue session (dismiss warning)
  const continueSession = useCallback(() => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      
      if (user) {
        await loadUserSettings(user.uid);
      }
    });

    return () => unsubscribe();
  }, [loadUserSettings]);

  // Inactivity detection
  useEffect(() => {
    if (!authState.user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [authState.user, resetInactivityTimer]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    userSettings,
    showInactivityWarning,
    register,
    login,
    logout,
    continueSession,
    saveUserSettings,
  };
}