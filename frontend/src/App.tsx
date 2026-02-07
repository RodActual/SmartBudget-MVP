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
import { LiteraturePage } from "./components/LiteraturePage"; 
import { LandingPage } from "./components/LandingPage"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut, BookOpen, ArrowLeft } from "lucide-react"; 
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
} from "firebase/firestore";

import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser 
} from "firebase/auth";

import { EmailVerification } from "./components/EmailVerification";

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

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

const getCurrentMonthStartDate = () => {
    const now = new Date();
    now.setDate(1); 
    now.setHours(0, 0, 0, 0); 
    return now.toISOString().substring(0, 10);
};

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
  
  // UPDATED: Authentication Mode State
  // 'landing' = Public Home Page
  // 'login' = Sign In Form
  // 'signup' = Create Account Form
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing');

  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    budgetWarningEnabled: true,
    budgetWarningThreshold: 80,
    budgetExceededEnabled: true,
    largeTransactionEnabled: true,
    largeTransactionAmount: 500,
    weeklyReportEnabled: false,
    dismissedAlertIds: [],
  });
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  // Inactivity tracking
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to save settings to Firestore
  const handleSaveSettings = useCallback(async () => {
    if (!user) return;

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
        setShowVerificationBanner(!currentUser.emailVerified);

        try {
          const settingsRef = doc(db, "userSettings", currentUser.uid);
          const settingsDoc = await getDoc(settingsRef);
          
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            setUserName(data.userName || "User");
            setSavingsGoal(data.savingsGoal || 0);
            setNotificationsEnabled(data.notificationsEnabled ?? true);
            
            setAlertSettings(data.alertSettings || {
              budgetWarningEnabled: true,
              budgetWarningThreshold: 80,
              budgetExceededEnabled: true,
              largeTransactionEnabled: true,
              largeTransactionAmount: 500,
              weeklyReportEnabled: false,
              dismissedAlertIds: [],
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

  // Effect to persist settings
  useEffect(() => {
    if (user && !loading) {
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
              if (!updated.some((t) => t.id === docData.id)) updated.push(docData);
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
          budgetData.push({ 
             id: doc.id,
             category: doc.data().category,
             budgeted: doc.data().budgeted,
             color: doc.data().color,
             lastReset: doc.data().lastReset || new Date(0).getTime(),
             spent: 0,
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

  // Current Budgets Calculation
  const currentBudgets = useMemo(() => {
      if (!user) return [];
      const startOfCurrentMonth = getCurrentMonthStartDate();
      const spentByCategory: { [key: string]: number } = {};
      
      const currentExpenses = transactions.filter(t => 
          t.type === 'expense' && t.date >= startOfCurrentMonth
      );
      
      currentExpenses.forEach(t => {
          spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
      });
      
      return budgets.map(budget => {
          const spent = spentByCategory[budget.category] || 0;
          return { ...budget, spent };
      });
  }, [budgets, transactions, user]);

  // Budget update handler
  const handleUpdateBudgets = async (newBudgets: Budget[]) => {
    if (!user) return;
    try {
      const budgetsQuery = query(collection(db, "budgets"), where("userId", "==", user.uid));
      const snapshot = await getDocs(budgetsQuery);
      const existingBudgetIds = snapshot.docs.map(doc => doc.id);

      for (const budget of newBudgets) {
        const budgetData = {
          category: budget.category,
          budgeted: budget.budgeted,
          color: budget.color,
          lastReset: budget.lastReset,
          userId: user.uid,
        };
        if (budget.id && existingBudgetIds.includes(budget.id)) {
          await updateDoc(doc(db, "budgets", budget.id), budgetData);
        } else {
          await addDoc(collection(db, "budgets"), budgetData);
        }
      }

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

  const handleLogout = async (isAutoLogout = false) => {
    try {
      await auth.signOut();
      setTransactions([]);
      setBudgets([]);
      setUserName("User");
      setSavingsGoal(0);
      setActiveTab("dashboard");
      setAuthMode('landing'); // Reset to landing page on logout
      if (isAutoLogout) alert("You have been logged out due to inactivity.");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleContinueSession = () => {
    setShowInactivityWarning(false);
    resetInactivityTimer();
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "transactions"), { ...transaction, userId: user.uid });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleEditTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!editingTransaction || !user) return;
    try {
      await updateDoc(doc(db, "transactions", editingTransaction.id), transaction);
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
      await deleteDoc(doc(db, "transactions", id));
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleArchiveOldTransactions = async (oldTransactionIds: string[]) => {
    if (!user || oldTransactionIds.length === 0) return;
    try {
        const deletePromises = oldTransactionIds.map(id => deleteDoc(doc(db, "transactions", id)));
        await Promise.all(deletePromises);
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

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: "No user logged in" };
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Failed to update password";
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      return { success: false, error: errorMessage };
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user) return { success: false, error: "No user logged in" };
    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);
      const userId = user.uid;
      const transactionsSnapshot = await getDocs(query(collection(db, "transactions"), where("userId", "==", userId)));
      await Promise.all(transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      const budgetsSnapshot = await getDocs(query(collection(db, "budgets"), where("userId", "==", userId)));
      await Promise.all(budgetsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      try { await deleteDoc(doc(db, "userSettings", userId)); } catch (e) {}
      
      await deleteUser(user);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting account:", error);
      let errorMessage = "Failed to delete account";
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log back in before deleting your account";
      }
      return { success: false, error: errorMessage };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-semibold animate-pulse">Loading SmartBudget...</div>
      </div>
    );
  }

  // --- UNAUTHENTICATED ROUTING ---
  if (!user) {
    // If user clicked "Sign In" or "Get Started"
    if (authMode === 'login' || authMode === 'signup') {
      return (
        <div className="relative min-h-screen bg-white">
          <div className="absolute top-4 left-4 z-10">
             <Button variant="ghost" onClick={() => setAuthMode('landing')} className="text-gray-600 hover:text-black">
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back
             </Button>
          </div>
          <LoginForm 
            onLogin={() => {}} 
            initialIsSignUp={authMode === 'signup'} // Open correct tab
          />
        </div>
      );
    }
    
    // Default: Public Landing Page
    return (
      <LandingPage 
        onGetStarted={() => setAuthMode('signup')} 
        onSignIn={() => setAuthMode('login')} 
      />
    );
  }

  // --- AUTHENTICATED APP ---
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-200 rounded-lg shadow-md p-4">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">SmartBudget</h1>
            </div>
            <p className="text-sm text-black mt-1">Your personal finance manager</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-black hidden sm:inline">{user?.email}</span>
            <AlertsNotificationBell
              budgets={currentBudgets}
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

        {/* Email Verification Banner */}
        {showVerificationBanner && user && !user.emailVerified && (
          <EmailVerification 
             onVerified={async () => {
              setShowVerificationBanner(false);
              await auth.currentUser?.reload();
              window.location.reload(); 
            }}
          />
        )}

        {/* Security Gate */}
        {user?.emailVerified ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 h-auto sm:h-10">
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
                <TabsTrigger value="learn" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Learn</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
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
                <ChartsInsights
                  budgets={currentBudgets}
                  transactions={transactions}
                  onUpdateBudgets={handleUpdateBudgets}
                />
              </TabsContent>

              <TabsContent value="learn" className="mt-6">
                <LiteraturePage />
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

            <AddTransactionDialog
              open={dialogOpen}
              onOpenChange={closeDialog}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              editingTransaction={editingTransaction}
            />
          </>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl mt-6">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-6xl animate-bounce">📧</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Email Verification Required
              </h2>
              <p className="text-gray-600">
                To protect your financial data, please verify your email address to access SmartBudget features.
                <br /><br />
                <strong>Check the verification banner above for instructions.</strong>
              </p>
            </div>
          </div>
        )}

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