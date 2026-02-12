import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
  AreaChart,
  Area,
  ReferenceLine,
  Label
} from "recharts";
import { TrendingUp, TrendingDown, GitCompare, Calendar } from "lucide-react";
import type { Budget, Transaction } from "../App";

interface ChartsInsightsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

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

type TimeRange = '3m' | '6m' | '1y' | 'all';

export function ChartsInsights({
  budgets,
  transactions,
  onUpdateBudgets,
}: ChartsInsightsProps) {
  const [chartMode, setChartMode] = useState<'growth' | 'spending' | 'comparison'>('comparison');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // --- 1. DATA PREP: CATEGORY SPENDING (Bar & Pie) ---
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

  // --- 2. DATA PREP: TRENDS WITH DRILL-DOWN FILTERING ---
  const filteredTrendData = useMemo(() => {
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

    const sortedData = Object.values(groupedData).sort((a, b) => a.sortKey - b.sortKey);

    if (timeRange === 'all') return sortedData;
    
    const rangeMap: Record<TimeRange, number> = { '3m': 3, '6m': 6, '1y': 12, 'all': 999 };
    return sortedData.slice(-rangeMap[timeRange]);
  }, [transactions, timeRange]);

  const visibleAverages = useMemo(() => {
    if (filteredTrendData.length === 0) return { income: 0, expense: 0 };
    const totalIncome = filteredTrendData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = filteredTrendData.reduce((sum, d) => sum + d.expense, 0);
    return {
      income: totalIncome / filteredTrendData.length,
      expense: totalExpense / filteredTrendData.length
    };
  }, [filteredTrendData]);

  // --- CUSTOM PIE LABEL RENDERER ---
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.25; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.03) return null;

    return (
      <text 
        x={x} y={y} 
        fill="#64748b" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        className="text-[10px] font-semibold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

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
                ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        <h1 className="text-3xl font-bold text-black tracking-tight">Charts & Insights</h1>
        <p className="text-gray-600 mt-1">Analyze your spending patterns and financial trends.</p>
      </div>

      <BudgetManager 
        budgets={budgets} 
        onUpdateBudgets={onUpdateBudgets}
        transactions={transactions}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Relative distribution of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                    labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    label={renderCustomizedLabel}
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

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Budget Adherence</CardTitle>
            <CardDescription>Planned vs Actual comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }} barGap={4}>
                  <defs>
                    <pattern id="pattern-stripe" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect x="0" y="0" width="8" height="8" fill="#f1f5f9" /> 
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} />
                  <Tooltip content={<CategoryTooltip />} cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="rect" />
                  <Bar dataKey="budget" name="Budget" fill="url(#pattern-stripe)" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="value" name="Spent" radius={[0, 4, 4, 0]} barSize={12}>
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Performance tracking against visible range averages</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Range Selector */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shadow-sm">
                <Calendar className="w-3 h-3 ml-2 mr-1 text-slate-400" />
                {(['3m', '6m', '1y', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-all ${
                      timeRange === range 
                      ? 'bg-white text-black shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-black'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Chart Mode Selector */}
<div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setChartMode('growth')}
    style={{
      backgroundColor: chartMode === 'growth' ? '#16a34a' : 'transparent',
      color: chartMode === 'growth' ? '#ffffff' : '#475569',
    }}
    className="text-xs h-8 px-4 transition-all"
  >
    <TrendingUp className="w-3 h-3 mr-1" /> Growth
  </Button>
  
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setChartMode('spending')}
    style={{
      backgroundColor: chartMode === 'spending' ? '#dc2626' : 'transparent',
      color: chartMode === 'spending' ? '#ffffff' : '#475569',
    }}
    className="text-xs h-8 px-4 transition-all"
  >
    <TrendingDown className="w-3 h-3 mr-1" /> Spending
  </Button>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => setChartMode('comparison')}
    style={{
      backgroundColor: chartMode === 'comparison' ? '#2563eb' : 'transparent',
      color: chartMode === 'comparison' ? '#ffffff' : '#475569',
    }}
    className="text-xs h-8 px-4 transition-all"
  >
    <GitCompare className="w-3 h-3 mr-1" /> Compare
  </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredTrendData.length > 0 ? (
            <div style={{ width: "100%", height: 400, marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={filteredTrendData} margin={{ top: 20, right: 60, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => `$${v}`} 
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Legend verticalAlign="top" height={40} iconType="circle" />

                  {/* Dynamic Reference Lines */}
                  {(chartMode === 'growth' || chartMode === 'comparison') && (
                    <ReferenceLine y={visibleAverages.income} stroke="#16a34a" strokeDasharray="4 4">
                      <Label 
                        value={`Avg: $${visibleAverages.income.toFixed(0)}`} 
                        position="right" 
                        fill="#16a34a" 
                        fontSize={10} 
                        fontWeight="bold" 
                      />
                    </ReferenceLine>
                  )}
                  {(chartMode === 'spending' || chartMode === 'comparison') && (
                    <ReferenceLine y={visibleAverages.expense} stroke="#dc2626" strokeDasharray="4 4">
                      <Label 
                        value={`Avg: $${visibleAverages.expense.toFixed(0)}`} 
                        position="right" 
                        fill="#dc2626" 
                        fontSize={10} 
                        fontWeight="bold" 
                      />
                    </ReferenceLine>
                  )}

                  {(chartMode === 'growth' || chartMode === 'comparison') && (
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      name="Income" 
                      stroke="#16a34a" 
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      strokeWidth={3} 
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
                      strokeWidth={3} 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 bg-slate-50 rounded-lg border border-dashed text-sm">
              Insufficient data history for this range.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}