import { Button } from "../ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "../ui/table";
import type { Transaction, Budget } from "../App";

const getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

interface ExpenseTrackingProps {
  transactions: Transaction[];
  budgets: Budget[]; // <-- Added Prop
  onOpenAddTransaction: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onArchiveOldTransactions: (oldTransactionIds: string[]) => Promise<void>;
}

export function ExpenseTracking({
  transactions,
  budgets,
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

  // 3. Filter transactions
  const transactionsLast90Days = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    transactionDate.setHours(0, 0, 0, 0); 
    return transactionDate >= ninetyDaysAgo; 
  });
  
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
    
    if (window.confirm(`Permanently delete ${oldTransactions.length} transactions older than 90 days?`)) {
        const oldIds = oldTransactions.map(t => t.id);
        onArchiveOldTransactions(oldIds);
    }
  };

  // Helper to find color
  const getCategoryColor = (categoryName: string) => {
    const budget = budgets.find(b => b.category === categoryName);
    return budget ? budget.color : "#9ca3af"; // Default gray if not found
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
          {oldTransactions.length > 0 && (
            <Button variant="destructive" onClick={handleArchiveClick} size="sm">
                Delete {oldTransactions.length} Old Transactions
            </Button>
          )}

          <Button onClick={onOpenAddTransaction}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Table (Inlined to support Colors) */}
      <div className="rounded-md border bg-white">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLast90Days.length > 0 ? (
                transactionsLast90Days.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* COLORED DOT */}
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getCategoryColor(transaction.category) }} 
                        />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {transaction.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(transaction)}>
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    No transactions found in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}