import { useState, useEffect, useCallback } from "react";
import { Bell, Settings as SettingsIcon, AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import type { Budget, Transaction } from "../App";

interface AlertsNotificationBellProps {
  budgets: Budget[];
  transactions: Transaction[];
  alertSettings: AlertSettings;
  onUpdateAlertSettings: (settings: AlertSettings) => void;
}

export interface AlertSettings {
  budgetWarningEnabled: boolean;
  budgetWarningThreshold: number;
  budgetExceededEnabled: boolean;
  largeTransactionEnabled: boolean;
  largeTransactionAmount: number;
  weeklyReportEnabled: boolean;
  // PERSISTENT: List of dismissed alert IDs
  dismissedAlertIds: string[]; 
}

interface AlertItem {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  description: string;
  icon: any;
  timestamp: number;
}

export function AlertsNotificationBell({
  budgets,
  transactions,
  alertSettings,
  onUpdateAlertSettings,
}: AlertsNotificationBellProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<AlertSettings>(alertSettings);
  const [viewedAlerts, setViewedAlerts] = useState<Set<string>>(new Set());

  // Set for quick lookup of persistent dismissed alerts
  const dismissedAlertsSet = new Set(alertSettings.dismissedAlertIds || []);

  // Stable function to update persistent settings
  const updateDismissedAlerts = useCallback((newDismissedIds: string[]) => {
    onUpdateAlertSettings({
        ...alertSettings,
        dismissedAlertIds: newDismissedIds,
    });
  }, [alertSettings, onUpdateAlertSettings]);

  // Calculate spending for each budget
  const getBudgetWithSpending = (budget: Budget) => {
    const spent = transactions
      .filter(t => t.type === "expense" && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { ...budget, spent };
  };

  const budgetsWithSpending = budgets.map(getBudgetWithSpending);

  // Generate alerts based on settings
  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    // FIX: Added index as fallback and used budget.id for uniqueness
    budgetsWithSpending.forEach((budget, index) => {
      const percentage = (budget.spent / budget.budgeted) * 100;
      
      // Use Firestore ID if available, otherwise combine category and index to ensure uniqueness
      const uniqueId = budget.id || `${budget.category}-${index}`;
      
      const alertId = `budget-exceeded-${uniqueId}`;
      const warningId = `budget-warning-${uniqueId}`;

      // Budget exceeded alert: FILTERED by dismissedAlertsSet
      if (alertSettings.budgetExceededEnabled && budget.spent > budget.budgeted && !dismissedAlertsSet.has(alertId)) {
        alerts.push({
          id: alertId,
          type: "danger",
          title: "Budget Exceeded",
          description: `${budget.category}: $${(budget.spent - budget.budgeted).toFixed(2)} over budget`,
          icon: AlertCircle,
          timestamp: Date.now(),
        });
      }
      // Budget warning alert: FILTERED by dismissedAlertsSet
      else if (alertSettings.budgetWarningEnabled && percentage >= alertSettings.budgetWarningThreshold && percentage < 100 && !dismissedAlertsSet.has(warningId)) {
        alerts.push({
          id: warningId,
          type: "warning",
          title: "Budget Warning",
          description: `${budget.category}: ${percentage.toFixed(0)}% of budget used`,
          icon: AlertTriangle,
          timestamp: Date.now(),
        });
      }
    });

    // Large transaction alerts
    if (alertSettings.largeTransactionEnabled) {
      const recentLargeTransactions = transactions
        .filter(t => t.type === "expense" && t.amount >= alertSettings.largeTransactionAmount)
        .slice(0, 3);

      recentLargeTransactions.forEach((transaction) => {
        const alertId = `large-transaction-${transaction.id}`;
        // FILTERED by dismissedAlertsSet
        if (!dismissedAlertsSet.has(alertId)) {
          alerts.push({
            id: alertId,
            type: "info",
            title: "Large Transaction",
            description: `$${transaction.amount.toFixed(2)} spent on ${transaction.description}`,
            icon: Info,
            timestamp: new Date(transaction.date).getTime(),
          });
        }
      });
    }

    // If there are no currently active, non-dismissed alerts, show "All Clear"
    const hasActiveAlerts = alerts.length > 0;

    if (!hasActiveAlerts) {
      alerts.push({
        id: "all-clear",
        type: "success",
        title: "All Clear",
        description: "No alerts at this time. Keep up the good work!",
        icon: CheckCircle,
        timestamp: Date.now(),
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const unviewedAlerts = alerts.filter(a => a.type !== "success" && !viewedAlerts.has(a.id));
  const alertCount = unviewedAlerts.length;

  // Mark all alerts as viewed when popover opens
  useEffect(() => {
    if (popoverOpen) {
      let needsUpdate = false;
      const newViewedAlerts = new Set(viewedAlerts);
      
      alerts.forEach(alert => {
        if (alert.type !== "success" && !viewedAlerts.has(alert.id)) {
          newViewedAlerts.add(alert.id);
          needsUpdate = true;
        }
      });

      // ONLY CALL setViewedAlerts IF a change was actually made
      if (needsUpdate) {
        setViewedAlerts(newViewedAlerts);
      }
    }
  }, [popoverOpen, alerts, viewedAlerts]);

  const getAlertClassName = (type: string) => {
    switch (type) {
      case "danger":
        return "border-red-500 bg-red-50 text-red-900";
      case "warning":
        return "border-amber-500 bg-amber-50 text-amber-900";
      case "info":
        return "border-blue-500 bg-blue-50 text-blue-900";
      case "success":
        return "border-green-500 bg-green-50 text-green-900";
      default:
        return "border-gray-300 bg-gray-50 text-gray-900";
    }
  };

  // Update handler to persist the dismissed alert ID
  const handleDismissAlert = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDismissed = new Set(dismissedAlertsSet).add(alertId);
    updateDismissedAlerts(Array.from(newDismissed));
  };

  // Update handler to persist clearing all alerts
  const handleClearAllAlerts = () => {
    const allAlertIdsToDismiss = alerts
        .filter(a => a.type !== "success")
        .map(a => a.id);
    
    // Merge new dismissals with old ones
    const mergedDismissed = new Set([...dismissedAlertsSet, ...allAlertIdsToDismiss]);
    updateDismissedAlerts(Array.from(mergedDismissed));
  };

  const handleSaveSettings = () => {
    // Preserve the dismissedAlertIds when saving other settings
    onUpdateAlertSettings({
        ...tempSettings,
        dismissedAlertIds: alertSettings.dismissedAlertIds, 
    });
    setSettingsDialogOpen(false);
  };

  const handleOpenSettings = () => {
    setTempSettings(alertSettings);
    setPopoverOpen(false);
    setSettingsDialogOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {alerts.filter(a => a.type !== "success").length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllAlerts}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenSettings}
                  className="gap-2"
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                const isDismissed = dismissedAlertsSet.has(alert.id);
                const isSuccess = alert.type === "success";

                return (
                  <Alert 
                        key={alert.id} 
                        className={`${getAlertClassName(alert.type)} relative pr-8 ${isDismissed && !isSuccess ? 'opacity-50 line-through' : ''}`}
                    >
                    <Icon className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                    {alert.type !== "success" && !isDismissed && (
                      <button
                        onClick={(e) => handleDismissAlert(alert.id, e)}
                        className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition-colors"
                        aria-label="Dismiss alert"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </Alert>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Alert Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Settings</DialogTitle>
            <DialogDescription>
              Configure when you want to be notified about your spending
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Alert Types */}
            <div className="space-y-4">
              <h4 className="font-semibold text-black">Alert Types</h4>

              {/* Budget Warning */}
              <div className="flex items-start justify-between border-b pb-4 gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="budget-warning" className="text-base">
                    Budget Warning
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get notified when spending reaches a threshold
                  </p>
                  {tempSettings.budgetWarningEnabled && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="warning-threshold" className="text-sm">
                          Warning threshold
                        </Label>
                        <span className="text-sm font-semibold">{tempSettings.budgetWarningThreshold}%</span>
                      </div>
                      <input
                        id="warning-threshold"
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={tempSettings.budgetWarningThreshold}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            budgetWarningThreshold: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  )}
                </div>
                <Switch
                  id="budget-warning"
                  checked={tempSettings.budgetWarningEnabled}
                  onCheckedChange={(checked) =>
                    setTempSettings({ ...tempSettings, budgetWarningEnabled: checked })
                  }
                />
              </div>

              {/* Budget Exceeded */}
              <div className="flex items-start justify-between border-b pb-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="budget-exceeded" className="text-base">
                    Budget Exceeded
                  </Label>
                  <p className="text-sm text-gray-600">
                    Alert when you exceed your budget in any category
                  </p>
                </div>
                <Switch
                  id="budget-exceeded"
                  checked={tempSettings.budgetExceededEnabled}
                  onCheckedChange={(checked) =>
                    setTempSettings({ ...tempSettings, budgetExceededEnabled: checked })
                  }
                />
              </div>

              {/* Large Transaction */}
              <div className="flex items-start justify-between border-b pb-4 gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="large-transaction" className="text-base">
                    Large Transactions
                  </Label>
                  <p className="text-sm text-gray-600">
                    Get notified about transactions over a certain amount
                  </p>
                  {tempSettings.largeTransactionEnabled && (
                    <div className="mt-3">
                      <Label htmlFor="transaction-amount" className="text-sm">
                        Amount threshold
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">$</span>
                        <input
                          id="transaction-amount"
                          type="number"
                          step="50"
                          min="100"
                          value={tempSettings.largeTransactionAmount}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              largeTransactionAmount: parseInt(e.target.value) || 100,
                            })
                          }
                          className="flex-1 border rounded px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Switch
                  id="large-transaction"
                  checked={tempSettings.largeTransactionEnabled}
                  onCheckedChange={(checked) =>
                    setTempSettings({ ...tempSettings, largeTransactionEnabled: checked })
                  }
                />
              </div>

              {/* Weekly Report */}
              <div className="flex items-start justify-between pb-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="weekly-report" className="text-base">
                    Weekly Summary Report
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive a weekly summary of your spending (coming soon)
                  </p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={tempSettings.weeklyReportEnabled}
                  onCheckedChange={(checked) =>
                    setTempSettings({ ...tempSettings, weeklyReportEnabled: checked })
                  }
                  disabled
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}