import "./globals.css";
import { useState, useEffect } from "react";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExpenseTracking } from "./components/ExpenseTracking";
import { ChartsInsights } from "./components/ChartInsights";
import { SettingsAlerts } from "./components/SpendingAlerts";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LayoutDashboard, Receipt, BarChart3, Settings } from "lucide-react";
import { LoginForm } from "./components/LoginForm"; // import login form
import { auth, db } from "./firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export interface Budget {
  category: string;
  budgeted: number;
  spent: number;
  color: string;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([
    { category: "Housing", budgeted: 1500, spent: 0, color: "#3B82F6" },
    { category: "Food", budgeted: 500, spent: 0, color: "#10B981" },
    { category: "Transportation", budgeted: 300, spent: 0, color: "#F59E0B" },
    { category: "Utilities", budgeted: 200, spent: 0, color: "#8B5CF6" },
    { category: "Entertainment", budgeted: 200, spent: 0, color: "#EC4899" },
    { category: "Health", budgeted: 150, spent: 0, color: "#06B6D4" },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch transactions from Firestore only if user is logged in
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction));
      setTransactions(data);
    });

    return unsubscribe;
  }, [user]);

  // Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Transaction handlers
  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;
    const docRef = await addDoc(collection(db, "users", user.uid, "transactions"), transaction);
    setDialogOpen(false);
  };

  const handleEditTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user || !editingTransaction) return;
    const docRef = doc(db, "users", user.uid, "transactions", editingTransaction.id);
    await updateDoc(docRef, transaction);
    setEditingTransaction(null);
    setDialogOpen(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    const docRef = doc(db, "users", user.uid, "transactions", id);
    await deleteDoc(docRef);
  };

  const openEditDialog = (transaction: Transaction) => { setEditingTransaction(transaction); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingTransaction(null); };
  const openAddTransactionDialog = () => { setEditingTransaction(null); setDialogOpen(true); };

  // If user is not logged in, show login form
  if (!user) return <LoginForm />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl">SmartBudget</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardOverview
              budgets={budgets}
              transactions={transactions}
              onOpenAddTransaction={openAddTransactionDialog} userName={""} savingsGoal={0}            />
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <ExpenseTracking
              transactions={transactions}
              onOpenAddTransaction={openAddTransactionDialog}
              onEdit={openEditDialog}
              onDelete={handleDeleteTransaction}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <ChartsInsights budgets={budgets} transactions={transactions} onUpdateBudgets={setBudgets} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsAlerts
              budgets={budgets}
              transactions={transactions}
              darkMode={darkMode}
              onUpdateDarkMode={setDarkMode} userName={""} onUpdateUserName={function (name: string): void {
                throw new Error("Function not implemented.");
              } } savingsGoal={0} onUpdateSavingsGoal={function (goal: number): void {
                throw new Error("Function not implemented.");
              } } notificationsEnabled={false} onUpdateNotifications={function (enabled: boolean): void {
                throw new Error("Function not implemented.");
              } }            />
          </TabsContent>
        </Tabs>

        {/* Add Transaction Dialog */}
        <AddTransactionDialog
          open={dialogOpen}
          onOpenChange={closeDialog}
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
          editingTransaction={editingTransaction}
        />
      </div>
    </div>
  );
}
