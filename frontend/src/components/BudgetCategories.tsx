import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SpendingChart } from "../components/SpendingChart";
import { BudgetManager } from "../components/BudgetManager";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
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

export function ChartsInsights({ budgets, transactions, onUpdateBudgets }: ChartsInsightsProps) {

  const categoryData = budgets
    .map(b => ({ name: b.category, value: b.spent, color: b.color, budget: b.budgeted }))
    .filter(item => item.budget > 0 || item.value > 0);

  const pieChartData = categoryData.filter(item => item.value > 0);

  // ── Custom tooltip ─────────────────────────────────────────────────────────
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: ChartTooltipPayload }[];
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div
        className="rounded-md border p-3 text-sm"
        style={{
          backgroundColor: "var(--surface)",
          borderColor:     "var(--border-subtle)",
          boxShadow:       "0 4px 12px rgba(0,0,0,0.10)",
        }}
      >
        <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>{d.name}</p>
        <p style={{ color: "var(--fortress-steel)" }}>
          Spent:{" "}
          <span className="font-bold font-mono" style={{ color: "var(--castle-red)" }}>
            ${d.value.toFixed(2)}
          </span>
        </p>
        {d.budget !== undefined && d.budget > 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            Budget:{" "}
            <span className="font-mono">${d.budget.toFixed(2)}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Charts & Insights
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fortress-steel)" }}>
          Visualize your spending patterns and trends
        </p>
      </div>

      {categoryData.length === 0 ? (
        <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
          <CardContent className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No spending data to display yet. Add some transactions to see your insights.
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

          {/* ── Charts grid ───────────────────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Pie — Spending by Category */}
            <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
              <CardHeader>
                <CardTitle
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-primary)" }}
                >
                  Spending by Category
                </CardTitle>
                <CardDescription style={{ color: "var(--fortress-steel)" }}>
                  Distribution of expenses this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <div style={{ width: "100%", minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) =>
                            percent && name ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                          }
                          labelLine={{ stroke: "var(--border-subtle)" }}
                        >
                          {pieChartData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No spending data for the current month.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar — Budget vs Actual */}
            <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
              <CardHeader>
                <CardTitle
                  className="text-sm font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-primary)" }}
                >
                  Budget vs Actual
                </CardTitle>
                <CardDescription style={{ color: "var(--fortress-steel)" }}>
                  Budgeted amounts vs actual spending this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div style={{ width: "100%", minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <BarChart
                        data={categoryData}
                        margin={{ top: 5, right: 24, left: 4, bottom: 60 }}
                      >
                        <defs>
                          {/* Hatched pattern for budget bars */}
                          <pattern
                            id="fortis-budget-stripe"
                            x="0" y="0" width="8" height="8"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(45)"
                          >
                            <rect x="0" y="0" width="8" height="8" fill="var(--surface-raised)" />
                            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--border)" strokeWidth="3" />
                          </pattern>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="var(--border-subtle)"
                        />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11, fill: "var(--fortress-steel)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--fortress-steel)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={v => `$${v}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 11, color: "var(--fortress-steel)" }}
                          iconType="circle"
                        />

                        {budgets.length > 0 && (
                          <Bar
                            dataKey="budget"
                            fill="url(#fortis-budget-stripe)"
                            name="Budget"
                            barSize={36}
                          />
                        )}

                        <Bar dataKey="value" name="Spent" barSize={36}>
                          {categoryData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spending trend line */}
          <SpendingChart transactions={transactions} />
        </>
      )}
    </div>
  );
}