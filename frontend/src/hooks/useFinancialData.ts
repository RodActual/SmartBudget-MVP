import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, getDocs 
} from "firebase/firestore";
import type { Transaction, Budget } from "../App";

export function useFinancialData(user: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!user || !user.emailVerified) {
      setLoading(false);
      return;
    }

    const qTransactions = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const qBudgets = query(collection(db, "budgets"), where("userId", "==", user.uid));

    const unsubTrans = onSnapshot(qTransactions, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      // Sort by date descending
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Budget)));
      setLoading(false);
    });

    return () => { unsubTrans(); unsubBudgets(); };
  }, [user]);

  // 2. Calculated Data (Current Month Spending)
  const currentBudgets = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const spentByCategory: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense' && t.date >= startOfMonth)
      .forEach(t => {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      });
    
    return budgets.map(b => ({ ...b, spent: spentByCategory[b.category] || 0 }));
  }, [budgets, transactions]);

  // 3. Actions (CRUD)
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

  const updateBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;
    const batchPromises = [];
    
    // Get existing to find deletions
    const snapshot = await getDocs(query(collection(db, "budgets"), where("userId", "==", user.uid)));
    const existingIds = snapshot.docs.map(d => d.id);
    const newIds = newBudgets.map(b => b.id).filter(Boolean);

    // Update/Create
    for (const b of newBudgets) {
      const data = { ...b, userId: user.uid };
      if (b.id && existingIds.includes(b.id)) {
        batchPromises.push(updateDoc(doc(db, "budgets", b.id), data));
      } else {
        batchPromises.push(addDoc(collection(db, "budgets"), data));
      }
    }

    // Delete removed
    existingIds.filter(id => !newIds.includes(id)).forEach(id => {
      batchPromises.push(deleteDoc(doc(db, "budgets", id)));
    });

    await Promise.all(batchPromises);
  };

  return {
    transactions,
    budgets,
    currentBudgets,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudgets
  };
}