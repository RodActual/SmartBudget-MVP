import { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../firebase";

const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function useInactivity(user: any) {
  const [showWarning, setShowWarning] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    auth.signOut();
    setShowWarning(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (!user) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    setShowWarning(false);
    
    // Warn 2 mins before logout
    warningRef.current = setTimeout(() => setShowWarning(true), TIMEOUT_MS - (2 * 60 * 1000));
    // Logout
    timerRef.current = setTimeout(logout, TIMEOUT_MS);
  }, [user, logout]);

  const continueSession = () => resetTimer();

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    
    events.forEach(e => window.addEventListener(e, handleActivity));
    resetTimer();
    
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, resetTimer]);

  return { showWarning, continueSession, logout };
}