import "./globals.css";
import { useState, useEffect, useCallback } from "react";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExpenseTracking } from "./components/ExpenseTracking";
import { ChartsInsights } from "./components/ChartInsights";
import { SettingsAlerts } from "./components/SpendingAlerts";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { LoginForm } from "./components/LoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut } from "lucide-react";
import { auth, db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

export interface Budget {
  id?: string;
  category: string;
  budgeted: number;
  spent: number;
  color: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // AUTO LOGOUT: 5 min inactivity
  const logout = useCallback(() => {
    signOut(auth);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const last = localStorage.getItem("lastActivity");
      if (last && Date.now() - parseInt(last) > 5 * 60 * 1000) {
        logout();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [logout]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  // Load transactions
  useEffect(() => {
    if (!user) return;
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const unsub = onSnapshot(transactionsRef, (snapshot) => {
      const trans = snapshot.docs.map((doc) => {
        const { id: _id, ...data } = doc.data() as Transaction;
        return { id: doc.id, ...data };
      });
      setTransactions(trans);
    });
    return () => unsub();
  }, [user]);

  // Load budgets
  useEffect(() => {
    if (!user) return;
    const budgetsRef = collection(db, "users", user.uid, "budgets");
    const unsub = onSnapshot(budgetsRef, (snapshot) => {
      const b = snapshot.docs.map((doc) => {
        const { id: _id, ...data } = doc.data() as Budget;
        return { id: doc.id, ...data };
      });
      setBudgets(b);
    });
    return () => unsub();
  }, [user]);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "transactions"), transaction);
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

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };
  const openAddTransactionDialog = () => {
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  if (!user) return <LoginForm />;

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl">SmartBudget</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-red-100 dark:hover:bg-red-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
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
              onOpenAddTransaction={openAddTransactionDialog}
              userName={user.displayName || "User"}
              savingsGoal={0}
            />
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
              userName={user.displayName || "User"}
              onUpdateUserName={() => {}}
              savingsGoal={0}
              onUpdateSavingsGoal={() => {}}
              notificationsEnabled={true}
              onUpdateNotifications={() => {}}
              darkMode={darkMode}
              onUpdateDarkMode={toggleDarkMode}
            />
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
