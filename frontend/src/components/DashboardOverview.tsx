import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, Target } from "lucide-react";
import type { Budget, Transaction } from "../App";
import { DailyTipCard } from "./DailyTipCard"; 

interface DashboardOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
  userName: string;
  savingsGoal: number;
}

export function DashboardOverview({
  budgets,
  transactions,
  onOpenAddTransaction,
  userName,
  savingsGoal,
}: DashboardOverviewProps) {
  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBalance = totalIncome - totalExpenses;
  const savings = totalBalance > 0 ? totalBalance : 0;
  const remainingBudget = totalBudget - totalSpent;

  // Recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

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
            <div className="text-2xl">${remainingBudget.toFixed(2)}</div>
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
                ? `${((savings / savingsGoal) * 100).toFixed(0)}% of $${savingsGoal.toFixed(2)} goal`
                : "Set a goal in settings"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet. Add your first transaction to get started!</p>
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
                    {transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}