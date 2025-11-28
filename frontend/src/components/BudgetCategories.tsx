import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { Palette } from "lucide-react";
import type { Budget } from "../App";

interface BudgetCategoriesProps {
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

// 10 distinct, discernible colors for user selection
const COLOR_PALETTE = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Red", value: "#EF4444" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Orange", value: "#F97316" },
  { name: "Teal", value: "#14B8A6" },
];

export function BudgetCategories({ budgets, onUpdateBudgets }: BudgetCategoriesProps) {
  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 60) return "#10B981"; // Green
    if (percentage <= 80) return "#F59E0B"; // Amber
    if (percentage < 100) return "#EF4444"; // Red
    return "#000000"; // Black for 100%+
  };

  const handleColorChange = (categoryName: string, newColor: string) => {
    const updatedBudgets = budgets.map((budget) =>
      budget.category === categoryName
        ? { ...budget, color: newColor }
        : budget
    );
    onUpdateBudgets(updatedBudgets);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budgeted) * 100;
          const isOverBudget = percentage > 100;
          const progressBarColor = getProgressBarColor(percentage);

          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="h-3 w-3 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition-all"
                        style={{ backgroundColor: budget.color }}
                        aria-label={`Change color for ${budget.category}`}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm mb-1">Select color</p>
                        <div className="grid grid-cols-5 gap-2">
                          {COLOR_PALETTE.map((color) => (
                            <button
                              key={color.value}
                              className="h-8 w-8 rounded-md hover:ring-2 hover:ring-offset-2 hover:ring-gray-400 transition-all"
                              style={{ backgroundColor: color.value }}
                              onClick={() =>
                                handleColorChange(budget.category, color.value)
                              }
                              aria-label={color.name}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <span>{budget.category}</span>
                </div>
                <span className="text-muted-foreground">
                  ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1">
                <Progress
                  value={Math.min(percentage, 100)}
                  className="h-2"
                  style={
                    {
                      "--progress-background": progressBarColor,
                    } as React.CSSProperties
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% used
                  {isOverBudget && (
                    <span className="text-destructive ml-1">
                      (${(budget.spent - budget.budgeted).toFixed(2)} over
                      budget)
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
