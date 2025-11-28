// src/firebaseFunctions.ts
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { app } from "./firebase"; // your Firebase app instance
import type { Transaction, Budget } from "./App";

const db = getFirestore(app);
const transactionsCollection = collection(db, "transactions");
const budgetsCollection = collection(db, "budgets");

// -------------------------
// TRANSACTION FUNCTIONS
// -------------------------

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const q = query(transactionsCollection, where("userId", "==", userId), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const addTransactionToFirestore = async (userId: string, transaction: Omit<Transaction, "id">) => {
  await addDoc(transactionsCollection, { ...transaction, userId });
};

export const updateTransactionInFirestore = async (transactionId: string, updatedData: Partial<Transaction>) => {
  const transactionDoc = doc(db, "transactions", transactionId);
  await updateDoc(transactionDoc, updatedData);
};

export const deleteTransactionFromFirestore = async (transactionId: string) => {
  const transactionDoc = doc(db, "transactions", transactionId);
  await deleteDoc(transactionDoc);
};

// -------------------------
// BUDGET FUNCTIONS
// -------------------------

export const getUserBudgets = async (userId: string): Promise<Budget[]> => {
  const q = query(budgetsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
};

export const updateBudgetInFirestore = async (budgetId: string, updatedData: Partial<Budget>) => {
  const budgetDoc = doc(db, "budgets", budgetId);
  await updateDoc(budgetDoc, updatedData);
};
