import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, getDocs, 
  orderBy, limit, writeBatch 
} from "firebase/firestore";
import type { Transaction, Budget } from "../App";
import { isCurrentMonth } from "../utils/dateUtils";
import type { SavingsVault } from "../utils/shieldLogic"; 

export function useFinancialData(user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsBuckets, setSavingsBuckets] = useState<SavingsVault[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── 1. FETCH DATA (LISTENERS) ─────────────────────────────────────────────
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

    const qVaults = query(
      collection(db, "savingsBuckets"), 
      where("userId", "==", user.uid)
    );

    const unsubTrans = onSnapshot(qTransactions, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
    });

    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Budget)));
    });

    const unsubVaults = onSnapshot(qVaults, (snap) => {
      setSavingsBuckets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavingsVault)));
      setLoading(false);
    });

    return () => {
      unsubTrans();
      unsubBudgets();
      unsubVaults();
    };
  }, [user]);

  // ─── 2. CALCULATED STATE (MEMOIZED) ────────────────────────────────────────
  const currentBudgets = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => {
          return (
            t.category === budget.category &&
            t.type === "expense" &&
            t.date && 
            !t.archived && 
            isCurrentMonth(t.date)
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...budget, spent };
    });
  }, [budgets, transactions]);

  // ─── 3. TRANSACTION HANDLERS ───────────────────────────────────────────────
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

  // ─── 4. BUDGET HANDLERS ────────────────────────────────────────────────────
  const updateBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(query(collection(db, "budgets"), where("userId", "==", user.uid)));
      const existingIds = snapshot.docs.map(d => d.id);
      const newIds = newBudgets.map(b => b.id).filter(Boolean) as string[];

      const idsToDelete = existingIds.filter(id => !newIds.includes(id));
      idsToDelete.forEach(id => batch.delete(doc(db, "budgets", id)));

      for (const b of newBudgets) {
        const data = { ...b, userId: user.uid }; 
        if (b.id && existingIds.includes(b.id)) {
          batch.update(doc(db, "budgets", b.id), data);
        } else {
          batch.set(doc(collection(db, "budgets")), data);
        }
      }
      await batch.commit();
    } catch (error) {
      console.error("Failed to batch update budgets:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  // ─── 5. VAULT (SHIELD) HANDLERS ────────────────────────────────────────────
  const addVault = async (vault: Omit<SavingsVault, "id">) => {
    if (!user) return;
    await addDoc(collection(db, "savingsBuckets"), { ...vault, userId: user.uid });
  };

  const updateVault = async (id: string, updates: Partial<SavingsVault>) => {
    if (!user) return;
    await updateDoc(doc(db, "savingsBuckets", id), updates);
  };

  const deleteVault = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "savingsBuckets", id));
  };

  return {
    transactions,
    budgets,
    currentBudgets,
    savingsBuckets,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudgets,
    addVault,         // <-- Exported for UI
    updateVault,      // <-- Exported for UI
    deleteVault,      // <-- Exported for UI
  };
}