import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SpendingChart } from "../components/SpendingChart";
import { BudgetCategories } from "../components/BudgetCategories";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Budget, Transaction } from "../App";

interface ChartsInsightsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

interface ChartTooltipPayload {
  name: string;
  value: number;
  budget?: number;
}

export function ChartsInsights({
  budgets,
  transactions,
  onUpdateBudgets,
}: ChartsInsightsProps) {
  // Prepare category spending data for pie/bar charts
  const categoryData = budgets.map((budget) => ({
    name: budget.category,
    value: budget.spent,
    color: budget.color,
    budget: budget.budgeted,
  }));

  // Custom tooltip for charts
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: ChartTooltipPayload }[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Spent: ${data.value.toFixed(2)}
          </p>
          {data.budget !== undefined && (
            <p className="text-xs text-muted-foreground">
              Budget: ${data.budget.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl">Charts & Insights</h1>
        <p className="text-muted-foreground mt-1">
          Visualize your spending patterns and trends
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Distribution of expenses across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
  data={categoryData}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={({ name, percent }) =>
    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
  }
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
>
  {categoryData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>

                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>
              Compare budgeted amounts with actual spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="budget" fill="#000000" name="Budget" />
                <Bar dataKey="value" name="Spent">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend Line */}
      <SpendingChart transactions={transactions} />

      {/* Budget Categories with Progress */}
      <BudgetCategories budgets={budgets} onUpdateBudgets={onUpdateBudgets} />
    </div>
  );
}
