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
  // Group transactions by date and calculate cumulative spending
  const expenseTransactions = transactions
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = expenseTransactions.reduce((acc, transaction) => {
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
  }, [] as { date: string; amount: number }[]);

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg border shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].payload.date}</p>
          <p className="text-sm text-gray-600">
            Spent: ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            No expense data yet. Add some transactions to see your spending trends!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#666" }}
                tickMargin={10}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#666" }}
                tickMargin={10}
                tickFormatter={(value) => `${value}`}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#000000"
                strokeWidth={2}
                name="Daily Spending"
                dot={{ fill: "#000000", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}