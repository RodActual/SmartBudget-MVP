import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { BudgetManager } from "../components/BudgetManager";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from "recharts";
import { TrendingUp, TrendingDown, GitCompare } from "lucide-react";
import type { Budget, Transaction } from "../App";

interface ChartsInsightsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

// HELPER: Convert potential legacy Tailwind classes to Hex
const resolveColor = (color: string) => {
  if (!color) return "#cbd5e1";
  if (color.startsWith("#")) return color;
  if (color.startsWith("rgb")) return color;
  
  const colorMap: Record<string, string> = {
    "bg-red-600": "#dc2626",
    "bg-blue-600": "#2563eb",
    "bg-green-600": "#16a34a",
    "bg-yellow-600": "#ca8a04",
    "bg-purple-600": "#9333ea",
    "bg-pink-600": "#db2777",
    "bg-indigo-600": "#4f46e5",
  };
  return colorMap[color] || "#64748b";
};

export function ChartsInsights({
  budgets,
  transactions,
  onUpdateBudgets,
}: ChartsInsightsProps) {
  const [chartMode, setChartMode] = useState<'growth' | 'spending' | 'comparison'>('comparison');

  // --- 1. DATA PREP: CATEGORY SPENDING ---
  const categoryData = useMemo(() => {
    return budgets
      .map((budget) => ({
        name: budget.category,
        value: budget.spent,
        color: resolveColor(budget.color),
        budget: budget.budgeted,
      }))
      .filter((item) => item.budget > 0 || item.value > 0);
  }, [budgets]);

  const pieChartData = categoryData.filter(item => item.value > 0);

  // --- 2. DATA PREP: TRENDS OVER TIME ---
  const trendData = useMemo(() => {
    const groupedData: Record<string, { date: string, sortKey: number, income: number, expense: number }> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const month = d.getMonth(); 
      const sortKey = year * 100 + month;
      const key = `${year}-${month}`;
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!groupedData[key]) {
        groupedData[key] = { date: displayDate, sortKey, income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        groupedData[key].income += t.amount;
      } else {
        groupedData[key].expense += t.amount;
      }
    });

    return Object.values(groupedData).sort((a, b) => a.sortKey - b.sortKey);
  }, [transactions]);

  // --- CUSTOM TOOLTIPS ---
  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border shadow-lg text-sm">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
             <p className="font-medium text-slate-900">{data.name}</p>
          </div>
          <p className="text-slate-600">Spent: ${data.value.toFixed(2)}</p>
          {data.budget > 0 && <p className="text-slate-400 text-xs">Budget: ${data.budget.toFixed(2)}</p>}
        </div>
      );
    }
    return null;
  };

  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border shadow-lg text-sm">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
              <span className="capitalize text-slate-600">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.stroke || entry.fill }}>
                ${entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Charts & Insights</h1>
        <p className="text-gray-600 mt-1">Visualize your financial health</p>
      </div>

      {/* --- SECTION 1: BUDGET MANAGEMENT --- */}
      <BudgetManager 
        budgets={budgets} 
        onUpdateBudgets={onUpdateBudgets}
        transactions={transactions}
      />

      {/* --- SECTION 2: CATEGORY BREAKDOWN --- */}
      {categoryData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Current Month Distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => (percent || 0) > 0.05 ? `${name}` : null}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Budget vs Actual Bar Chart (Side-by-Side) */}
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Budget Adherence</CardTitle>
              <CardDescription>Planned vs Actual Spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart 
                    data={categoryData} 
                    layout="vertical" 
                    margin={{ left: 10, right: 30 }}
                    barGap={4} // Adds slight space between Budget and Spent bars
                  >
                    {/* Pattern Definition for Budget Bar */}
                    <defs>
                        <pattern id="pattern-stripe" 
                            x="0" y="0" width="8" height="8" 
                            patternUnits="userSpaceOnUse" 
                            patternTransform="rotate(45)"
                        >
                            <rect x="0" y="0" width="8" height="8" fill="#e5e7eb" /> 
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#9ca3af" strokeWidth="2" />
                        </pattern>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11}} />
                    <Tooltip content={<CategoryTooltip />} cursor={{fill: 'transparent'}} />
                    <Legend iconType="rect" />
                    
                    {/* Budget Bar (Striped Pattern) */}
                    <Bar 
                        dataKey="budget" 
                        name="Budget" 
                        fill="url(#pattern-stripe)" 
                        radius={[0, 4, 4, 0]} 
                        barSize={12} 
                    />
                    
                    {/* Spent Bar (Solid Color) */}
                    <Bar 
                        dataKey="value" 
                        name="Spent" 
                        radius={[0, 4, 4, 0]} 
                        barSize={12}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="py-12 text-center text-gray-500">
            Add transactions and budgets to see your category breakdown.
          </CardContent>
        </Card>
      )}

      {/* --- SECTION 3: FINANCIAL TRENDS --- */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Track your growth and spending habits over time</CardDescription>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <Button
                variant={chartMode === 'growth' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartMode('growth')}
                className={`text-xs ${chartMode === 'growth' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-slate-600 hover:text-green-700'}`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Growth
              </Button>
              <Button
                variant={chartMode === 'spending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartMode('spending')}
                className={`text-xs ${chartMode === 'spending' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-slate-600 hover:text-red-700'}`}
              >
                <TrendingDown className="w-3 h-3 mr-1" />
                Spending
              </Button>
              <Button
                variant={chartMode === 'comparison' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartMode('comparison')}
                className={`text-xs ${chartMode === 'comparison' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-slate-600 hover:text-blue-700'}`}
              >
                <GitCompare className="w-3 h-3 mr-1" />
                Compare
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {trendData.length > 0 ? (
            <div style={{ width: "100%", height: 350, marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${value}`} 
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend verticalAlign="top" height={36} />

                  {(chartMode === 'growth' || chartMode === 'comparison') && (
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      name="Income"
                      stroke="#16a34a" 
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      strokeWidth={2}
                    />
                  )}
                  
                  {(chartMode === 'spending' || chartMode === 'comparison') && (
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      name="Expenses"
                      stroke="#dc2626" 
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 bg-slate-50 rounded-lg border border-dashed">
              Not enough transaction history to show trends.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}