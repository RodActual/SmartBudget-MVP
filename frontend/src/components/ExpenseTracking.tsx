import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
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
  // Updated to match the prop passed from App.tsx
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

export function ExpenseTracking({
  transactions,
  budgets,
  onOpenAddTransaction,
  onEdit,
  onDelete,
  onUpdateTransaction,
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
      const visible = transactions.filter(t => {
        if (t.archived) return false;
        
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        
        const isRecent = tDate >= ninetyDaysAgo;
        if (!isRecent) return false;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            t.description.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower) ||
            t.amount.toString().includes(searchLower);

        return matchesSearch;
      });

      visible.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const formatDate = (d: Date) => d.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });

      return {
          visibleTransactions: visible,
          oldTransactions: old,
          dateRange: `${formatDate(ninetyDaysAgo)} - ${formatDate(todayStart)}`
      };
  }, [transactions, searchTerm]);

  const handleArchiveClick = async () => {
    if (oldTransactions.length === 0) return;
    
    // Improved confirmation message with clear explanation
    const message = `Archive ${oldTransactions.length} transaction${oldTransactions.length === 1 ? '' : 's'} older than 90 days?

✓ Hidden from your main transaction list
✓ Still counted in charts and analytics  
✓ Accessible in Settings → Archived Transactions

You can restore or permanently delete them later.`;

    if (window.confirm(message)) {
        try {
          // Use the updated handler to archive each transaction
          await Promise.all(oldTransactions.map(t => onUpdateTransaction(t.id, { archived: true })));
          alert(`Successfully archived ${oldTransactions.length} transaction${oldTransactions.length === 1 ? '' : 's'}.`);
        } catch (error) {
          console.error("Archive failed:", error);
          alert("An error occurred while archiving.");
        }
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
          <h1 className="text-3xl font-bold tracking-tight text-[#001D3D]">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Active view: <span className="font-semibold text-slate-700">{dateRange}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
             {oldTransactions.length > 0 && (
                <Button variant="outline" onClick={handleArchiveClick} size="sm" className="whitespace-nowrap border-slate-200 text-slate-600">
                    Archive {oldTransactions.length} Old
                </Button>
             )}

            <Button onClick={onOpenAddTransaction} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
            </Button>
        </div>
      </div>

      {/* SEARCH BAR - Isolated Prefix Design */}
      <div className="max-w-md">
        <div className="group flex items-center w-full rounded-md border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all overflow-hidden">
          
          {/* Isolated Icon Container */}
          <div className="flex items-center justify-center w-10 h-10 bg-slate-50 border-r border-slate-200 text-slate-400 group-focus-within:text-blue-500 group-focus-within:bg-blue-50/30">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-10 px-3 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-900">Date</TableHead>
                <TableHead className="font-semibold text-slate-900">Description</TableHead>
                <TableHead className="font-semibold text-slate-900">Category</TableHead>
                <TableHead className="text-right font-semibold text-slate-900">Amount</TableHead>
                <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTransactions.length > 0 ? (
                visibleTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium text-slate-900" title={transaction.description}>
                        {transaction.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                            className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5" 
                            style={{ backgroundColor: getCategoryColor(transaction.category) }} 
                        />
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {transaction.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold tabular-nums ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}
                      ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => onEdit(transaction)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-10 w-10 text-slate-200" />
                        <p className="font-medium">No transactions found</p>
                        <p className="text-xs">Adjust your search or check your archived data.</p>
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