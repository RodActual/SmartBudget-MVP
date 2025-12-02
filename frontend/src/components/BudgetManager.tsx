import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Budget } from "../App";

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  transactions: any[];
}

const DEFAULT_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899",
  "#06B6D4", "#EF4444", "#6366F1", "#F97316", "#14B8A6"
];

const INITIAL_BUDGETS = [
  { category: "Housing", budgeted: 1000, color: "#3B82F6" },
  { category: "Food", budgeted: 400, color: "#10B981" },
  { category: "Transportation", budgeted: 300, color: "#F59E0B" },
  { category: "Utilities", budgeted: 200, color: "#8B5CF6" },
  { category: "Entertainment", budgeted: 150, color: "#EC4899" },
  { category: "Health", budgeted: 200, color: "#06B6D4" },
  { category: "Shopping", budgeted: 250, color: "#F97316" },
  { category: "Other", budgeted: 100, color: "#6366F1" },
];

const COMMON_CATEGORIES = [
  "Housing", "Food", "Transportation", "Utilities", "Entertainment",
  "Health", "Shopping", "Other"
];

export function BudgetManager({ budgets, onUpdateBudgets, transactions }: BudgetManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  const [lastReset, setLastReset] = useState<{ month: number, year: number } | null>(null);
  

  // Initialize budgets with default values on first load
  useEffect(() => {
    // Only initialize if there are no budgets
    if (budgets.length === 0) {
      const initialBudgets: Budget[] = INITIAL_BUDGETS.map((b, index) => ({
        id: `budget_initial_${index}`,
        category: b.category,
        budgeted: b.budgeted,
        spent: 0,
        lastReset: Date.now(), // Set initial reset time
        color: b.color,
      }));
      
      // Small delay to prevent infinite loop
      const timer = setTimeout(() => {
        onUpdateBudgets(initialBudgets);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [budgets]);

  // Monthly Reset Logic - FIXED DEPENDENCY ARRAY
  useEffect(() => {
    // Only proceed if we have budgets loaded
    if (budgets.length === 0) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Safely get the last reset timestamp from the first budget (assuming all are synchronized)
    const lastUpdateTimestamp = budgets[0].lastReset || 0;
    const lastResetDate = new Date(lastUpdateTimestamp);
    
    const lastResetMonth = lastResetDate.getMonth();
    const lastResetYear = lastResetDate.getFullYear();

    // Check if a new month/year has started
    if (currentMonth !== lastResetMonth || currentYear !== lastResetYear) {
        
        // 1. Create the new updated budget list with spent: 0
        const updatedBudgets = budgets.map(budget => ({
            ...budget,
            spent: 0, 
            lastReset: Date.now(), // Update the lastReset timestamp
        }));

        // 2. Save the reset budgets (triggers Firebase save)
        onUpdateBudgets(updatedBudgets);
        
        console.log(`Budgets reset for new period: ${currentMonth + 1}/${currentYear}`);
    }
    
  }, [budgets, onUpdateBudgets]);


  // Calculate spending for each budget - MODIFIED to use lastReset timestamp
  const getBudgetWithSpending = (budget: Budget) => {
    // Determine the cutoff date based on the budget's lastReset time
    const resetTimestamp = budget.lastReset || 0; 
    
    const spent = transactions
      .filter(t => t.type === "expense" && 
            t.category.toLowerCase() === budget.category.toLowerCase() &&
            // Core filter logic: Transaction must be ON OR AFTER the last reset timestamp
            new Date(t.date).getTime() >= resetTimestamp
        )
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { ...budget, spent };
  };

  // Use the calculated spending for display purposes
  const budgetsWithSpending = budgets.map(getBudgetWithSpending);

  const openAddDialog = () => {
    setEditingBudget(null);
    setCategory("");
    setBudgetAmount("");
    // Find first available color that's not in use
    const usedColors = budgets.map(b => b.color);
    const availableColor = DEFAULT_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_COLORS[0];
    setSelectedColor(availableColor);
    setDialogOpen(true);
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setBudgetAmount(budget.budgeted.toString());
    setSelectedColor(budget.color);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!category.trim() || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert("Please enter a valid category and budget amount");
      return;
    }

    // Check if selected color is already in use by another budget
    const colorInUse = budgets.find(
      b => b.color === selectedColor && b.id !== editingBudget?.id
    );
    
    if (colorInUse) {
      alert(`This color is already used by the "${colorInUse.category}" category. Please choose a different color.`);
      return;
    }

    const currentTime = Date.now();
    // New budget definition needs to include the lastReset field.
    const newBudget: Budget = {
      id: editingBudget?.id || `budget_${currentTime}`,
      category: category.trim(),
      budgeted: parseFloat(budgetAmount),
      // When saving/editing, use the most current calculated 'spent' amount, 
      // or 0 if a new budget. This ensures the persistent 'spent' amount reflects the current period.
      spent: editingBudget ? budgetsWithSpending.find(b => b.id === editingBudget.id)?.spent || 0 : 0, 
      color: selectedColor,
      // Maintain last reset date for existing budget, or set current time for new budget
      lastReset: editingBudget?.lastReset || currentTime, 
    };

    if (editingBudget) {
      // Update existing budget
      const updatedBudgets = budgets.map(b => 
        b.id === editingBudget.id ? newBudget : b
      );
      onUpdateBudgets(updatedBudgets);
    } else {
      // Add new budget
      onUpdateBudgets([...budgets, newBudget]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (budgetId: string) => {
    if (confirm("Are you sure you want to delete this budget category?")) {
      onUpdateBudgets(budgets.filter(b => b.id !== budgetId));
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>
                Set and manage budgets for different spending categories
              </CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Loading default budgets...
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-2xl font-bold text-black">${totalBudget.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                      ${totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget List */}
              <div className="space-y-4">
                {budgetsWithSpending.map((budget) => {
                  const percentage = (budget.spent / budget.budgeted) * 100;
                  const isOverBudget = budget.spent > budget.budgeted;
                  
                  // Determine progress bar color based on percentage
                  let progressBarColor = "#10B981"; // Green - default for < 60%
                  if (percentage >= 100) {
                    progressBarColor = "#000000"; // Black for >= 100%
                  } else if (percentage >= 80) {
                    progressBarColor = "#EF4444"; // Red for 80-99%
                  } else if (percentage >= 60) {
                    progressBarColor = "#F59E0B"; // Amber for 60-79%
                  }

                  return (
                    <div key={budget.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: budget.color }}
                          />
                          <h4 className="font-semibold text-black">{budget.category}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(budget)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(budget.id!)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                          </span>
                          <span className={isOverBudget ? "text-black font-medium" : "text-gray-600"}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: progressBarColor
                            }}
                          />
                        </div>
                        {isOverBudget && (
                          <p className="text-xs text-black font-medium">
                            ${(budget.spent - budget.budgeted).toFixed(2)} over budget
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget Category"}</DialogTitle>
            <DialogDescription>
              {editingBudget 
                ? "Update the budget amount or category details" 
                : "Create a new budget category to track your spending"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                placeholder="e.g., Food, Transportation"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-amount">Budget Amount</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.filter(color => {
                  // Show all colors for editing current budget, or colors not in use
                  const isCurrentBudgetColor = editingBudget?.color === color;
                  const isColorInUse = budgets.some(b => b.color === color);
                  return isCurrentBudgetColor || !isColorInUse;
                }).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-md transition-all hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {DEFAULT_COLORS.filter(color => {
                  const isCurrentBudgetColor = editingBudget?.color === color;
                  const isColorInUse = budgets.some(b => b.color === color);
                  return isCurrentBudgetColor || !isColorInUse;
                }).length} colors available
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingBudget ? "Update" : "Create"} Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}