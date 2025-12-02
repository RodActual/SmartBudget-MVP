import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Target, Lock, Trash2, AlertTriangle } from "lucide-react";
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

interface SettingsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  userName: string;
  onUpdateUserName: (name: string) => void;
  savingsGoal: number;
  onUpdateSavingsGoal: (goal: number) => void;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
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
}: SettingsPageProps) {
  // Local state for General Settings form
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());
  const [isSaving, setIsSaving] = useState(false);
  // State for save feedback message
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Handler for Personal Settings Save
  const handleSave = async () => {
    setSaveMessage(null);
    setIsSaving(true);
    
    try {
        // Update parent component state
        if (tempUserName.trim()) {
            onUpdateUserName(tempUserName.trim());
        }

        const goalValue = parseFloat(tempSavingsGoal);
        if (!isNaN(goalValue) && goalValue >= 0) {
            onUpdateSavingsGoal(goalValue);
        }

        // Simulate network latency/save completion delay for feedback (500ms)
        await new Promise(resolve => setTimeout(resolve, 500)); 

        setSaveMessage({ type: 'success', text: "Settings saved successfully! ✅" });

    } catch (e) {
        setSaveMessage({ type: 'error', text: "Failed to save settings. Please try again." });
    } finally {
        setIsSaving(false);
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Handler for Password Update
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } else {
      setPasswordError(result.error || "Failed to update password");
    }
  };

  // Handler for Account Deletion
  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm");
      return;
    }

    const result = await onDeleteAccount(deletePassword);

    if (!result.success) {
      setDeleteError(result.error || "Failed to delete account");
    }
    // If successful, the user will be logged out automatically
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Settings</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Name */}
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {/* Savings Goal */}
            <div className="space-y-2">
              <Label htmlFor="savingsGoal" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Savings Goal
              </Label>
              <Input
                id="savingsGoal"
                type="number"
                step="0.01"
                value={tempSavingsGoal}
                onChange={(e) => setTempSavingsGoal(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                Set a target amount you want to save
              </p>
            </div>

            {/* Save Message Display */}
            {saveMessage && (
                <p className={`text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {saveMessage.text}
                </p>
            )}

            {/* Save Button */}
            <Button onClick={handleSave} className="w-full" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Security (Now only includes Password Update) */}
        <div className="space-y-6">
          {/* Update Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Update Password
              </CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600">{passwordSuccess}</p>
              )}

              <Button 
                onClick={handleUpdatePassword} 
                className="w-full"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-800 mb-4">
              Once you delete your account, there is no going back. This will permanently delete:
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1 mb-4">
              <li>Your profile and settings</li>
              <li>All transactions ({transactions.length} total)</li>
              <li>All budget categories ({budgets.length} total)</li>
              <li>All historical data</li>
            </ul>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="deletePassword">
                    Enter your password to confirm
                  </Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  {deleteError && (
                    <p className="text-sm text-red-600">{deleteError}</p>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletePassword("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Account Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}