import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserSettings {
  userName: string;
  savingsGoal: number;
  isLoading: boolean;
  updateUserName: (name: string) => void;
  updateSavingsGoal: (goal: number) => void;
}

/**
 * Custom hook for managing user settings (name, savings goal)
 * Automatically loads from and saves to Firestore
 * Shared between SettingsPage and DashboardOverview
 */
export function useUserSettings(): UserSettings {
  const [userName, setUserName] = useState<string>("User");
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const settingsRef = doc(db, "userSettings", user.uid);
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setUserName(data.userName || "User");
          setSavingsGoal(data.savingsGoal || 0);
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Auto-save to Firestore when settings change
  const saveSettings = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      await setDoc(settingsRef, {
        userName,
        savingsGoal,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  }, [userName, savingsGoal]);

  // Debounced auto-save (500ms after last change)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const timer = setTimeout(() => {
      saveSettings();
    }, 500);

    return () => clearTimeout(timer);
  }, [userName, savingsGoal, isLoading, saveSettings]);

  // Public API
  const updateUserName = useCallback((name: string) => {
    setUserName(name);
  }, []);

  const updateSavingsGoal = useCallback((goal: number) => {
    setSavingsGoal(goal);
  }, []);

  return {
    userName,
    savingsGoal,
    isLoading,
    updateUserName,
    updateSavingsGoal,
  };
}