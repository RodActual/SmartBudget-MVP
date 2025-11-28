import "./globals.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExpenseTracking } from "./components/ExpenseTracking";
import { ChartsInsights } from "./components/ChartInsights";
import { SettingsAlerts } from "./components/SpendingAlerts";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { LoginForm } from "./components/LoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

// Types
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  userId?: string;
}

export interface Budget {
  id?: string;
  category: string;
  budgeted: number;
  spent: number;
  color: string;
  userId?: string;
}

// Inactivity timeout (15 mins)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [userName, setUserName] = useState("User");
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Inactivity tracking
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!user) return;

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowInactivityWarning(false);

    warningTimer.current = setTimeout(() => setShowInactivityWarning(true), INACTIVITY_TIMEOUT - 2 * 60 * 1000);

    inactivityTimer.current = setTimeout(() => handleLogout(true), INACTIVITY_TIMEOUT);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(event => document.addEventListener(event, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [user, resetInactivityTimer]);

  // Firestore listeners
  useEffect(() => {
    if (!user) return;

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const budgetsQuery = query(
      collection(db, "budgets"),
      where("userId", "==", user.uid)
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction));
      setTransactions(data);
    }, (error) => console.error("Error fetching transactions:", error));

    const unsubscribeBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const data: Budget[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Budget));
      setBudgets(data);
    }, (error) => console.error("Error fetching budgets:", error));

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [user]);

  // Logout
  const handleLogout = async (isAutoLogout = false) => {
    try {
      await auth.signOut();
      setTransactions([]);
      setBudgets([]);
      setUserName("User");
      setSavingsGoal(0);
      setActiveTab("dashboard");

      if (isAutoLogout) alert("You have been logged out due to inactivity.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Continue session
  const handleContinueSession = () => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  };

  // Add transaction
  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId: user.uid,
      });

      // Update UI immediately
      setTransactions(prev => [...prev, { ...transaction, id: docRef.id, userId: user.uid }]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Edit transaction
  const handleEditTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!editingTransaction || !user) return;

    try {
      const docRef = doc(db, "transactions", editingTransaction.id);
      await updateDoc(docRef, transaction);
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...transaction } : t));
      setEditingTransaction(null);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error editing transaction:", error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, "transactions", id);
      await deleteDoc(docRef);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
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

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      await updateDoc(settingsRef, {
        userName,
        savingsGoal,
        notificationsEnabled,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  if (!user && !loading) return <LoginForm onLogin={() => {}} />;

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-2xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-200 rounded-lg shadow-md p-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">SmartBudget</h1>
            <p className="text-sm text-black mt-1">Your personal finance manager</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">{user?.email}</span>
            <Button onClick={() => handleLogout(false)} variant="destructive" size="sm">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
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
            <ChartsInsights
              budgets={budgets}
              transactions={transactions}
              onUpdateBudgets={setBudgets}
            />
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
              onSaveSettings={handleSaveSettings}
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

        {/* Inactivity Warning */}
        <AlertDialog open={showInactivityWarning} onOpenChange={setShowInactivityWarning}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">Are you still there?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                You've been inactive for a while. You'll be automatically logged out in 2 minutes for security reasons.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleContinueSession}>
                Continue Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
