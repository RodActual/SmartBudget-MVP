import "./globals.css";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
// ADDED: writeBatch to imports
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore"; 
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

// Components
import { 
  DashboardOverview, 
  ExpenseTracking, 
  ChartsInsights, 
  SettingsPage, 
  AddTransactionDialog, 
  LoginForm, 
  AlertsNotificationBell, 
  LiteraturePage, 
  LandingPage, 
  PrivacyPolicy, 
  TermsOfService, 
  WelcomeSetup, 
  EmailVerification, 
  AdminBadge 
} from "./components";

// UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut, BookOpen, ArrowLeft } from "lucide-react"; 
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

// Hooks
import { useFinancialData } from "./hooks/useFinancialData";
import { useInactivity } from "./hooks/useInactivity";

// Types
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  userId?: string;
  archived?: boolean; 
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

export default function App() {
  // --- 1. AUTH & USER STATE ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(true);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    budgetWarningEnabled: true,
    budgetWarningThreshold: 80,
    budgetExceededEnabled: true,
    largeTransactionEnabled: true,
    largeTransactionAmount: 500,
    weeklyReportEnabled: false,
    dismissedAlertIds: [],
  });

  // --- 2. UI STATE ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup' | 'privacy' | 'terms'>('landing');
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  // --- 3. CUSTOM HOOKS ---
  const { 
    transactions, budgets, currentBudgets, loading: dataLoading, 
    addTransaction, updateTransaction, deleteTransaction, updateBudgets 
  } = useFinancialData(user);

  const { showWarning, continueSession, logout } = useInactivity(user);

  // --- 4. AUTH EFFECTS ---
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
            setIsSetupComplete(data.isSetupComplete !== false);
            if (data.alertSettings) setAlertSettings(data.alertSettings);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 5. AUTO-SAVE SETTINGS ---
  const handleSaveSettings = useCallback(async () => {
    if (!user) return;
    try {
      const settingsRef = doc(db, "userSettings", user.uid);
      await setDoc(settingsRef, {
        userName, savingsGoal, notificationsEnabled, alertSettings, isSetupComplete, 
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) { console.error("Error saving settings:", error); }
  }, [user, userName, savingsGoal, notificationsEnabled, alertSettings, isSetupComplete]);

  useEffect(() => {
    if (user && !authLoading && user.emailVerified) {
      const handler = setTimeout(handleSaveSettings, 500);
      return () => clearTimeout(handler);
    }
  }, [user, authLoading, userName, savingsGoal, notificationsEnabled, alertSettings, handleSaveSettings]);

  // --- 6. HANDLERS ---
  const handleLogout = async () => {
    await logout();
    setUserName("User");
    setSavingsGoal(0);
    setActiveTab("dashboard");
    setAuthMode('landing');
  };

  const handleUpdatePassword = async (current: string, newPass: string) => {
    if (!user) return { success: false, error: "No user" };
    try {
      const cred = EmailAuthProvider.credential(user.email!, current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPass);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  // --- SECURITY FIX: Orphaned Data Prevention ---
  const handleDeleteAccount = async (pass: string) => {
    if (!user) return { success: false, error: "No user" };
    try {
      // 1. Re-authenticate first
      const cred = EmailAuthProvider.credential(user.email!, pass);
      await reauthenticateWithCredential(user, cred);
      
      const uid = user.uid;
      
      // 2. Query all user data
      const tSnaps = await getDocs(query(collection(db, "transactions"), where("userId", "==", uid)));
      const bSnaps = await getDocs(query(collection(db, "budgets"), where("userId", "==", uid)));
      
      // 3. Perform ATOMIC deletion using writeBatch
      // This is safer and cleaner than Promise.all() for Firestore ops
      const batch = writeBatch(db);
      
      tSnaps.docs.forEach(d => batch.delete(d.ref));
      bSnaps.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, "userSettings", uid));
      
      // 4. Commit the batch BEFORE deleting the user
      await batch.commit();
      
      // 5. Delete the Auth User last
      await deleteUser(user);
      
      return { success: true };
    } catch (e: any) { 
      console.error("Delete Account Error:", e);
      return { success: false, error: e.message }; 
    }
  };

  // --- NEW: Soft Delete Logic ---
  const handleArchiveOld = async (ids: string[]) => {
      // Instead of deleteTransaction, we update the transaction to be archived
      await Promise.all(ids.map(id => updateTransaction(id, { archived: true })));
      alert(`Archived ${ids.length} transactions. They will still appear in charts.`);
  };

  // --- 7. RENDERING ---
  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  if (!user) {
    if (authMode === 'login' || authMode === 'signup') {
      return (
        <div className="relative min-h-screen bg-white">
          <div className="absolute top-4 left-4 z-10">
             <Button variant="ghost" onClick={() => setAuthMode('landing')} className="text-gray-600 hover:text-black">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
          </div>
          <LoginForm onLogin={() => {}} initialIsSignUp={authMode === 'signup'} />
        </div>
      );
    }
    if (authMode === 'privacy') return <PrivacyPolicy onBack={() => setAuthMode('landing')} />;
    if (authMode === 'terms') return <TermsOfService onBack={() => setAuthMode('landing')} />;
    return <LandingPage onGetStarted={() => setAuthMode('signup')} onSignIn={() => setAuthMode('login')} onOpenPrivacy={() => setAuthMode('privacy')} onOpenTerms={() => setAuthMode('terms')} />;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-200 rounded-lg shadow-md p-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">SmartBudget</h1>
            <p className="text-sm text-black mt-1">Your personal finance manager</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black hidden sm:inline">{user?.email}</span>
            <AdminBadge />
            <AlertsNotificationBell 
              budgets={currentBudgets} transactions={transactions} 
              alertSettings={alertSettings} onUpdateAlertSettings={setAlertSettings} 
            />
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>

        {/* Verification Banner */}
        {showVerificationBanner && (
          <EmailVerification onVerified={async () => { setShowVerificationBanner(false); window.location.reload(); }} />
        )}

        {/* Main Content Gate */}
        {user?.emailVerified ? (
          !isSetupComplete ? (
             <WelcomeSetup userId={user.uid} onComplete={(name, goal) => { setUserName(name); setSavingsGoal(goal); setIsSetupComplete(true); }} />
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100 h-auto sm:h-10">
                  <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4"/><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
                  <TabsTrigger value="expenses" className="gap-2"><Receipt className="h-4 w-4"/><span className="hidden sm:inline">Expenses</span></TabsTrigger>
                  <TabsTrigger value="insights" className="gap-2"><BarChart3 className="h-4 w-4"/><span className="hidden sm:inline">Insights</span></TabsTrigger>
                  <TabsTrigger value="learn" className="gap-2"><BookOpen className="h-4 w-4"/><span className="hidden sm:inline">Learn</span></TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4"/><span className="hidden sm:inline">Settings</span></TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                  <DashboardOverview budgets={currentBudgets} transactions={transactions} onOpenAddTransaction={() => { setEditingTransaction(null); setDialogOpen(true); }} userName={userName} savingsGoal={savingsGoal} />
                </TabsContent>
                
                <TabsContent value="expenses" className="mt-6">
                  <ExpenseTracking 
                    transactions={transactions} 
                    budgets={budgets} 
                    onOpenAddTransaction={() => { setEditingTransaction(null); setDialogOpen(true); }} 
                    onEdit={(t) => { setEditingTransaction(t); setDialogOpen(true); }} 
                    onDelete={deleteTransaction} 
                    onArchiveOldTransactions={handleArchiveOld} 
                  />
                </TabsContent>
                
                <TabsContent value="insights" className="mt-6">
                  {/* We pass ALL transactions (including archived) to Charts so history remains */}
                  <ChartsInsights budgets={currentBudgets} transactions={transactions} onUpdateBudgets={updateBudgets} />
                </TabsContent>
                
                <TabsContent value="learn" className="mt-6"><LiteraturePage /></TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <SettingsPage 
                    budgets={budgets} transactions={transactions} userId={user.uid}
                    userName={userName} onUpdateUserName={setUserName} 
                    savingsGoal={savingsGoal} onUpdateSavingsGoal={setSavingsGoal}
                    onUpdatePassword={handleUpdatePassword} onDeleteAccount={handleDeleteAccount}
                  />
                </TabsContent>
              </Tabs>

              <AddTransactionDialog 
                open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) setEditingTransaction(null); }}
                onAddTransaction={(t) => { addTransaction(t); setDialogOpen(false); }}
                onEditTransaction={(t) => { if(editingTransaction) updateTransaction(editingTransaction.id, t); setDialogOpen(false); }}
                editingTransaction={editingTransaction}
              />
            </>
          )
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl mt-6">
            <h2 className="text-2xl font-bold">Email Verification Required</h2>
            <p className="text-gray-600 mt-2">Please check the banner above.</p>
          </div>
        )}

        <AlertDialog open={showWarning} onOpenChange={() => {}}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you still there?</AlertDialogTitle><AlertDialogDescription>You'll be logged out in 2 minutes.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogAction onClick={continueSession}>Continue</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}