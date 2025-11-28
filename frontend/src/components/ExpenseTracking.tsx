import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { TransactionsTable } from "../components/TransactionsTable";
import type { Transaction } from "../App";

interface ExpenseTrackingProps {
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function ExpenseTracking({
  transactions,
  onOpenAddTransaction,
  onEdit,
  onDelete,
}: ExpenseTrackingProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your transactions
          </p>
        </div>
        <Button onClick={onOpenAddTransaction}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Transactions Table */}
      <TransactionsTable
        transactions={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
