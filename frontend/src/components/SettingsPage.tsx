import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Save, Target, Lock, Trash2, AlertTriangle, ShieldCheck, Archive, RotateCcw } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import type { Budget, Transaction } from "../App";
import { useUserSettings } from "../hooks/useUserSettings";
import { auth, db } from "../firebase";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { FORTIS_VERSION, GIT_HASH, LAST_DEPLOYED } from "../version";

interface SettingsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onNavigate: (mode: "privacy" | "terms") => void;
}

// ── Shared input style ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  borderColor:     "var(--border-subtle)",
  color:           "var(--text-primary)",
};

const labelStyle: React.CSSProperties = {
  color:         "var(--fortress-steel)",
  fontWeight:    600,
  fontSize:      "0.8125rem",
  letterSpacing: "0.01em",
};

export function SettingsPage({
  budgets,
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onNavigate,
}: SettingsPageProps) {
  const { userName, savingsGoal, updateUserName, updateSavingsGoal } = useUserSettings();

  const [tempUserName, setTempUserName]       = useState(userName);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());
  const [isSaving, setIsSaving]               = useState(false);
  const [saveMessage, setSaveMessage]         = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [passwordError, setPasswordError]       = useState("");
  const [passwordSuccess, setPasswordSuccess]   = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError]       = useState("");

  const archivedTransactions = useMemo(
    () => transactions.filter(t => t.archived === true),
    [transactions]
  );

  useEffect(() => {
    setTempUserName(userName);
    setTempSavingsGoal(savingsGoal.toString());
  }, [userName, savingsGoal]);

  const handleSave = async () => {
    setSaveMessage(null);
    setIsSaving(true);
    try {
      if (tempUserName.trim()) updateUserName(tempUserName.trim());
      const g = parseFloat(tempSavingsGoal);
      if (!isNaN(g) && g >= 0) updateSavingsGoal(g);
      await new Promise(r => setTimeout(r, 500));
      setSaveMessage({ type: "success", text: "Settings saved successfully." });
    } catch {
      setSaveMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    const user = auth.currentUser;
    if (!user) { setPasswordError("No user logged in"); return; }
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError("Please fill in all fields"); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }
    setIsUpdatingPassword(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, currentPassword));
      await updatePassword(user, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    const user = auth.currentUser;
    if (!user) { setDeleteError("No user logged in"); return; }
    if (!deletePassword) { setDeleteError("Please enter your password to confirm"); return; }
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, deletePassword));
      const uid = user.uid;
      const batch = writeBatch(db);
      (await getDocs(query(collection(db, "transactions"), where("userId", "==", uid)))).docs.forEach(d => batch.delete(d.ref));
      (await getDocs(query(collection(db, "budgets"),      where("userId", "==", uid)))).docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc(db, "userSettings", uid));
      await batch.commit();
      await deleteUser(user);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete account");
    }
  };

  const handleRestoreTransaction   = async (t: Transaction) => { try { await onUpdateTransaction(t.id, { archived: false }); } catch { alert("Failed to restore."); } };
  const handleDeletePermanently    = async (t: Transaction) => { if (window.confirm(`Permanently delete "${t.description}"? This cannot be undone.`)) { try { await onDeleteTransaction(t.id); } catch { alert("Failed to delete."); } } };
  const handleRestoreAll           = async () => { if (window.confirm(`Restore all ${archivedTransactions.length} archived transactions?`)) { await Promise.all(archivedTransactions.map(t => onUpdateTransaction(t.id, { archived: false }))); } };
  const handleDeleteAllPermanently = async () => { try { await Promise.all(archivedTransactions.map(t => onDeleteTransaction(t.id))); } catch { alert("Failed to delete some transactions."); } };

  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Settings</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fortress-steel)" }}>
          Manage your account preferences and security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Personal Settings ────────────────────────────────────────────────── */}
        <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
              Personal Settings
            </CardTitle>
            <CardDescription style={{ color: "var(--fortress-steel)" }}>
              Update your profile and savings targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="userName" style={labelStyle}>Your Name</Label>
              <Input id="userName" value={tempUserName} onChange={e => setTempUserName(e.target.value)} style={inputStyle} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="savingsGoal" style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                <Target className="h-4 w-4" /> Savings Goal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold font-mono pointer-events-none" style={{ color: "var(--fortress-steel)" }}>$</span>
                <Input
                  id="savingsGoal"
                  type="number"
                  step="0.01"
                  value={tempSavingsGoal}
                  onChange={e => setTempSavingsGoal(e.target.value)}
                  className="pl-7 font-mono"
                  style={inputStyle}
                />
              </div>
            </div>

            {saveMessage && (
              <p
                className="text-sm font-semibold"
                style={{ color: saveMessage.type === "success" ? "var(--field-green)" : "var(--castle-red)" }}
              >
                {saveMessage.text}
              </p>
            )}

            <Button
              onClick={handleSave}
              className="w-full font-bold text-white"
              disabled={isSaving}
              style={{
                backgroundColor: "var(--castle-red)",
                border: "none",
                boxShadow: "0 2px 0 0 var(--castle-red-dark)",
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving…" : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Security ─────────────────────────────────────────────────────────── */}
        <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
          <CardHeader>
            <CardTitle
              className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Lock className="h-4 w-4" /> Security
            </CardTitle>
            <CardDescription style={{ color: "var(--fortress-steel)" }}>
              Update your authentication credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} />
            <Input type="password" placeholder="New Password"     value={newPassword}     onChange={e => setNewPassword(e.target.value)}     style={inputStyle} />
            <Input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />

            {passwordError   && <p className="text-xs font-semibold" style={{ color: "var(--castle-red)" }}>{passwordError}</p>}
            {passwordSuccess && <p className="text-xs font-semibold" style={{ color: "var(--field-green)" }}>{passwordSuccess}</p>}

            <Button
              onClick={handleUpdatePassword}
              variant="outline"
              className="w-full font-bold"
              disabled={isUpdatingPassword}
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              {isUpdatingPassword ? "Updating…" : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Archived Transactions ─────────────────────────────────────────────── */}
      {archivedTransactions.length > 0 && (
        <Card className="border" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}>
          <CardHeader>
            <CardTitle
              className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Archive className="h-4 w-4" style={{ color: "var(--engine-navy)" }} />
              Archived Transactions ({archivedTransactions.length})
            </CardTitle>
            <CardDescription style={{ color: "var(--fortress-steel)" }}>
              Hidden from your main list but still counted in analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-hidden" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface)" }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: "var(--surface-raised)" }}>
                    {["Date", "Description", "Category", "Amount", "Actions"].map((col, i) => (
                      <TableHead
                        key={col}
                        className={`text-[10px] font-bold uppercase tracking-widest ${i >= 3 ? "text-right" : ""}`}
                        style={{ color: "var(--fortress-steel)" }}
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedTransactions.map(t => (
                    <TableRow key={t.id} style={{ borderColor: "var(--border-subtle)" }}>
                      <TableCell className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ backgroundColor: "var(--surface-raised)", color: "var(--fortress-steel)", border: "1px solid var(--border-subtle)" }}
                        >
                          {t.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono text-sm" style={{ color: "var(--fortress-steel)" }}>
                        ${t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 text-xs font-bold gap-1"
                            style={{ color: "var(--engine-navy)" }}
                            onClick={() => handleRestoreTransaction(t)}
                          >
                            <RotateCcw className="h-3 w-3" /> Restore
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 text-xs font-bold gap-1"
                            style={{ color: "var(--castle-red)" }}
                            onClick={() => handleDeletePermanently(t)}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bulk actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                variant="outline"
                onClick={handleRestoreAll}
                className="flex-1 font-bold gap-2"
                style={{ borderColor: "var(--engine-navy)", color: "var(--engine-navy)" }}
              >
                <RotateCcw className="h-4 w-4" />
                Restore All ({archivedTransactions.length})
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 font-bold gap-2"
                    style={{ borderColor: "var(--castle-red)", color: "var(--castle-red)" }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All Permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: "var(--text-primary)" }}>Delete All Archived Transactions?</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: "var(--fortress-steel)" }}>
                      This will permanently delete all {archivedTransactions.length} archived transactions. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllPermanently}
                      className="font-bold text-white"
                      style={{ backgroundColor: "var(--castle-red)", border: "none" }}
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

      {/* ── Legal ─────────────────────────────────────────────────────────────── */}
      <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
        <CardHeader>
          <CardTitle
            className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--fortress-steel)" }} />
            Legal & Compliance
          </CardTitle>
          <CardDescription style={{ color: "var(--fortress-steel)" }}>
            Review our terms and data protection policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline" size="sm"
              onClick={() => onNavigate("privacy")}
              className="flex-1 font-bold uppercase tracking-wide text-xs"
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              Privacy Policy
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={() => onNavigate("terms")}
              className="flex-1 font-bold uppercase tracking-wide text-xs"
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              Terms of Service
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center w-full pt-4 opacity-40">
            <p className="text-[10px] font-mono uppercase" style={{ color: "var(--text-muted)" }}>
              FORTIS_v{FORTIS_VERSION} // {GIT_HASH} // {LAST_DEPLOYED}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone ───────────────────────────────────────────────────────── */}
      <Card
        className="border"
        style={{ borderColor: "var(--castle-red)", backgroundColor: "#FEF2F2" }}
      >
        <CardHeader>
          <CardTitle
            className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "var(--castle-red)" }}
          >
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="font-bold text-white w-full sm:w-auto"
                style={{ backgroundColor: "var(--castle-red)", border: "none", boxShadow: "0 2px 0 0 var(--castle-red-dark)" }}
              >
                Delete Account Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ color: "var(--text-primary)" }}>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription style={{ color: "var(--fortress-steel)" }}>
                  This will permanently erase your profile and all financial data. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                type="password"
                placeholder="Enter password to confirm"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                style={inputStyle}
              />
              {deleteError && <p className="text-xs font-semibold mt-1" style={{ color: "var(--castle-red)" }}>{deleteError}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDeletePassword("")}
                  style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="font-bold text-white"
                  style={{ backgroundColor: "var(--castle-red)", border: "none" }}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}