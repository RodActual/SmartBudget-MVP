import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";
import type { Transaction } from "../App";
import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from "lucide-react";

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit:   (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const formatDate = (d: string | number) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Card className="border" style={{ borderColor: "var(--border-subtle)" }}>
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--surface-raised)" }}>
              {["Date", "Description", "Category", "Type", "Amount", "Actions"].map((col, i) => (
                <TableHead
                  key={col}
                  className={`text-[10px] font-bold uppercase tracking-widest ${i >= 4 ? "text-right" : ""}`}
                  style={{ color: "var(--fortress-steel)" }}
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map(t => {
              const isIncome = t.type === "income";
              return (
                <TableRow
                  key={t.id}
                  style={{ borderColor: "var(--border-subtle)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-raised)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {/* Date */}
                  <TableCell className="text-xs font-mono whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {formatDate(t.date)}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {t.description}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "var(--surface-raised)",
                        color: "var(--fortress-steel)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {t.category}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {isIncome
                        ? <ArrowUpCircle   className="h-4 w-4" style={{ color: "var(--field-green)" }} />
                        : <ArrowDownCircle className="h-4 w-4" style={{ color: "var(--castle-red)" }} />
                      }
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: isIncome ? "var(--field-green)" : "var(--castle-red)" }}
                      >
                        {t.type}
                      </span>
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell
                    className="text-right font-bold font-mono text-sm"
                    style={{ color: isIncome ? "var(--field-green)" : "var(--castle-red)" }}
                  >
                    {isIncome ? "+" : "−"}${t.amount.toFixed(2)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => onEdit(t)}
                        aria-label="Edit"
                        style={{ color: "var(--fortress-steel)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--engine-navy)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--fortress-steel)")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            aria-label="Delete"
                            style={{ color: "var(--fortress-steel)" }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--castle-red)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--fortress-steel)")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
                          <AlertDialogHeader>
                            <AlertDialogTitle style={{ color: "var(--text-primary)" }}>Delete Transaction</AlertDialogTitle>
                            <AlertDialogDescription style={{ color: "var(--fortress-steel)" }}>
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(t.id)}
                              className="font-bold text-white"
                              style={{ backgroundColor: "var(--castle-red)", border: "none" }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}