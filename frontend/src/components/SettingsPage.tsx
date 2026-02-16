import { useState, useMemo, useEffect } from "react"; // 1. Added useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Target, Lock, Trash2, AlertTriangle, ShieldCheck, Archive, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { Budget, Transaction } from "../App";
import { useUserSettings } from "../hooks/useUserSettings";
import { auth, db } from "../firebase";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";

interface SettingsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onNavigate: (mode: 'privacy' | 'terms') => void;
}

export function SettingsPage({
  budgets,
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onNavigate,
}: SettingsPageProps) {
  
  // Use custom hook for user settings
  const { userName, savingsGoal, updateUserName, updateSavingsGoal } = useUserSettings();
  
  // Local state for form inputs
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Archived transactions
  const archivedTransactions = useMemo(() => {
    return transactions.filter(t => t.archived === true);
  }, [transactions]);

  // 2. CHANGED: Used useEffect to correctly sync form with fetched data
  useEffect(() => {
    setTempUserName(userName);
    setTempSavingsGoal(savingsGoal.toString());
  }, [userName, savingsGoal]);

  // Save settings handler
  const handleSave = async () => {
    setSaveMessage(null);
    setIsSaving(true);
    try {
      if (tempUserName.trim()) updateUserName(tempUserName.trim());
      const goalValue = parseFloat(tempSavingsGoal);
      if (!isNaN(goalValue) && goalValue >= 0) updateSavingsGoal(goalValue);
      // Fake delay for UX feel
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setSaveMessage({ type: 'success', text: "Settings saved successfully! ✅" });
    } catch (e) {
      setSaveMessage({ type: 'error', text: "Failed to save settings." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Password update handler
  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    const user = auth.currentUser;
    if (!user) {
      setPasswordError("No user logged in");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setDeleteError("");
    
    const user = auth.currentUser;
    if (!user) {
      setDeleteError("No user logged in");
      return;
    }

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm");
      return;
    }

    try {
      // Reauthenticate
      const credential = EmailAuthProvider.credential(user.email!, deletePassword);
      await reauthenticateWithCredential(user, credential);
      
      const uid = user.uid;
      
      // Delete all user data
      const batch = writeBatch(db);
      
      const transactionsSnap = await getDocs(query(collection(db, "transactions"), where("userId", "==", uid)));
      transactionsSnap.docs.forEach(d => batch.delete(d.ref));
      
      const budgetsSnap = await getDocs(query(collection(db, "budgets"), where("userId", "==", uid)));
      budgetsSnap.docs.forEach(d => batch.delete(d.ref));
      
      batch.delete(doc(db, "userSettings", uid));
      
      await batch.commit();
      
      // Delete the user account
      await deleteUser(user);
      
      // Success - user will be logged out automatically
    } catch (error: any) {
      console.error("Delete Account Error:", error);
      setDeleteError(error.message || "Failed to delete account");
    }
  };

  // Archived transaction handlers
  const handleRestoreTransaction = async (transaction: Transaction) => {
    try {
      await onUpdateTransaction(transaction.id, { archived: false });
    } catch (error) {
      console.error("Failed to restore transaction:", error);
      alert("Failed to restore transaction. Please try again.");
    }
  };

  const handleDeleteTransactionPermanently = async (transaction: Transaction) => {
    if (window.confirm(`Permanently delete "${transaction.description}"? This cannot be undone.`)) {
      try {
        await onDeleteTransaction(transaction.id);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  const handleRestoreAll = async () => {
    if (window.confirm(`Restore all ${archivedTransactions.length} archived transactions?`)) {
      try {
        await Promise.all(
          archivedTransactions.map(t => onUpdateTransaction(t.id, { archived: false }))
        );
      } catch (error) {
        console.error("Failed to restore all transactions:", error);
        alert("Failed to restore some transactions. Please try again.");
      }
    }
  };

  const handleDeleteAllPermanently = async () => {
    if (window.confirm(`⚠️ PERMANENTLY DELETE all ${archivedTransactions.length} archived transactions?\n\nThis action CANNOT be undone!`)) {
      if (window.confirm("Are you absolutely sure? Type 'DELETE' to confirm.") === false) {
        return;
      }
      
      try {
        await Promise.all(
          archivedTransactions.map(t => onDeleteTransaction(t.id))
        );
      } catch (error) {
        console.error("Failed to delete all transactions:", error);
        alert("Failed to delete some transactions. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Settings */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Personal Settings</CardTitle>
            <CardDescription>Update your profile and savings targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input id="userName" value={tempUserName} onChange={(e) => setTempUserName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savingsGoal" className="flex items-center gap-2"><Target className="h-4 w-4" /> Savings Goal</Label>
              <Input id="savingsGoal" type="number" step="0.01" value={tempSavingsGoal} onChange={(e) => setTempSavingsGoal(e.target.value)} />
            </div>
            {saveMessage && <p className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{saveMessage.text}</p>}
            <Button onClick={handleSave} className="w-full bg-slate-900" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Password Security */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Update your authentication credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
            <Button onClick={handleUpdatePassword} className="w-full border-slate-200" variant="outline" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Archived Transactions Section */}
      {archivedTransactions.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Archive className="h-5 w-5 text-blue-600" /> 
              Archived Transactions ({archivedTransactions.length})
            </CardTitle>
            <CardDescription>
              These transactions are hidden from your main list but still count in your analytics.
              You can restore them or delete them permanently.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-900">Date</TableHead>
                    <TableHead className="font-semibold text-slate-900">Description</TableHead>
                    <TableHead className="font-semibold text-slate-900">Category</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {transaction.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleRestoreTransaction(transaction)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteTransactionPermanently(transaction)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleRestoreAll}
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore All ({archivedTransactions.length})
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Archived Transactions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {archivedTransactions.length} archived transactions.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllPermanently}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete All Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal & Compliance Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-600" /> Legal & Compliance</CardTitle>
          <CardDescription>Review our terms and data protection policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" size="sm" onClick={() => onNavigate('privacy')} className="flex-1 border-slate-200 text-slate-600">View Privacy Policy</Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('terms')} className="flex-1 border-slate-200 text-slate-600">View Terms of Service</Button>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest text-center">
            FortisBudget Prototype v1.0.0 | © 2026 FortisBudget
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">Delete Account Permanently</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently erase your profile and all financial data.</AlertDialogDescription>
              </AlertDialogHeader>
              <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password to confirm" />
              {deleteError && <p className="text-sm text-red-600 mt-2">{deleteError}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">Delete Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}