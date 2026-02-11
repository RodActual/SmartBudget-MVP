import { db } from "../firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";

export const clearDatabase = async (userId: string) => {
  const batch = writeBatch(db);
  let operationCount = 0;

  console.log("Clearing data for user:", userId);

  // 1. Get all Transactions
  const transQuery = query(collection(db, "transactions"), where("userId", "==", userId));
  const transSnapshot = await getDocs(transQuery);
  transSnapshot.forEach((document) => {
    batch.delete(doc(db, "transactions", document.id));
    operationCount++;
  });

  // 2. Get all Budgets
  const budgetQuery = query(collection(db, "budgets"), where("userId", "==", userId));
  const budgetSnapshot = await getDocs(budgetQuery);
  budgetSnapshot.forEach((document) => {
    batch.delete(doc(db, "budgets", document.id));
    operationCount++;
  });

  // 3. Commit if there is anything to delete
  if (operationCount > 0) {
    await batch.commit();
    console.log(`Deleted ${operationCount} documents.`);
  } else {
    console.log("No data to clear.");
  }
};