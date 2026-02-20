import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Transaction } from "../App";

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const chartData = transactions
    .filter(t => t.type === "expense")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = acc.find(e => e.date === date);
      if (existing) existing.amount += t.amount;
      else acc.push({ date, amount: t.amount });
      return acc;
    }, [] as { date: string; amount: number }[]);

  // ── Custom tooltip ─────────────────────────────────────────────────────────
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-md border p-3 text-sm"
        style={{
          backgroundColor: "var(--surface)",
          borderColor:     "var(--border-subtle)",
          boxShadow:       "0 4px 12px rgba(0,0,0,0.10)",
        }}
      >
        <p className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          {payload[0].payload.date}
        </p>
        <p style={{ color: "var(--fortress-steel)" }}>
          Spent:{" "}
          <span className="font-bold font-mono" style={{ color: "var(--castle-red)" }}>
            ${payload[0].value.toFixed(2)}
          </span>
        </p>
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
            Spending Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No expense data yet. Add some transactions to see your spending trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
          Spending Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 24, left: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--fortress-steel)", fontFamily: "Inter, sans-serif" }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--fortress-steel)", fontFamily: "Inter, sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--fortress-steel)" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Spending"
                stroke="#8B1219"
                strokeWidth={2.5}
                dot={{ fill: "#8B1219", r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#8B1219", stroke: "var(--surface)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}