import "./globals.css";
import { useState, useEffect } from "react";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExpenseTracking } from "./components/ExpenseTracking";
import { ChartsInsights } from "./components/ChartInsights";
import { SettingsAlerts } from "./components/SpendingAlerts";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LayoutDashboard, Receipt, BarChart3, Settings } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [userName, setUserName] = useState("Sarah");
  const [savingsGoal, setSavingsGoal] = useState(5000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Setup Firebase listeners
  useEffect(() => {
    const transactionsUnsub = onSnapshot(collection(db, "transactions"), snapshot => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      setTransactions(transactionsData);
    });

    const budgetsUnsub = onSnapshot(collection(db, "budgets"), snapshot => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Budget[];
      setBudgets(budgetsData);
    });

    return () => {
      transactionsUnsub();
      budgetsUnsub();
    };
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Transaction handlers
  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    await addDoc(collection(db, "transactions"), transaction);
    setDialogOpen(false);
  };

  const handleEditTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!editingTransaction) return;
    const docRef = doc(db, "transactions", editingTransaction.id);
    await updateDoc(docRef, transaction);
    setEditingTransaction(null);
    setDialogOpen(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  const openEditDialog = (transaction: Transaction) => { setEditingTransaction(transaction); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingTransaction(null); };
  const openAddTransactionDialog = () => { setEditingTransaction(null); setDialogOpen(true); };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl">SmartBudget</h1>
            <p className="text-sm text-muted-foreground mt-1">Your personal finance manager</p>
          </div>
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
              userName={userName}
              savingsGoal={savingsGoal}
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
              userName={userName}
              onUpdateUserName={setUserName}
              savingsGoal={savingsGoal}
              onUpdateSavingsGoal={setSavingsGoal}
              notificationsEnabled={notificationsEnabled}
              onUpdateNotifications={setNotificationsEnabled}
              darkMode={darkMode}
              onUpdateDarkMode={setDarkMode}
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
