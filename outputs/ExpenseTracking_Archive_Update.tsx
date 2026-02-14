// ExpenseTracking.tsx - Updated Archive Confirmation
// This is the code snippet to UPDATE in your ExpenseTracking.tsx file

// FIND this code (around the handleArchiveOld function):
const handleArchiveOld = () => {
  const oldTransactions = displayedTransactions.filter(isOlderThan90Days);
  if (oldTransactions.length === 0) return;

  // OLD CONFIRMATION MESSAGE:
  if (window.confirm(`Archive ${oldTransactions.length} transactions older than 90 days? They will be hidden from this list but remain in your charts.`)) {
    oldTransactions.forEach((transaction) => {
      onUpdateTransaction(transaction.id, { archived: true });
    });
  }
};

// REPLACE WITH this improved version:
const handleArchiveOld = () => {
  const oldTransactions = displayedTransactions.filter(isOlderThan90Days);
  if (oldTransactions.length === 0) return;

  // IMPROVED CONFIRMATION MESSAGE:
  const message = `Archive ${oldTransactions.length} transaction${oldTransactions.length === 1 ? '' : 's'} older than 90 days?

✓ Hidden from your main transaction list
✓ Still counted in charts and analytics  
✓ Accessible in Settings → Archived Transactions

You can restore or permanently delete them later.`;

  if (window.confirm(message)) {
    oldTransactions.forEach((transaction) => {
      onUpdateTransaction(transaction.id, { archived: true });
    });
  }
};

// NOTES:
// - The new message clearly explains what happens to archived transactions
// - Users know they can find them in Settings
// - Users know they have options to restore or delete
// - Multi-line format makes it easy to read
// - Handles singular/plural correctly
