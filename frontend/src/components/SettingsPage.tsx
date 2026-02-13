import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
// Added Heart icon to imports
import { Save, Target, Lock, Trash2, AlertTriangle, Database, Sprout, ShieldCheck, User, Shield, FileText, KeyRound, Heart } from "lucide-react";
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
    setIsDataLoading(true);
    try {
      await seedDatabase(userId, scenario);
      setDataMessage({ type: 'success', text: "Data seeded! Reloading..." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setDataMessage({ type: 'error', text: "Failed to seed data." });
      setIsDataLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      await clearDatabase(userId);
      setDataMessage({ type: 'success', text: "All data cleared successfully." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setDataMessage({ type: 'error', text: "Failed to clear data." });
      setIsDataLoading(false);
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
    <div className="space-y-10 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-[#001D3D] tracking-tighter uppercase">Settings</h1>
        <p className="text-slate-500 font-medium">Manage your financial fortress and security credentials.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Personal Settings */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-[#001D3D]">Personal Profile</CardTitle>
            <CardDescription>Update your identity and savings targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</Label>
              <div className="flex rounded-md border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input id="userName" className="border-0 focus-visible:ring-0" value={tempUserName} onChange={(e) => setTempUserName(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="savingsGoal" className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Savings Goal</Label>
              <div className="flex rounded-md border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-slate-400">
                  <Target className="h-4 w-4" />
                </div>
                <Input id="savingsGoal" type="number" step="0.01" className="border-0 focus-visible:ring-0" value={tempSavingsGoal} onChange={(e) => setTempSavingsGoal(e.target.value)} />
              </div>
            </div>

            {saveMessage && <p className={`text-sm font-bold ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{saveMessage.text}</p>}
            
            <Button onClick={handleSave} className="w-full bg-[#001D3D] hover:bg-blue-900 font-bold h-11" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-[#001D3D]">Security Vault</CardTitle>
            <CardDescription>Keep your access credentials secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex rounded-md border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input type="password" placeholder="Current Password" className="border-0 focus-visible:ring-0" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>

            <div className="flex rounded-md border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <div className="bg-slate-50 px-3 flex items-center border-r border-slate-200 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <Input type="password" placeholder="New Password" className="border-0 focus-visible:ring-0" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            
            {passwordError && <p className="text-sm font-bold text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm font-bold text-green-600">{passwordSuccess}</p>}
            
            <Button onClick={handleUpdatePassword} variant="outline" className="w-full border-slate-200 font-bold h-11" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating Vault..." : "Update Credentials"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      {isAdmin && (
        <Card className="border-blue-100 bg-slate-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#001D3D] font-black uppercase text-sm tracking-widest">
              <Database className="h-4 w-4 text-blue-600" /> Admin Command Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleSeed('healthy')} disabled={isDataLoading} className="h-14 border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 font-bold">
                <Sprout className="mr-2 h-5 w-5" /> Seed Healthy State
              </Button>
              <Button variant="outline" onClick={() => handleSeed('crisis')} disabled={isDataLoading} className="h-14 border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-700 font-bold">
                <AlertTriangle className="mr-2 h-5 w-5" /> Seed Crisis State
              </Button>
            </div>
            <Button variant="ghost" onClick={handleClearData} disabled={isDataLoading} className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-widest">
              <Trash2 className="mr-2 h-4 w-4" /> Purge All Transaction Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Legal */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#001D3D]">Compliance & Privacy</CardTitle>
          <CardDescription>Your data is encrypted and never shared with third parties.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={onOpenPrivacy} className="flex-1 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              <Shield className="mr-2 h-4 w-4" /> Privacy Policy
            </Button>
            <Button variant="outline" onClick={onOpenTerms} className="flex-1 border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              <FileText className="mr-2 h-4 w-4" /> Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donation Card */}
      <Card className="bg-blue-50 border-blue-100 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#001D3D] text-lg">Keep Fortis Free</h4>
            <p className="text-xs text-slate-500 font-medium">Support the development of private, manual budgeting for the intentional sovereign.</p>
          </div>
          <Button variant="outline" onClick={() => window.open('https://github.com/sponsors/RodActual', '_blank')} className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-white font-bold h-11 px-8">
            <Heart className="mr-2 h-4 w-4 fill-current" /> Donate
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-red-600 font-black uppercase text-sm tracking-widest">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-bold h-11 px-8">
                Decommission Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-red-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-600 font-black tracking-tight">Irreversible Deletion</AlertDialogTitle>
                <AlertDialogDescription>This will permanently dismantle your financial fortress and erase all encrypted transaction history.</AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label className="text-xs font-bold uppercase mb-2 block">Confirm Password</Label>
                <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password to authorize" />
                {deleteError && <p className="text-sm font-bold text-red-600 mt-2">{deleteError}</p>}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletePassword("")} className="font-bold">Abort</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 font-bold">Delete Everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">
          FortisBudget Secure Build v1.0.4 | © 2026
        </p>
      </div>
    </div>
  );
}