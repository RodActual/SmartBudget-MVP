import "./globals.css";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { DashboardOverview } from "./components/DashboardOverview";
import { ExpenseTracking } from "./components/ExpenseTracking";
import { ChartsInsights } from "./components/ChartInsights";
import { SettingsPage } from "./components/SettingsPage";
import { AddTransactionDialog } from "./components/AddTransactionDialog";
import { LoginForm } from "./components/LoginForm";
import { AlertsNotificationBell } from "./components/AlertsNotificationBell";
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

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
}
 from "firebase/firestore";

import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser 
} from "firebase/auth";

import logo from './assets/smartbudget-logo.png'; 

// Types (omitted for brevity, assume they are the same)
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
  lastReset: number;
  id?: string;
  category: string;
  budgeted: number;
  spent: number;
  color: string;
  userId?: string;
}

export interface AlertSettings {
  budgetWarningEnabled: boolean;
  budgetWarningThreshold: number;
  budgetExceededEnabled: boolean;
  largeTransactionEnabled: boolean;
  largeTransactionAmount: number;
  weeklyReportEnabled: boolean;
  dismissedAlertIds: string[]; 
}


// Inactivity timeout (15 mins)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// NEW HELPER FUNCTION
/**
 * Returns the date string (YYYY-MM-DD) for the 1st day of the current month
 * to be used as the start of the current budget period.
 */
const getCurrentMonthStartDate = () => {
    const now = new Date();
    // Set to the 1st day of the month
    now.setDate(1); 
    // Reset time to 00:00:00 to include the entire day
    now.setHours(0, 0, 0, 0); 
    return now.toISOString().substring(0, 10); // "YYYY-MM-DD"
};


export default function App() {
  // State Initialization
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]); // This holds the base budget data
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [userName, setUserName] = useState("User");
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    budgetWarningEnabled: true,
    budgetWarningThreshold: 80,
    budgetExceededEnabled: true,
    largeTransactionEnabled: true,
    largeTransactionAmount: 500,
    weeklyReportEnabled: false,
    dismissedAlertIds: [],
  });

  // Inactivity tracking
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to save settings to Firestore (Wrapped in useCallback)
  const handleSaveSettings = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      
      const settingsData = {
        userName,
        savingsGoal,
        notificationsEnabled,
        alertSettings,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(settingsRef, settingsData, { merge: true });

    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [user, userName, savingsGoal, notificationsEnabled, alertSettings]);

  // Auth listener and initial settings load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Load user settings when user logs in
        try {
          const settingsRef = doc(db, "userSettings", currentUser.uid);
          const settingsDoc = await getDoc(settingsRef);
          
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setUserName(data.userName || "User");
            setSavingsGoal(data.savingsGoal || 0);
            setNotificationsEnabled(data.notificationsEnabled ?? true);
            
            // Load alert settings including dismissedAlertIds
            setAlertSettings(data.alertSettings || {
              budgetWarningEnabled: true,
              budgetWarningThreshold: 80,
              budgetExceededEnabled: true,
              largeTransactionEnabled: true,
              largeTransactionAmount: 500,
              weeklyReportEnabled: false,
              dismissedAlertIds: [], // Default value if not found
            });
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Effect to persist settings when state changes
  useEffect(() => {
    // Only save if the user is logged in and not on the initial load/default values
    if (user && !loading) {
      // Small delay prevents unnecessary rapid writes when multiple states change at once
      const handler = setTimeout(() => {
        handleSaveSettings();
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [user, loading, userName, savingsGoal, notificationsEnabled, alertSettings, handleSaveSettings]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!user) return;

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setShowInactivityWarning(false);

    warningTimer.current = setTimeout(() => setShowInactivityWarning(true), INACTIVITY_TIMEOUT - 2 * 60 * 1000);

    inactivityTimer.current = setTimeout(() => handleLogout(true), INACTIVITY_TIMEOUT);
  }, [user]);

  // Inactivity detection
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

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        setTransactions((prev) => {
          const updated = [...prev];

          snapshot.docChanges().forEach((change) => {
            const docData = { id: change.doc.id, ...change.doc.data() } as Transaction;

            if (change.type === "added") {
              if (!updated.some((t) => t.id === docData.id)) {
                updated.push(docData);
              }
            }

            if (change.type === "modified") {
              const index = updated.findIndex((t) => t.id === docData.id);
              if (index !== -1) updated[index] = docData;
            }

            if (change.type === "removed") {
              const index = updated.findIndex((t) => t.id === docData.id);
              if (index !== -1) updated.splice(index, 1);
            }
          });

          // Sort by date, most recent first
          return updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      },
      (error) => console.error("Error fetching transactions:", error)
    );

    const unsubscribeBudgets = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const budgetData: Budget[] = [];
        snapshot.forEach((doc) => {
          // IMPORTANT: Do not read 'spent' from Firestore here, as it's now dynamically calculated.
          // Only read the base budget amount, category, and color.
          budgetData.push({ 
             id: doc.id,
             category: doc.data().category,
             budgeted: doc.data().budgeted,
             color: doc.data().color,
             lastReset: doc.data().lastReset || new Date(0).getTime(), // Ensure lastReset exists
             spent: 0, // Spent is always calculated, not stored
             userId: doc.data().userId
          } as Budget);
        });
        setBudgets(budgetData);
      },
      (error) => console.error("Error fetching budgets:", error)
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
    };
  }, [user]);

  // NEW: MEMOIZED CALCULATION OF CURRENT MONTH BUDGETS
  const currentBudgets = useMemo(() => {
      if (!user) return [];

      // 1. Determine the start of the current budget period (1st of the month)
      const startOfCurrentMonth = getCurrentMonthStartDate();
      
      // 2. Filter and sum expenses for the current period
      const spentByCategory: { [key: string]: number } = {};
      
      // Filter for expenses that occurred during the current budget cycle (since the 1st of the month)
      const currentExpenses = transactions.filter(t => 
          t.type === 'expense' && t.date >= startOfCurrentMonth
      );
      
      currentExpenses.forEach(t => {
          spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      });
      
      // 3. Map the base budgets to include the calculated 'spent' amount
      return budgets.map(budget => {
          const spent = spentByCategory[budget.category] || 0;
          return {
              ...budget,
              spent: spent, // The dynamically calculated spent amount
          };
      });

  }, [budgets, transactions, user]);


  // Budget update handler
  const handleUpdateBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;

    try {
      // Get current budgets from Firestore
      const budgetsQuery = query(
        collection(db, "budgets"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(budgetsQuery);
      const existingBudgetIds = snapshot.docs.map(doc => doc.id);

      // Update or add each budget
      for (const budget of newBudgets) {
        const budgetData = {
          category: budget.category,
          budgeted: budget.budgeted,
          // REMOVED 'spent' from data saved to Firestore, as it is dynamically calculated.
          color: budget.color,
          lastReset: budget.lastReset,
          userId: user.uid,
        };

        if (budget.id && existingBudgetIds.includes(budget.id)) {
          // Update existing budget
          const budgetRef = doc(db, "budgets", budget.id);
          // Omit the spent property when updating
          await updateDoc(budgetRef, budgetData);
        } else {
          // Add new budget
          await addDoc(collection(db, "budgets"), budgetData);
        }
      }

      // Delete removed budgets
      const newBudgetIds = newBudgets.map(b => b.id).filter(Boolean);
      const budgetsToDelete = existingBudgetIds.filter(id => !newBudgetIds.includes(id));
      
      for (const budgetId of budgetsToDelete) {
        await deleteDoc(doc(db, "budgets", budgetId));
      }

    } catch (error) {
      console.error("Error updating budgets:", error);
      alert("Failed to update budgets. Please try again.");
    }
  };

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
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId: user.uid,
      });

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

  // Delete transaction
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

  // Function to delete old transactions
  const handleArchiveOldTransactions = async (oldTransactionIds: string[]) => {
    if (!user) return;
    if (oldTransactionIds.length === 0) return;

    try {
        const deletePromises = oldTransactionIds.map(id => {
            const docRef = doc(db, "transactions", id);
            return deleteDoc(docRef);
        });

        await Promise.all(deletePromises);
        
        // Update local state by filtering out the deleted transactions
        setTransactions(prev => prev.filter(t => !oldTransactionIds.includes(t.id)));

        alert(`Successfully deleted ${oldTransactionIds.length} transactions older than 90 days.`);

    } catch (error) {
        console.error("Error deleting old transactions:", error);
        alert("Failed to delete old transactions. Please try again.");
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

  // Update user password
  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "No user logged in" };

    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Failed to update password";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Current password is incorrect";
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Delete user account and all data
  const handleDeleteAccount = async (password: string) => {
    if (!user) return { success: false, error: "No user logged in" };

    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      // Delete all user data from Firestore
      const userId = user.uid;

      // Delete all transactions
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", userId)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionDeletes = transactionsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(transactionDeletes);

      // Delete all budgets
      const budgetsQuery = query(
        collection(db, "budgets"),
        where("userId", "==", userId)
      );
      const budgetsSnapshot = await getDocs(budgetsQuery);
      const budgetDeletes = budgetsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(budgetDeletes);

      // Delete user settings
      try {
        const settingsRef = doc(db, "userSettings", userId);
        await deleteDoc(settingsRef);
      } catch (e) {
        // Settings might not exist, that's okay
      }

      // Delete the user account
      await deleteUser(user);

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let errorMessage = "Failed to delete account";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in before deleting your account";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Incorrect password";
      }
      
      return { success: false, error: errorMessage };
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
            {/* LOGO */}
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">SmartBudget</h1>
              <img src={logo} alt="SmartBudget Logo" className="h-10 w-auto mr-3" />
            </div>
            <p className="text-sm text-black mt-1">Your personal finance manager</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black hidden sm:inline">{user?.email}</span>
            <AlertsNotificationBell
              budgets={budgets}
              transactions={transactions}
              alertSettings={alertSettings}
              onUpdateAlertSettings={setAlertSettings}
            />
            <Button onClick={() => handleLogout(false)} variant="destructive" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
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
            {/* UPDATED: Pass currentBudgets */}
            <DashboardOverview
              budgets={currentBudgets}
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
              onArchiveOldTransactions={handleArchiveOldTransactions}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            {/* UPDATED: Pass currentBudgets */}
            <ChartsInsights
              budgets={currentBudgets}
              transactions={transactions}
              onUpdateBudgets={handleUpdateBudgets}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsPage
              budgets={budgets}
              transactions={transactions}
              userName={userName}
              onUpdateUserName={setUserName}
              savingsGoal={savingsGoal}
              onUpdateSavingsGoal={setSavingsGoal}
              onUpdatePassword={handleUpdatePassword}
              onDeleteAccount={handleDeleteAccount}
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