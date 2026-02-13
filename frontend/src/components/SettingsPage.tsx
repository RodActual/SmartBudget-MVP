import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Target, Lock, Trash2, AlertTriangle, Database, Sprout, ShieldCheck } from "lucide-react";
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
import type { Budget, Transaction } from "../App";
import { seedDatabase } from "../utils/seedDatabase";
import { clearDatabase } from "../utils/clearDatabase";
import { useIsAdmin } from "./AdminBadge";

interface SettingsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  userName: string;
  onUpdateUserName: (name: string) => void;
  savingsGoal: number;
  onUpdateSavingsGoal: (goal: number) => void;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  userId: string;
  // Added props for legal navigation
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function SettingsPage({
  budgets,
  transactions,
  userName,
  onUpdateUserName,
  savingsGoal,
  onUpdateSavingsGoal,
  onUpdatePassword,
  onDeleteAccount,
  userId,
  onOpenPrivacy,
  onOpenTerms,
}: SettingsPageProps) {
  const { isAdmin } = useIsAdmin();

  // Local state
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataMessage, setDataMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleSave = async () => {
    setSaveMessage(null);
    setIsSaving(true);
    try {
        if (tempUserName.trim()) onUpdateUserName(tempUserName.trim());
        const goalValue = parseFloat(tempSavingsGoal);
        if (!isNaN(goalValue) && goalValue >= 0) onUpdateSavingsGoal(goalValue);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setSaveMessage({ type: 'success', text: "Settings saved successfully! ✅" });
    } catch (e) {
        setSaveMessage({ type: 'error', text: "Failed to save settings." });
    } finally {
        setIsSaving(false);
        setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
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
    const result = await onUpdatePassword(currentPassword, newPassword);
    setIsUpdatingPassword(false);

    if (result.success) {
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError(result.error || "Failed to update password");
    }
  };

  const handleSeed = async (scenario: 'healthy' | 'crisis') => {
    if (!userId) return;
    const confirmMsg = scenario === 'crisis' 
      ? "⚠️ Load CRISIS Mode? This will create overspending alerts."
      : "🌱 Load HEALTHY Mode? This will create balanced expenses.";

    if (window.confirm(confirmMsg)) {
      setIsDataLoading(true);
      try {
        await seedDatabase(userId, scenario);
        setDataMessage({ type: 'success', text: "Data seeded! Reloading..." });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        setDataMessage({ type: 'error', text: "Failed to seed data." });
        setIsDataLoading(false);
      }
    }
  };

  const handleClearData = async () => {
    if (!userId) return;
    if (window.confirm("⚠️ Are you sure? This will DELETE ALL transactions permanently.")) {
      setIsDataLoading(true);
      try {
        await clearDatabase(userId);
        setDataMessage({ type: 'success', text: "All data cleared successfully." });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        setDataMessage({ type: 'error', text: "Failed to clear data." });
        setIsDataLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm");
      return;
    }
    const result = await onDeleteAccount(deletePassword);
    if (!result.success) setDeleteError(result.error || "Failed to delete account");
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

      {/* Admin Section */}
      {isAdmin && (
        <Card className="border-blue-100 bg-slate-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800"><Database className="h-5 w-5 text-blue-600" /> Admin Tools</CardTitle>
            <CardDescription>Database seeding and reset utilities for demos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-medium text-emerald-700"><Sprout className="h-4 w-4" /> Healthy Seed</div>
                <Button variant="outline" size="sm" onClick={() => handleSeed('healthy')} disabled={isDataLoading} className="w-full">Load Healthy</Button>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-medium text-orange-700"><AlertTriangle className="h-4 w-4" /> Crisis Seed</div>
                <Button variant="outline" size="sm" onClick={() => handleSeed('crisis')} disabled={isDataLoading} className="w-full">Load Crisis</Button>
              </div>
            </div>
            <Button variant="ghost" onClick={handleClearData} disabled={isDataLoading} className="w-full text-red-600 hover:bg-red-50">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All Transactions & Budgets
            </Button>
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
            <Button variant="outline" size="sm" onClick={onOpenPrivacy} className="flex-1 border-slate-200 text-slate-600">View Privacy Policy</Button>
            <Button variant="outline" size="sm" onClick={onOpenTerms} className="flex-1 border-slate-200 text-slate-600">View Terms of Service</Button>
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