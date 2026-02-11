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
  budgets: Budget[]; 
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

  const todayStart = getTodayStart();
  const ninetyDaysAgo = new Date(todayStart);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const startDate = formatDate(ninetyDaysAgo);
  const endDate = formatDate(todayStart);

  // 1. Filter Logic: Last 90 Days AND Not Archived
  const transactionsLast90Days = transactions.filter(t => {
    if (t.archived) return false; // HIDE ARCHIVED ITEMS

    const transactionDate = new Date(t.date);
    transactionDate.setHours(0, 0, 0, 0); 
    return transactionDate >= ninetyDaysAgo; 
  });
  
  // 2. Archive Logic: Older than 90 Days AND Not Archived
  const oldTransactions = transactions.filter(t => {
    if (t.archived) return false; // Don't count already archived items

    const transactionDate = new Date(t.date);
    transactionDate.setHours(0, 0, 0, 0);
    return transactionDate < ninetyDaysAgo;
  });

  const handleArchiveClick = () => {
    if (oldTransactions.length === 0) {
        alert("No active transactions older than 90 days found.");
        return;
    }
    
    if (window.confirm(`Archive ${oldTransactions.length} transactions older than 90 days? They will be hidden from this list but remain in your charts.`)) {
        const oldIds = oldTransactions.map(t => t.id);
        onArchiveOldTransactions(oldIds);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const budget = budgets.find(b => b.category === categoryName);
    return budget ? budget.color : "#9ca3af"; 
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
            <Button variant="outline" onClick={handleArchiveClick} size="sm">
                Archive {oldTransactions.length} Old Transactions
            </Button>
          )}

          <Button onClick={onOpenAddTransaction}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Table */}
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
                    No active transactions found in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}