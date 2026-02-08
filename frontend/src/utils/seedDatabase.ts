import { db } from "../firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

// Helper for dates
const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// SCENARIO 1: HEALTHY (Good saving habits)
const getHealthyData = () => ({
  budgets: [
    // FIXED: Changed 'amount' to 'budgeted' to match app data model
    { category: "Housing", budgeted: 2000, color: "bg-blue-500" },
    { category: "Groceries", budgeted: 600, color: "bg-green-500" },
    { category: "Dining Out", budgeted: 300, color: "bg-orange-500" },
  ],
  transactions: [
    { amount: 4000, category: "Income", description: "Paycheck", type: "income", days: 0 },
    { amount: 1500, category: "Housing", description: "Rent", type: "expense", days: -2 },
    { amount: 150, category: "Groceries", description: "Weekly Shop", type: "expense", days: -5 },
  ]
});

// SCENARIO 2: CRISIS (Triggers ALL Alerts)
const getCrisisData = () => ({
  budgets: [
    // FIXED: Changed 'amount' to 'budgeted'
    { category: "Housing", budgeted: 1500, color: "bg-blue-500" },
    { category: "Dining Out", budgeted: 200, color: "bg-orange-500" }, 
    { category: "Emergency", budgeted: 1000, color: "bg-red-500" },
  ],
  transactions: [
    // 1. Large Transaction Alert (> $500)
    { amount: 1200, category: "Emergency", description: "Car Repair", type: "expense", days: 0 }, 
    
    // 2. Budget Exceeded Alert (Dining Out > $200)
    { amount: 150, category: "Dining Out", description: "Fancy Dinner", type: "expense", days: -1 },
    { amount: 80, category: "Dining Out", description: "Brunch", type: "expense", days: -3 }, // Total $230 (115%)

    // 3. Budget Warning Alert (Housing at 100%)
    { amount: 1500, category: "Housing", description: "Rent", type: "expense", days: -5 },

    // 4. Low Income (Negative Cashflow)
    { amount: 2000, category: "Income", description: "Paycheck", type: "income", days: -10 },
  ]
});

export const seedDatabase = async (userId: string, scenario: 'healthy' | 'crisis' = 'healthy') => {
  const batch = writeBatch(db);
  
  // Select Data Source
  const data = scenario === 'crisis' ? getCrisisData() : getHealthyData();

  console.log(`Seeding ${scenario} scenario for user ${userId}...`);

  // 1. Add Budgets
  data.budgets.forEach((b) => {
    const newDocRef = doc(collection(db, "budgets"));
    batch.set(newDocRef, {
      userId,
      category: b.category,
      budgeted: b.budgeted, // Using correct key now
      color: b.color,
      spent: 0, 
      createdAt: new Date().toISOString(),
    });
  });

  // 2. Add Transactions
  data.transactions.forEach((t) => {
    const newDocRef = doc(collection(db, "transactions"));
    batch.set(newDocRef, {
      userId,
      amount: t.amount,
      category: t.category,
      description: t.description,
      type: t.type,
      date: getRelativeDate(t.days),
    });
  });

  await batch.commit();
  console.log("Database seeded successfully!");
};