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
  "#06B6D4", "#EF4444", "#6366F1", "#F97316", "#14B8A6",
];

const INITIAL_BUDGETS = [
  { category: "Housing",        budgeted: 1000, color: "#3B82F6" },
  { category: "Food",           budgeted: 400,  color: "#10B981" },
  { category: "Transportation", budgeted: 300,  color: "#F59E0B" },
  { category: "Utilities",      budgeted: 200,  color: "#8B5CF6" },
  { category: "Entertainment",  budgeted: 150,  color: "#EC4899" },
  { category: "Health",         budgeted: 200,  color: "#06B6D4" },
  { category: "Shopping",       budgeted: 250,  color: "#F97316" },
  { category: "Other",          budgeted: 100,  color: "#6366F1" },
];

const COMMON_CATEGORIES = [
  "Housing", "Food", "Transportation", "Utilities",
  "Entertainment", "Health", "Shopping", "Other",
];

// ── Four-tier progress bar color ─────────────────────────────────────────────
function getBarColor(pct: number): string {
  if (pct >= 100) return "var(--castle-red)";   // Combat / Breach
  if (pct >= 85)  return "var(--safety-amber)"; // Caution
  return "var(--field-green)";                  // Secure
}

export function BudgetManager({ budgets, onUpdateBudgets, transactions }: BudgetManagerProps) {
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory]         = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  useEffect(() => {
    if (budgets.length === 0) {
      const initialBudgets: Budget[] = INITIAL_BUDGETS.map((b, i) => ({
        id: `budget_initial_${i}`,
        category: b.category,
        budgeted: b.budgeted,
        spent: 0,
        lastReset: Date.now(),
        color: b.color,
      }));
      const t = setTimeout(() => onUpdateBudgets(initialBudgets), 100);
      return () => clearTimeout(t);
    }
  }, [budgets]);

  const openAddDialog = () => {
    setEditingBudget(null);
    setCategory("");
    setBudgetAmount("");
    const used = budgets.map(b => b.color);
    setSelectedColor(DEFAULT_COLORS.find(c => !used.includes(c)) || DEFAULT_COLORS[0]);
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
    const colorInUse = budgets.find(b => b.color === selectedColor && b.id !== editingBudget?.id);
    if (colorInUse) {
      alert(`This color is already used by "${colorInUse.category}". Please choose another.`);
      return;
    }

    const now = Date.now();
    const newBudget: Budget = {
      id:        editingBudget?.id || `budget_${now}`,
      category:  category.trim(),
      budgeted:  parseFloat(budgetAmount),
      spent:     editingBudget ? budgets.find(b => b.id === editingBudget.id)?.spent || 0 : 0,
      color:     selectedColor,
      lastReset: editingBudget?.lastReset || now,
    };

    onUpdateBudgets(
      editingBudget
        ? budgets.map(b => b.id === editingBudget.id ? newBudget : b)
        : [...budgets, newBudget]
    );
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this budget category?")) {
      onUpdateBudgets(budgets.filter(b => b.id !== id));
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent,    0);
  const isOverAll   = totalSpent > totalBudget;

  return (
    <>
      <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
                Budget Categories
              </CardTitle>
              <CardDescription style={{ color: "var(--fortress-steel)" }}>
                Set and manage budgets for different spending categories
              </CardDescription>
            </div>
            <Button
              onClick={openAddDialog}
              size="sm"
              className="font-bold text-white gap-1.5"
              style={{
                backgroundColor: "var(--castle-red)",
                border: "none",
                boxShadow: "0 2px 0 0 var(--castle-red-dark)",
              }}
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
              Loading default budgets…
            </p>
          ) : (
            <>
              {/* ── Summary strip ─────────────────────────────────────────── */}
              <div
                className="rounded-md p-4 mb-5 grid grid-cols-2 gap-4 border"
                style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--fortress-steel)" }}>
                    Total Budget
                  </p>
                  <p className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                    ${totalBudget.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--fortress-steel)" }}>
                    Total Spent
                  </p>
                  <p
                    className="text-2xl font-bold font-mono"
                    style={{ color: isOverAll ? "var(--castle-red)" : "var(--field-green)" }}
                  >
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* ── Budget rows ───────────────────────────────────────────── */}
              <div className="space-y-3">
                {budgets.map((budget) => {
                  const pct       = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
                  const isOver    = budget.spent > budget.budgeted;
                  const barColor  = getBarColor(pct);

                  return (
                    <div
                      key={budget.id}
                      className="rounded-md p-3 border transition-colors"
                      style={{
                        backgroundColor: isOver ? "var(--engine-navy)" : "var(--surface)",
                        borderColor:     isOver ? "transparent" : "var(--border-subtle)",
                      }}
                    >
                      {/* Row header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: isOver ? "#FCA5A5" : budget.color }} />
                          <span className="text-sm font-semibold" style={{ color: isOver ? "#FFFFFF" : "var(--text-primary)" }}>
                            {budget.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => openEditDialog(budget)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: isOver ? "#CBD5E1" : "var(--fortress-steel)" }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id!)}
                            className="p-1.5 rounded transition-colors"
                            style={{ color: isOver ? "#FCA5A5" : "var(--castle-red)" }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Spend numbers */}
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span style={{ color: isOver ? "#CBD5E1" : "var(--fortress-steel)" }}>
                          ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: isOver ? "#FCA5A5" : barColor }}
                        >
                          {pct.toFixed(0)}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: isOver ? "rgba(255,255,255,0.12)" : "var(--border-subtle)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>

                      {/* Over-budget callout */}
                      {isOver && (
                        <p className="text-[11px] font-bold font-mono mt-1.5" style={{ color: "#FCA5A5" }}>
                          ▲ ${(budget.spent - budget.budgeted).toFixed(2)} over budget
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Add / Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
          <DialogHeader>
            <DialogTitle className="font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {editingBudget ? "Edit Budget" : "Add Budget Category"}
            </DialogTitle>
            <DialogDescription style={{ color: "var(--fortress-steel)" }}>
              {editingBudget
                ? "Update the budget amount or category details."
                : "Create a new category to track your spending."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--fortress-steel)" }}>
                Category Name
              </Label>
              <Input
                placeholder="e.g., Food, Transportation"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
                style={{
                  backgroundColor: "var(--surface-raised)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--fortress-steel)" }}>
                Budget Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold font-mono pointer-events-none" style={{ color: "var(--fortress-steel)" }}>
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="pl-7 font-mono"
                  style={{
                    backgroundColor: "var(--surface-raised)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--fortress-steel)" }}>
                Category Color
              </Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.filter(color => {
                  const isCurrent = editingBudget?.color === color;
                  const inUse     = budgets.some(b => b.color === color);
                  return isCurrent || !inUse;
                }).map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded-md transition-all"
                    style={{
                      backgroundColor: color,
                      outline: selectedColor === color ? `3px solid var(--engine-navy)` : "none",
                      outlineOffset: "2px",
                    }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="font-bold text-white"
              style={{
                backgroundColor: "var(--castle-red)",
                border: "none",
                boxShadow: "0 2px 0 0 var(--castle-red-dark)",
              }}
            >
              {editingBudget ? "Update" : "Create"} Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}