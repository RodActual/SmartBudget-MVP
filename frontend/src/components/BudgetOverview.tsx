import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
}

export function BudgetOverview({
  totalBudget,
  totalSpent,
  totalIncome,
}: BudgetOverviewProps) {
  const remaining = totalBudget - totalSpent;
  const percentageSpent = (totalSpent / totalBudget) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Budget</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Monthly allocation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Spent</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {percentageSpent.toFixed(1)}% of budget
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Remaining</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${remaining.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {((remaining / totalBudget) * 100).toFixed(1)}% available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
}
