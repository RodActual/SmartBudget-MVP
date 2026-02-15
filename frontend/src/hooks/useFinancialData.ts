import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, getDocs, 
  orderBy, limit, writeBatch 
} from "firebase/firestore";
import type { Transaction, Budget } from "../App";
import { isCurrentMonth } from "../utils/dateUtils"; // ✅ NEW: Import date utility

export function useFinancialData(user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data with Performance Limits
  useEffect(() => {
    if (!user || !user.emailVerified) {
      setLoading(false);
      return;
    }

    const qTransactions = query(
      collection(db, "transactions"), 
      where("userId", "==", user.uid),
      orderBy("date", "desc"), 
      limit(100) 
    );

    const qBudgets = query(
      collection(db, "budgets"), 
      where("userId", "==", user.uid)
    );

    const unsubTrans = onSnapshot(qTransactions, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(data);
    });

    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Budget)));
      setLoading(false);
    });

    return () => {
      unsubTrans();
      unsubBudgets();
    };
  }, [user]);

  // 2. Calculated State (Memoized) - ✅ FIXED: Use date utility for month check
  const currentBudgets = useMemo(() => {
    return budgets.map((budget) => {
      // Calculate spent for this specific budget category in the current month
      const spent = transactions
        .filter((t) => {
          return (
            t.category === budget.category &&
            t.type === "expense" &&
            t.date && 
            !t.archived && // Respect soft delete
            isCurrentMonth(t.date) // ✅ FIXED: Simple, reliable month check
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...budget, spent };
    });
  }, [budgets, transactions]);

  // 3. Handlers
  const addTransaction = async (t: Omit<Transaction, "id">) => {
    if (!user) return;
    await addDoc(collection(db, "transactions"), { ...t, userId: user.uid });
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    await updateDoc(doc(db, "transactions", id), t);
  };

  const deleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  // INTEGRITY FIX: Use Atomic Batch instead of Loop
  const updateBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      
      // Get existing budgets to determine what to delete
      const snapshot = await getDocs(query(collection(db, "budgets"), where("userId", "==", user.uid)));
      const existingIds = snapshot.docs.map(d => d.id);
      const newIds = newBudgets.map(b => b.id).filter(Boolean) as string[];

      // 1. Identify budgets to delete (existing but not in new list)
      const idsToDelete = existingIds.filter(id => !newIds.includes(id));
      idsToDelete.forEach(id => {
        const ref = doc(db, "budgets", id);
        batch.delete(ref);
      });

      // 2. Identify budgets to update or create
      for (const b of newBudgets) {
        // Ensure userId is attached for security rules
        const data = { ...b, userId: user.uid }; 
        
        if (b.id && existingIds.includes(b.id)) {
          // Update existing
          const ref = doc(db, "budgets", b.id);
          batch.update(ref, data);
        } else {
          // Create new
          const ref = doc(collection(db, "budgets")); // Auto-ID
          batch.set(ref, data);
        }
      }

      // 3. Commit all changes atomically
      await batch.commit();
      
    } catch (error) {
      console.error("Failed to batch update budgets:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  return {
    transactions,
    budgets,
    currentBudgets,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudgets,
  };
}