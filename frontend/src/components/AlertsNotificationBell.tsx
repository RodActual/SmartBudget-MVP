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

// ── Alert tier → Fortis color tokens ──────────────────────────────────────────
const alertStyles: Record<string, { bg: string; border: string; text: string; iconColor: string }> = {
  danger: {
    bg:        "#FEF2F2",
    border:    "var(--castle-red)",
    text:      "#7F1D1D",
    iconColor: "var(--castle-red)",
  },
  warning: {
    bg:        "#FFFBEB",
    border:    "var(--safety-amber)",
    text:      "#78350F",
    iconColor: "var(--safety-amber)",
  },
  info: {
    bg:        "#EFF6FF",
    border:    "#3B82F6",
    text:      "#1E3A5F",
    iconColor: "#3B82F6",
  },
  success: {
    bg:        "#F0FDF4",
    border:    "var(--field-green)",
    text:      "#14532D",
    iconColor: "var(--field-green)",
  },
};

export function AlertsNotificationBell({
  budgets,
  transactions,
  alertSettings,
  onUpdateAlertSettings,
}: AlertsNotificationBellProps) {
  const [popoverOpen, setPopoverOpen]         = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [tempSettings, setTempSettings]       = useState<AlertSettings>(alertSettings);
  const [viewedAlerts, setViewedAlerts]       = useState<Set<string>>(new Set());

  const dismissedAlertsSet = new Set(alertSettings.dismissedAlertIds || []);

  const updateDismissedAlerts = useCallback((newDismissedIds: string[]) => {
    onUpdateAlertSettings({ ...alertSettings, dismissedAlertIds: newDismissedIds });
  }, [alertSettings, onUpdateAlertSettings]);

  const getBudgetWithSpending = (budget: Budget) => {
    const spent = transactions
      .filter(t => t.type === "expense" && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...budget, spent };
  };

  const budgetsWithSpending = budgets.map(getBudgetWithSpending);

  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    budgetsWithSpending.forEach((budget, index) => {
      const percentage = (budget.spent / budget.budgeted) * 100;
      const uniqueId   = budget.id || `${budget.category}-${index}`;
      const alertId    = `budget-exceeded-${uniqueId}`;
      const warningId  = `budget-warning-${uniqueId}`;

      if (alertSettings.budgetExceededEnabled && budget.spent > budget.budgeted && !dismissedAlertsSet.has(alertId)) {
        alerts.push({
          id: alertId,
          type: "danger",
          title: "Budget Exceeded",
          description: `${budget.category}: $${(budget.spent - budget.budgeted).toFixed(2)} over budget`,
          icon: AlertCircle,
          timestamp: Date.now(),
        });
      } else if (alertSettings.budgetWarningEnabled && percentage >= alertSettings.budgetWarningThreshold && percentage < 100 && !dismissedAlertsSet.has(warningId)) {
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

    if (alertSettings.largeTransactionEnabled) {
      transactions
        .filter(t => t.type === "expense" && t.amount >= alertSettings.largeTransactionAmount)
        .slice(0, 3)
        .forEach((transaction) => {
          const alertId = `large-transaction-${transaction.id}`;
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

    if (alerts.length === 0) {
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

  const alerts      = generateAlerts();
  const unviewed    = alerts.filter(a => a.type !== "success" && !viewedAlerts.has(a.id));
  const alertCount  = unviewed.length;

  useEffect(() => {
    if (popoverOpen) {
      let changed = false;
      const next  = new Set(viewedAlerts);
      alerts.forEach(a => {
        if (a.type !== "success" && !viewedAlerts.has(a.id)) { next.add(a.id); changed = true; }
      });
      if (changed) setViewedAlerts(next);
    }
  }, [popoverOpen, alerts, viewedAlerts]);

  const handleDismissAlert = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(dismissedAlertsSet).add(alertId);
    updateDismissedAlerts(Array.from(next));
  };

  const handleClearAllAlerts = () => {
    const ids     = alerts.filter(a => a.type !== "success").map(a => a.id);
    const merged  = new Set([...dismissedAlertsSet, ...ids]);
    updateDismissedAlerts(Array.from(merged));
  };

  const handleSaveSettings = () => {
    onUpdateAlertSettings({ ...tempSettings, dismissedAlertIds: alertSettings.dismissedAlertIds });
    setSettingsDialogOpen(false);
  };

  const handleOpenSettings = () => {
    setTempSettings(alertSettings);
    setPopoverOpen(false);
    setSettingsDialogOpen(true);
  };

  return (
    <>
      {/* ── Bell trigger ────────────────────────────────────────────────────── */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            style={{ color: "var(--fortress-steel)" }}
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                style={{ backgroundColor: "var(--castle-red)" }}
              >
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-96"
          align="end"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3
                className="font-bold text-base uppercase tracking-widest"
                style={{ color: "var(--text-primary)" }}
              >
                Notifications
              </h3>
              <div className="flex items-center gap-1">
                {alerts.filter(a => a.type !== "success").length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllAlerts}
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--fortress-steel)" }}
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenSettings}
                  style={{ color: "var(--fortress-steel)" }}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Alert list */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-0.5">
              {alerts.map((alert) => {
                const Icon      = alert.icon;
                const isDismissed = dismissedAlertsSet.has(alert.id);
                const isSuccess   = alert.type === "success";
                const s           = alertStyles[alert.type] || alertStyles.info;

                return (
                  <Alert
                    key={alert.id}
                    className={`relative pr-8 rounded-md border-l-4 ${isDismissed && !isSuccess ? "opacity-40 line-through" : ""}`}
                    style={{
                      backgroundColor: s.bg,
                      borderColor:     s.border,
                      color:           s.text,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: s.iconColor }} />
                    <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: s.text }}>
                      {alert.title}
                    </AlertTitle>
                    <AlertDescription className="text-xs mt-0.5" style={{ color: s.text, opacity: 0.85 }}>
                      {alert.description}
                    </AlertDescription>
                    {!isSuccess && !isDismissed && (
                      <button
                        onClick={(e) => handleDismissAlert(alert.id, e)}
                        className="absolute top-2 right-2 p-1 rounded-full transition-colors"
                        style={{ color: s.iconColor }}
                        aria-label="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </Alert>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Alert Settings Dialog ────────────────────────────────────────────── */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent
          className="max-w-2xl"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
        >
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Alert Settings
            </DialogTitle>
            <DialogDescription style={{ color: "var(--fortress-steel)" }}>
              Configure when you want to be notified about your spending
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto pr-2">

            {/* Section heading */}
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--fortress-steel)" }}>
              Alert Types
            </h4>

            {/* Budget Warning */}
            <div className="flex items-start justify-between border-b pb-4 gap-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="space-y-2 flex-1">
                <Label htmlFor="budget-warning" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Budget Warning
                </Label>
                <p className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                  Alert when spending reaches a percentage threshold
                </p>
                {tempSettings.budgetWarningEnabled && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="warning-threshold" className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                        Threshold
                      </Label>
                      <span className="text-xs font-bold font-mono" style={{ color: "var(--safety-amber)" }}>
                        {tempSettings.budgetWarningThreshold}%
                      </span>
                    </div>
                    <input
                      id="warning-threshold"
                      type="range"
                      min="50" max="95" step="5"
                      value={tempSettings.budgetWarningThreshold}
                      onChange={(e) => setTempSettings({ ...tempSettings, budgetWarningThreshold: parseInt(e.target.value) })}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: "var(--castle-red)" }}
                    />
                  </div>
                )}
              </div>
              <Switch
                id="budget-warning"
                checked={tempSettings.budgetWarningEnabled}
                onCheckedChange={(c) => setTempSettings({ ...tempSettings, budgetWarningEnabled: c })}
              />
            </div>

            {/* Budget Exceeded */}
            <div className="flex items-start justify-between border-b pb-4 gap-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="space-y-1">
                <Label htmlFor="budget-exceeded" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Budget Exceeded
                </Label>
                <p className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                  Alert when any category goes over its budget
                </p>
              </div>
              <Switch
                id="budget-exceeded"
                checked={tempSettings.budgetExceededEnabled}
                onCheckedChange={(c) => setTempSettings({ ...tempSettings, budgetExceededEnabled: c })}
              />
            </div>

            {/* Large Transaction */}
            <div className="flex items-start justify-between border-b pb-4 gap-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="space-y-2 flex-1">
                <Label htmlFor="large-transaction" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Large Transactions
                </Label>
                <p className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                  Alert on single expenses above a threshold
                </p>
                {tempSettings.largeTransactionEnabled && (
                  <div className="mt-3">
                    <Label htmlFor="transaction-amount" className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                      Amount threshold
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold font-mono" style={{ color: "var(--fortress-steel)" }}>$</span>
                      <input
                        id="transaction-amount"
                        type="number"
                        step="50" min="100"
                        value={tempSettings.largeTransactionAmount}
                        onChange={(e) => setTempSettings({ ...tempSettings, largeTransactionAmount: parseInt(e.target.value) || 100 })}
                        className="flex-1 rounded-md px-3 py-1.5 text-sm font-mono border"
                        style={{
                          backgroundColor: "var(--surface-raised)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Switch
                id="large-transaction"
                checked={tempSettings.largeTransactionEnabled}
                onCheckedChange={(c) => setTempSettings({ ...tempSettings, largeTransactionEnabled: c })}
              />
            </div>

            {/* Weekly Report */}
            <div className="flex items-start justify-between pb-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="weekly-report" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Weekly Summary Report
                </Label>
                <p className="text-xs" style={{ color: "var(--fortress-steel)" }}>
                  Receive a weekly spending digest (coming soon)
                </p>
              </div>
              <Switch id="weekly-report" checked={tempSettings.weeklyReportEnabled} disabled
                onCheckedChange={(c) => setTempSettings({ ...tempSettings, weeklyReportEnabled: c })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="font-bold text-white"
              style={{ backgroundColor: "var(--castle-red)", border: "none", boxShadow: "0 2px 0 0 var(--castle-red-dark)" }}
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}