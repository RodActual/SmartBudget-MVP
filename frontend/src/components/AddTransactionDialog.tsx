import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../ui/select";
import { MoneyInput } from "./MoneyInput";
import type { Transaction, Budget } from "../App";
import { parseDateInput, formatDateForInput } from "../utils/dateUtils";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onEditTransaction: (transaction: Omit<Transaction, "id">) => void;
  editingTransaction: Transaction | null;
  budgets: Budget[];
}

const labelStyle: React.CSSProperties = {
  color:         "var(--text-primary)",
  fontWeight:    600,
  fontSize:      "0.8125rem",
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-raised)",
  borderColor:     "var(--border-subtle)",
  color:           "var(--text-primary)",
};

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAddTransaction,
  onEditTransaction,
  editingTransaction,
  budgets,
}: AddTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount]           = useState<number>(0);
  const [category, setCategory]       = useState("");
  const [type, setType]               = useState<"income" | "expense">("expense");
  const [date, setDate]               = useState(formatDateForInput(new Date()));

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount);
      setCategory(editingTransaction.category);
      setType(editingTransaction.type);
      setDate(formatDateForInput(editingTransaction.date));
    } else {
      setDescription("");
      setAmount(0);
      setCategory("");
      setType("expense");
      setDate(formatDateForInput(new Date()));
    }
  }, [editingTransaction, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    const transactionData = {
      date: parseDateInput(date),
      description,
      category,
      amount,
      type,
    };

    if (editingTransaction) {
      onEditTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
      setDescription("");
      setAmount(0);
      setCategory("");
    }
  };

  const uniqueCategories = Array.from(new Set([
    ...budgets.map(b => b.category),
    "Income",
    "Other",
  ]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle
              className="text-lg font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {editingTransaction ? "Edit Transaction" : "Log Transaction"}
            </DialogTitle>
            <DialogDescription style={{ color: "var(--fortress-steel)" }}>
              {editingTransaction
                ? "Update the transaction details below."
                : "Record a new income or expense entry."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            {/* Date */}
            <div className="grid gap-1.5">
              <Label htmlFor="date" style={labelStyle}>Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
              />
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
              <Label htmlFor="description" style={labelStyle}>Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            {/* Category */}
            <div className="grid gap-1.5">
              <Label htmlFor="category" style={labelStyle}>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger
                  id="category"
                  style={{
                    ...inputStyle,
                    color: category ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
                  {uniqueCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="grid gap-1.5">
              <Label htmlFor="type" style={labelStyle}>Type</Label>
              <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                <SelectTrigger
                  id="type"
                  style={{
                    ...inputStyle,
                    color:      type === "income" ? "var(--field-green)" : "var(--castle-red)",
                    fontWeight: 600,
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
                  <SelectItem value="expense">
                    <span style={{ color: "var(--castle-red)", fontWeight: 600 }}>Expense</span>
                  </SelectItem>
                  <SelectItem value="income">
                    <span style={{ color: "var(--field-green)", fontWeight: 600 }}>Income</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount — MoneyInput handles $ alignment + blur formatting */}
            <div className="grid gap-1.5">
              <Label htmlFor="amount" style={labelStyle}>Amount</Label>
              <MoneyInput
                id="amount"
                value={amount}
                onChange={setAmount}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              style={{
                borderColor:     "var(--border-subtle)",
                color:           "var(--fortress-steel)",
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="font-bold tracking-wide text-white"
              style={{
                backgroundColor: "var(--castle-red)",
                boxShadow:       "0 2px 0 0 var(--castle-red-dark)",
                border:          "none",
              }}
            >
              {editingTransaction ? "Update" : "Log"} Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}