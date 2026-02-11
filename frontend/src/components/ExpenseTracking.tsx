import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Input } from "../ui/input"; // Make sure you have this component
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
  const [searchTerm, setSearchTerm] = useState("");

  const { visibleTransactions, oldTransactions, dateRange } = useMemo(() => {
      const todayStart = getTodayStart();
      const ninetyDaysAgo = new Date(todayStart);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // 1. Logic: Identify Old Candidates (Older than 90 days & Not Archived)
      const old = transactions.filter(t => {
        if (t.archived) return false;
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        return tDate < ninetyDaysAgo;
      });

      // 2. Logic: Filter Visible (Last 90 days OR Newer & Not Archived)
      // + Search Logic
      const visible = transactions.filter(t => {
        if (t.archived) return false;
        
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        
        // Date Check
        const isRecent = tDate >= ninetyDaysAgo;
        if (!isRecent) return false;

        // Search Check
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            t.description.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower) ||
            t.amount.toString().includes(searchLower);

        return matchesSearch;
      });

      // Sort by date desc
      visible.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const formatDate = (d: Date) => d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

      return {
          visibleTransactions: visible,
          oldTransactions: old,
          dateRange: `${formatDate(ninetyDaysAgo)} - ${formatDate(todayStart)}`
      };
  }, [transactions, searchTerm]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Active transactions: <span className="font-semibold">{dateRange}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
             {/* Archive Button */}
             {oldTransactions.length > 0 && (
                <Button variant="outline" onClick={handleArchiveClick} size="sm" className="whitespace-nowrap">
                    Archive {oldTransactions.length} Old
                </Button>
             )}

            <Button onClick={onOpenAddTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
            </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTransactions.length > 0 ? (
                visibleTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                        {transaction.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                            className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5" 
                            style={{ backgroundColor: getCategoryColor(transaction.category) }} 
                        />
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/10">
                            {transaction.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold tabular-nums ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => onEdit(transaction)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => onDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-8 w-8 text-gray-300" />
                        <p>No transactions found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}