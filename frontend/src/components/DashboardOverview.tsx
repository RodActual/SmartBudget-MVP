import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, Target } from "lucide-react";
import type { Budget, Transaction } from "../App";
import { DailyTipCard } from "./DailyTipCard"; 
import { useUserSettings } from "../hooks/useUserSettings";

interface DashboardOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
}

export function DashboardOverview({
  budgets,
  transactions,
  onOpenAddTransaction,
}: DashboardOverviewProps) {
  // Use custom hook for user settings
  const { userName, savingsGoal } = useUserSettings();
  
  const financialTotals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    
    // Calculate income/expenses only from active (non-archived) transactions
    const activeTransactions = transactions.filter(t => !t.archived);

    const totalIncome = activeTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = activeTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = totalIncome - totalExpenses;
    const savings = totalBalance > 0 ? totalBalance : 0;
    const remainingBudget = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalIncome,
      totalExpenses,
      totalBalance,
      savings,
      remainingBudget
    };
  }, [budgets, transactions]); // Only recalculate when data changes

  // Recent transactions (last 5) - Memoized to prevent slice churn
  const recentTransactions = useMemo(() => {
    return transactions
      .filter(t => !t.archived)
      .slice(0, 5);
  }, [transactions]);

  const { 
    totalIncome, 
    totalExpenses, 
    totalBalance, 
    savings, 
    remainingBudget 
  } = financialTotals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-black">Welcome back, {userName}!</h1>
          <p className="text-black mt-1">
            Here's an overview of your finances
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className={`text-3xl ${totalBalance >= 0 ? "text-[#00A86B]" : "text-destructive"}`}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onOpenAddTransaction} size="lg" className="w-full sm:w-auto text-black">
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Daily Tip Section */}
      <div className="w-full">
        <DailyTipCard />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#00A86B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-[#dc2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Available Budget</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${remainingBudget < 0 ? 'text-red-500' : ''}`}>
                ${remainingBudget.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Remaining to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Savings Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${savings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {savingsGoal > 0
                ? `${Math.min(((savings / savingsGoal) * 100), 100).toFixed(0)}% of $${savingsGoal.toFixed(2)} goal`
                : "Set a goal in settings"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Budget Progress Bars */}
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                {budgets.map((budget) => {
                    const percentage = Math.min((budget.spent / budget.budgeted) * 100, 100);
                    return (
                    <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm" 
                                style={{ backgroundColor: budget.color }}
                            />
                            <span className="font-medium">{budget.category}</span>
                        </div>
                        <span className="text-gray-500">
                            ${budget.spent.toFixed(0)} / ${budget.budgeted}
                        </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full transition-all duration-500" 
                            style={{ 
                            width: `${percentage}%`,
                            backgroundColor: budget.color 
                            }} 
                        />
                        </div>
                    </div>
                    );
                })}
                {budgets.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No budgets set yet.</p>
                )}
                </div>
            </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
            <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
            {recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No transactions yet.</p>
            ) : (
                <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                    <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                    <div className="flex items-center gap-3">
                        <div
                        className={`p-2 rounded-full ${
                            transaction.type === "income"
                            ? "bg-green-100 text-[#00A86B]"
                            : "bg-red-100 text-destructive"
                        }`}
                        >
                        {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        </div>
                        <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                            {transaction.category} •{" "}
                            {new Date(transaction.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            })}
                        </p>
                        </div>
                    </div>
                    <p
                        className={`font-medium ${
                        transaction.type === "income"
                            ? "text-[#00A86B]"
                            : "text-destructive"
                        }`}
                    >
                        {transaction.type === "income" ? "+" : "-"}$
                        {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    </div>
                ))}
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}