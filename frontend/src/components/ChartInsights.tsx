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
    
  // Prepare category spending data for charts
  const categoryData = budgets
        .map((budget) => ({
          name: budget.category,
          value: budget.spent, 
          color: budget.color, // <-- Uses DB color
          budget: budget.budgeted,
        }))
        .filter((item) => item.budget > 0 || item.value > 0); 
    
    // Strict filter for Pie Chart. Only display categories where value > 0.
    const pieChartData = categoryData.filter(item => item.value > 0);

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
          <div className="flex items-center gap-2 mb-1">
             {/* Colored Dot in Tooltip */}
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
             <p className="font-medium text-gray-900">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600">
            Spent: ${data.value.toFixed(2)}
          </p>
          {data.budget !== undefined && data.budget > 0 && (
            <p className="text-xs text-gray-500">
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
                  Distribution of expenses across categories (Current Month)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <div style={{ width: '100%', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={pieChartData} 
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={(entry) => (entry.percent || 0) > 0 ? `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%` : null}
                        >
                          {pieChartData.map((entry, index) => (
                            // STRICTLY USE ENTRY COLOR
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    No spending data for the current month.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget vs Actual Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>
                  Compare budgeted amounts with actual spending (Current Month)
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
                        <defs>
                            <pattern id="pattern-stripe" 
                                x="0" y="0" width="8" height="8" 
                                patternUnits="userSpaceOnUse" 
                                patternTransform="rotate(45)"
                            >
                                <rect x="0" y="0" width="8" height="8" fill="#D1D5DB" /> 
                                <line x1="0" y1="0" x2="0" y2="8" stroke="#9CA3AF" strokeWidth="3" />
                            </pattern>
                        </defs>
                        
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
                        
                        {/* Budget Bar (Hashed Pattern) */}
                        <Bar 
                            dataKey="budget" 
                            name="Budget" 
                            fill="url(#pattern-stripe)" 
                            barSize={30} 
                        />
                        
                        {/* Spent Bar (Solid Dynamic Color) */}
                        <Bar dataKey="value" name="Spent" barSize={30}>
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