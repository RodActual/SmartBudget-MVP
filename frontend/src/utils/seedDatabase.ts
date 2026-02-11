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
    // Hex codes used instead of Tailwind classes for Chart compatibility
    { category: "Housing", budgeted: 2000, color: "#2563eb" }, // Blue-600
    { category: "Groceries", budgeted: 600, color: "#16a34a" }, // Green-600
    { category: "Dining Out", budgeted: 300, color: "#9333ea" }, // Purple-600
    { category: "Entertainment", budgeted: 200, color: "#db2777" }, // Pink-600
    { category: "Savings", budgeted: 500, color: "#059669" }, // Emerald-600
  ],
  transactions: [
    { amount: 4200, category: "Income", description: "Tech Corp Salary", type: "income", days: 0 },
    { amount: 2000, category: "Housing", description: "Monthly Rent", type: "expense", days: -2 },
    { amount: 150, category: "Groceries", description: "Trader Joe's", type: "expense", days: -3 },
    { amount: 45, category: "Dining Out", description: "Thai Food", type: "expense", days: -5 },
    { amount: 120, category: "Entertainment", description: "Concert Tickets", type: "expense", days: -10 },
  ]
});

// SCENARIO 2: CRISIS (Triggers ALL Alerts)
const getCrisisData = () => ({
  budgets: [
    { category: "Housing", budgeted: 1500, color: "#2563eb" }, // Blue-600
    { category: "Dining Out", budgeted: 200, color: "#ea580c" }, // Orange-600
    { category: "Emergency", budgeted: 1000, color: "#dc2626" }, // Red-600
    { category: "Medical", budgeted: 500, color: "#0d9488" }, // Teal-600
  ],
  transactions: [
    // 1. Large Transaction Alert (> $500)
    { amount: 1200, category: "Emergency", description: "Car Transmission Repair", type: "expense", days: 0 }, 
    
    // 2. Budget Exceeded Alert (Dining Out > $200)
    { amount: 150, category: "Dining Out", description: "Fancy Anniversary Dinner", type: "expense", days: -1 },
    { amount: 80, category: "Dining Out", description: "Brunch w/ Friends", type: "expense", days: -3 }, // Total $230 (115%)

    // 3. Budget Warning Alert (Housing at 100%)
    { amount: 1500, category: "Housing", description: "Rent Payment", type: "expense", days: -5 },

    // 4. Medical Expense
    { amount: 350, category: "Medical", description: "Urgent Care Copay", type: "expense", days: -6 },

    // 5. Low Income (Negative Cashflow)
    { amount: 2000, category: "Income", description: "Paycheck (Half)", type: "income", days: -10 },
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
      budgeted: b.budgeted,
      color: b.color,
      spent: 0, 
      lastReset: Date.now(),
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