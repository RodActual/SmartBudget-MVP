import "./globals.css";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore"; 
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

import { FortisLogo } from "./components/FortisLogo";

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

  const handleLegalBack = () => {
    // Navigating back simply clears the overlay state
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

  const handleDeleteAccount = async (pass: string) => {
    if (!user) return { success: false, error: "No user" };
    try {
      const cred = EmailAuthProvider.credential(user.email!, pass);
      await reauthenticateWithCredential(user, cred);
      const uid = user.uid;
      const tSnaps = await getDocs(query(collection(db, "transactions"), where("userId", "==", uid)));
      const bSnaps = await getDocs(query(collection(db, "budgets"), where("userId", "==", uid)));
      const batch = writeBatch(db);
      tSnaps.docs.forEach(d => batch.delete(d.ref));
      bSnaps.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, "userSettings", uid));
      await batch.commit();
      await deleteUser(user);
      return { success: true };
    } catch (e: any) { 
      console.error("Delete Account Error:", e);
      return { success: false, error: e.message }; 
    }
  };

  // --- 7. RENDERING ---
  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  // Global Legal Overlays (Priority Rendering)
  if (authMode === 'privacy') return <PrivacyPolicy onBack={handleLegalBack} />;
  if (authMode === 'terms') return <TermsOfService onBack={handleLegalBack} />;

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
    
    return (
      <LandingPage 
        onGetStarted={() => setAuthMode('signup')} 
        onSignIn={() => setAuthMode('login')} 
        onOpenPrivacy={() => setAuthMode('privacy')} 
        onOpenTerms={() => setAuthMode('terms')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Fortis Header */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl shadow-sm p-4 overflow-hidden">
          <div className="flex items-center gap-4">
<div className="flex items-center gap-3 bg-[#001D3D] px-4 py-2.5 rounded-lg">
  <FortisLogo className="h-8 w-8" />
  <h1 className="text-xl font-bold tracking-tight text-black uppercase">
    FortisBudget
  </h1>
</div>
            <p className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Financial Strength Through Intentionality
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium hidden sm:inline">{user?.email}</span>
            <AdminBadge />
            <AlertsNotificationBell 
              budgets={currentBudgets} transactions={transactions} 
              alertSettings={alertSettings} onUpdateAlertSettings={setAlertSettings} 
            />
            <Button onClick={handleLogout} variant="destructive" size="sm" className="shadow-sm">
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
                <TabsList className="grid w-full grid-cols-5 bg-slate-100 h-auto sm:h-10 p-1 border border-slate-200">
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
                    onUpdateTransaction={updateTransaction} 
                  />
                </TabsContent>
                
                <TabsContent value="insights" className="mt-6">
                  <ChartsInsights budgets={currentBudgets} transactions={transactions} onUpdateBudgets={updateBudgets} />
                </TabsContent>
                
                <TabsContent value="learn" className="mt-6"><LiteraturePage /></TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <SettingsPage 
                    budgets={budgets} transactions={transactions} userId={user.uid}
                    userName={userName} onUpdateUserName={setUserName} 
                    savingsGoal={savingsGoal} onUpdateSavingsGoal={setSavingsGoal}
                    onUpdatePassword={handleUpdatePassword} onDeleteAccount={handleDeleteAccount}
                    onOpenPrivacy={() => setAuthMode('privacy')}
                    onOpenTerms={() => setAuthMode('terms')}
                  />
                </TabsContent>
              </Tabs>

              {/* Internal Legal Footer */}
              <div className="flex justify-center gap-6 mt-8 pb-8 text-[10px] text-slate-400 uppercase tracking-widest">
                <button onClick={() => setAuthMode('privacy')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
                <button onClick={() => setAuthMode('terms')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
                <span>&copy; 2026 FortisBudget</span>
              </div>

              <AddTransactionDialog 
                open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) setEditingTransaction(null); }}
                onAddTransaction={(t) => { addTransaction(t); setDialogOpen(false); }}
                onEditTransaction={(t) => { if(editingTransaction) updateTransaction(editingTransaction.id, t); setDialogOpen(false); }}
                editingTransaction={editingTransaction}
                budgets={budgets}
              />
            </>
          )
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl mt-6 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-800">Email Verification Required</h2>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">To protect your financial data, please verify your email address using the banner at the top of the page.</p>
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