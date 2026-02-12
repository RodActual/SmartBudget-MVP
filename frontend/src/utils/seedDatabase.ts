import { db } from "../firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

// Helper for dates
const getRelativeDate = (monthsBack: number, dayOfMonth: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsBack);
  date.setDate(dayOfMonth);
  return date.toISOString();
};

// Helper to add random "noise" to a value (+/- percentage)
const addVolatility = (value: number, intensity: number = 0.2) => {
  const change = value * intensity;
  return value + (Math.random() * (change * 2) - change);
};

export const seedDatabase = async (userId: string, scenario: 'healthy' | 'crisis' = 'healthy') => {
  const batch = writeBatch(db);
  
  // 1. SET UP THE BUDGETS
  const budgetList = scenario === 'healthy' 
    ? [
        { category: "Housing", budgeted: 2000, color: "#2563eb" },
        { category: "Groceries", budgeted: 600, color: "#16a34a" },
        { category: "Dining Out", budgeted: 300, color: "#9333ea" },
        { category: "Entertainment", budgeted: 250, color: "#db2777" },
        { category: "Savings", budgeted: 500, color: "#059669" },
      ]
    : [
        { category: "Housing", budgeted: 1500, color: "#2563eb" },
        { category: "Dining Out", budgeted: 200, color: "#ea580c" },
        { category: "Emergency", budgeted: 1000, color: "#dc2626" },
        { category: "Medical", budgeted: 400, color: "#0d9488" },
      ];

  budgetList.forEach((b) => {
    const bRef = doc(collection(db, "budgets"));
    batch.set(bRef, {
      userId,
      ...b,
      spent: 0,
      lastReset: Date.now(),
      createdAt: new Date().toISOString(),
    });
  });

  // 2. GENERATE 12 MONTHS OF INCONSISTENT TRANSACTIONS
  for (let i = 0; i < 12; i++) {
    // A. INCOME: Mostly stable but with occasional "valleys" or "hills" (Side hustles/Bonuses)
    const baseIncome = scenario === 'healthy' ? 4200 : 3000;
    const monthlyIncome = (i === 4 || i === 8) ? baseIncome * 1.25 : baseIncome; // Two "Hills" for bonuses
    
    const incRef = doc(collection(db, "transactions"));
    batch.set(incRef, {
      userId,
      amount: monthlyIncome,
      category: "Income",
      description: i === 4 || i === 8 ? "Salary + Bonus" : "Monthly Paycheck",
      type: "income",
      date: getRelativeDate(i, 1),
    });

    // B. HOUSING: Always stable (The "Flatline")
    const rentRef = doc(collection(db, "transactions"));
    batch.set(rentRef, {
      userId,
      amount: scenario === 'healthy' ? 2000 : 1500,
      category: "Housing",
      description: "Monthly Rent",
      type: "expense",
      date: getRelativeDate(i, 2),
    });

    // C. GROCERIES: High volatility (Hills and Valleys)
    // Simulating "Stock up months" vs "Eating from the pantry months"
    const groceryRef = doc(collection(db, "transactions"));
    batch.set(groceryRef, {
      userId,
      amount: addVolatility(550, 0.35), // High volatility for visual "jaggedness"
      category: "Groceries",
      description: "Grocery Run",
      type: "expense",
      date: getRelativeDate(i, 12),
    });

    // D. DINING & ENTERTAINMENT: Massive peaks for holidays/celebrations
    const isHighSpendingMonth = i === 2 || i === 6 || i === 11; // March, July, December peaks
    const diningAmount = isHighSpendingMonth ? 600 : addVolatility(200, 0.5);
    
    const diningRef = doc(collection(db, "transactions"));
    batch.set(diningRef, {
      userId,
      amount: diningAmount,
      category: "Dining Out",
      description: isHighSpendingMonth ? "Celebration/Holiday Dinner" : "Casual Dining",
      type: "expense",
      date: getRelativeDate(i, 22),
    });

    // E. THE "CRISIS" SPIKE (Only for Scenario 2, Month 0)
    if (scenario === 'crisis' && i === 0) {
      const crisisRef = doc(collection(db, "transactions"));
      batch.set(crisisRef, {
        userId,
        amount: 1250,
        category: "Emergency",
        description: "Emergency Root Canal",
        type: "expense",
        date: getRelativeDate(i, 15),
      });
    }

    // F. RANDOM OUTLIERS (The "Valleys")
    // Every few months, add a small unexpected expense to keep the chart interesting
    if (i % 3 === 0) {
      const miscRef = doc(collection(db, "transactions"));
      batch.set(miscRef, {
        userId,
        amount: addVolatility(100, 0.8),
        category: scenario === 'healthy' ? "Entertainment" : "Medical",
        description: "Unexpected Cost",
        type: "expense",
        date: getRelativeDate(i, 28),
      });
    }
  }

  await batch.commit();
  console.log(`Successfully seeded 12 months of ${scenario} data with jagged trends.`);
};