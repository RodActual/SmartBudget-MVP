import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, AlertTriangle, CheckCircle, Info, LucideIcon } from "lucide-react";
import { Budget, Transaction } from "../App";

interface AlertsNotificationsProps {
  budgets: Budget[];
  transactions: Transaction[];
}

interface AlertItem {
  type: "usage" | "general";
  percentage?: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function AlertsNotifications({ budgets, transactions }: AlertsNotificationsProps) {
  // Helper to determine alert color based on percentage
  const getAlertColorClass = (percentage: number) => {
    if (percentage >= 100) return "border-black bg-black/5 text-black";
    if (percentage >= 81) return "border-red-500 bg-red-50 text-red-900";
    if (percentage >= 61) return "border-amber-500 bg-amber-50 text-amber-900";
    return "border-green-500 bg-green-50 text-green-900";
  };

  const alerts: AlertItem[] = [];

  // Generate budget alerts
  budgets.forEach((budget) => {
    const percentSpent = (budget.spent / budget.budgeted) * 100;

    if (budget.spent > budget.budgeted) {
      alerts.push({
        type: "usage",
        percentage: percentSpent,
        title: "Budget Exceeded",
        description: `You've overspent in ${budget.category} by $${(budget.spent - budget.budgeted).toFixed(2)}`,
        icon: AlertCircle,
      });
    } else if (percentSpent >= 90) {
      alerts.push({
        type: "usage",
        percentage: percentSpent,
        title: "Budget Warning",
        description: `You've used ${percentSpent.toFixed(0)}% of your ${budget.category} budget`,
        icon: AlertTriangle,
      });
    } else if (percentSpent >= 75) {
      alerts.push({
        type: "usage",
        percentage: percentSpent,
        title: "Budget Notice",
        description: `${budget.category} budget is ${percentSpent.toFixed(0)}% used`,
        icon: Info,
      });
    }
  });

  // Overall budget check
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercent = (totalSpent / totalBudget) * 100;

  if (overallPercent <= 70 && alerts.length === 0) {
    alerts.push({
      type: "general",
      title: "Great Job!",
      description: `You're staying within budget. You've used ${overallPercent.toFixed(0)}% of your total budget.`,
      icon: CheckCircle,
    });
  }

  // Recent large transactions
  const recentTransactions = transactions.filter(t => t.type === "expense").slice(0, 3);
  recentTransactions.forEach((transaction) => {
    if (transaction.amount > 500) {
      alerts.push({
        type: "general",
        title: "Large Transaction",
        description: `$${transaction.amount.toFixed(2)} spent on ${transaction.description}`,
        icon: Info,
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications</CardTitle>
        <CardDescription>
          Important updates about your budget and spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <Alert className="border-gray-300 bg-gray-50 text-gray-900">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>All Clear</AlertTitle>
            <AlertDescription>
              No alerts at this time. Keep up the good work!
            </AlertDescription>
          </Alert>
        ) : (
          alerts.map((alert, index) => {
            const Icon = alert.icon;
            const colorClass = alert.type === "usage"
              ? getAlertColorClass(alert.percentage ?? 0)
              : "border-gray-300 bg-gray-50 text-gray-900";

            return (
              <Alert key={index} className={colorClass}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
