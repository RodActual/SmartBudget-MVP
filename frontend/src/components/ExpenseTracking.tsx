import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { TransactionsTable } from "../components/TransactionsTable";
import type { Transaction } from "../App";

// Utility function to get the start of today (to ensure correct date comparisons)
const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

interface ExpenseTrackingProps {
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onArchiveOldTransactions: (oldTransactionIds: string[]) => Promise<void>;
}

export function ExpenseTracking({
  transactions,
  onOpenAddTransaction,
  onEdit,
  onDelete,
  onArchiveOldTransactions,
}: ExpenseTrackingProps) {

  // 1. Calculate the 90-day cutoff date
  const todayStart = getTodayStart();
  const ninetyDaysAgo = new Date(todayStart);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  // 2. Format dates for display
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const startDate = formatDate(ninetyDaysAgo);
  const endDate = formatDate(todayStart);

  // 3. Filter transactions for the last 90 days
  const transactionsLast90Days = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    // Convert transactionDate to start of day for comparison clarity
    transactionDate.setHours(0, 0, 0, 0); 
    
    // Include transactions from 90 days ago up to and including today
    return transactionDate >= ninetyDaysAgo; 
  });
  
  // 4. Identify old transactions for archiving/deletion (older than 90 days)
  const oldTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    transactionDate.setHours(0, 0, 0, 0);
    return transactionDate < ninetyDaysAgo;
  });

  const handleArchiveClick = () => {
    if (oldTransactions.length === 0) {
        alert("No transactions older than 90 days to delete.");
        return;
    }
    
    const confirmation = window.confirm(
      `Are you sure you want to permanently delete ${oldTransactions.length} transactions older than 90 days? This action cannot be undone.`
    );

    if (confirmation) {
        const oldIds = oldTransactions.map(t => t.id);
        onArchiveOldTransactions(oldIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Transactions for the last 90 days: <span className="font-semibold">{startDate} - {endDate}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Archive/Delete Button */}
          {oldTransactions.length > 0 && (
            <Button variant="destructive" onClick={handleArchiveClick} size="sm">
                Delete {oldTransactions.length} Old Transactions
            </Button>
          )}

          {/* Add Transaction Button */}
          <Button onClick={onOpenAddTransaction}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsTable
        transactions={transactionsLast90Days} // Use the filtered list
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}