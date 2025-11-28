import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { AlertsNotifications } from "../components/AlertsNotifications";
import { Bell, Save, Target, Moon } from "lucide-react";
import { useState } from "react";
import type { Budget, Transaction } from "../App";

interface SettingsAlertsProps {
  budgets: Budget[];
  transactions: Transaction[];
  userName: string;
  onUpdateUserName: (name: string) => void;
  savingsGoal: number;
  onUpdateSavingsGoal: (goal: number) => void;
  notificationsEnabled: boolean;
  onUpdateNotifications: (enabled: boolean) => void;
  darkMode: boolean;
  onUpdateDarkMode: (enabled: boolean) => void;
}

export function SettingsAlerts({
  budgets,
  transactions,
  userName,
  onUpdateUserName,
  savingsGoal,
  onUpdateSavingsGoal,
  notificationsEnabled,
  onUpdateNotifications,
  darkMode,
  onUpdateDarkMode,
}: SettingsAlertsProps) {
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempSavingsGoal, setTempSavingsGoal] = useState(savingsGoal.toString());

  const handleSave = () => {
    if (tempUserName.trim()) {
      onUpdateUserName(tempUserName.trim());
    }
    const goalValue = parseFloat(tempSavingsGoal);
    if (!isNaN(goalValue) && goalValue >= 0) {
      onUpdateSavingsGoal(goalValue);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl">Settings & Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Customize your preferences and view notifications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
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
                <p className="text-xs text-muted-foreground">
                  Set a target amount you want to save
                </p>
              </div>

              {/* Save Button */}
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your app experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={darkMode}
                  onCheckedChange={onUpdateDarkMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Budget Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications when approaching budget limits
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={onUpdateNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Notifications */}
        <AlertsNotifications budgets={budgets} transactions={transactions} />
      </div>
    </div>
  );
}
