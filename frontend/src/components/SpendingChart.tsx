import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Transaction } from "../App";

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  // Group transactions by date
  const chartData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const existingEntry = acc.find((entry) => entry.date === date);
      if (existingEntry) {
        existingEntry.amount += transaction.amount;
      } else {
        acc.push({ date, amount: transaction.amount });
      }
      return acc;
    }, [] as { date: string; amount: number }[])
    .reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickMargin={10}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#000000"
              strokeWidth={2}
              name="Daily Spending"
              dot={{ fill: "#000000", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
