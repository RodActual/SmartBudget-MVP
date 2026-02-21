import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// 1. UPDATED INTERFACE: Tells TypeScript these variables exist
interface UserSettings {
  userName: string;
  savingsGoal: number;
  monthlyIncome: number;       // <-- Added for Shield Logic
  shieldAllocationPct: number; // <-- Added for Shield Logic
  isLoading: boolean;
  updateUserName: (name: string) => void;
  updateSavingsGoal: (goal: number) => void;
  updateIncomeSettings: (income: number, pct: number) => void; // <-- Added
}

export function useUserSettings(): UserSettings {
  const [userName, setUserName] = useState<string>("User");
  const [savingsGoal, setSavingsGoal] = useState<number>(0);
  
  // 2. NEW STATE VARIABLES
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [shieldAllocationPct, setShieldAllocationPct] = useState<number>(20);
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
          
          // 3. READ FROM FIRESTORE
          setMonthlyIncome(data.monthlyIncome || 0);               
          setShieldAllocationPct(data.shieldAllocationPct || 20);  
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
        monthlyIncome,        // 4. WRITE TO FIRESTORE
        shieldAllocationPct,  // 4. WRITE TO FIRESTORE
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user settings:", error);
    }
  }, [userName, savingsGoal, monthlyIncome, shieldAllocationPct]);

  // Debounced auto-save (500ms after last change)
  useEffect(() => {
    if (isLoading) return; 

    const timer = setTimeout(() => {
      saveSettings();
    }, 500);

    return () => clearTimeout(timer);
  }, [userName, savingsGoal, monthlyIncome, shieldAllocationPct, isLoading, saveSettings]);

  // Public API
  const updateUserName = useCallback((name: string) => {
    setUserName(name);
  }, []);

  const updateSavingsGoal = useCallback((goal: number) => {
    setSavingsGoal(goal);
  }, []);

  const updateIncomeSettings = useCallback((income: number, pct: number) => {
    setMonthlyIncome(income);
    setShieldAllocationPct(pct);
  }, []);

  // 5. EXPORT EVERYTHING TO THE APP
  return {
    userName,
    savingsGoal,
    monthlyIncome,
    shieldAllocationPct,
    isLoading,
    updateUserName,
    updateSavingsGoal,
    updateIncomeSettings,
  };
}