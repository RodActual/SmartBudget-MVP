import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SpendingChart } from "../components/SpendingChart";
import { BudgetManager } from "../components/BudgetManager";
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
  color?: string;
}

export function ChartsInsights({
  budgets,
  transactions,
  onUpdateBudgets,
}: ChartsInsightsProps) {
  // Calculate spending by category from transactions (case-insensitive)
  const spendingByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = transaction.category.toLowerCase();
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  console.log("=== CHART DEBUG ===");
  console.log("Total transactions:", transactions.length);
  console.log("Expense transactions:", transactions.filter(t => t.type === "expense").length);
  console.log("Spending by category:", spendingByCategory);
  console.log("Budgets:", budgets);

  // Define default colors for categories
  const defaultColors: Record<string, string> = {
    housing: "#3B82F6",
    food: "#10B981",
    transportation: "#F59E0B",
    utilities: "#8B5CF6",
    entertainment: "#EC4899",
    health: "#06B6D4",
    income: "#EF4444",
    other: "#6366F1",
    shopping: "#F97316",
  };

  // Prepare category spending data for charts
  // If budgets exist, use them; otherwise create from transaction categories
  const categoryData = budgets.length > 0
    ? budgets
        .map((budget) => ({
          name: budget.category,
          value: spendingByCategory[budget.category.toLowerCase()] || budget.spent || 0,
          color: budget.color,
          budget: budget.budgeted,
        }))
        .filter((item) => item.value > 0)
    : Object.entries(spendingByCategory).map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
        value: amount,
        color: defaultColors[category.toLowerCase()] || "#9CA3AF",
        budget: 0, // No budget set
      }));

  console.log("Category data for charts:", categoryData);
  console.log("===================");

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
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Spent: ${data.value.toFixed(2)}
          </p>
          {data.budget !== undefined && (
            <p className="text-xs text-gray-500">
              Budget: ${data.budget.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderPieLabel = (props: any) => {
    const { name, percent } = props;
    if (!percent || !name) return "";
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Charts & Insights</h1>
        <p className="text-gray-600 mt-1">
          Visualize your spending patterns and trends
        </p>
      </div>

      {categoryData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No spending data to display yet. Add some transactions to see your insights!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Budget Manager */}
          <BudgetManager 
            budgets={budgets} 
            onUpdateBudgets={onUpdateBudgets}
            transactions={transactions}
          />

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
                {categoryData.length > 0 ? (
                  <div style={{ width: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    No data available
                  </div>
                )}
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
                {categoryData.length > 0 ? (
                  <div style={{ width: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <BarChart
                        data={categoryData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                          stroke="#666"
                        />
                        <YAxis fontSize={12} stroke="#666" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {budgets.length > 0 && (
                          <Bar dataKey="budget" fill="#000000" name="Budget" />
                        )}
                        <Bar dataKey="value" name="Spent">
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spending Trend Line */}
          <SpendingChart transactions={transactions} />
        </>
      )}
    </div>
  );
}