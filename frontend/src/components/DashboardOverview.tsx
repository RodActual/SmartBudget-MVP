import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, Target } from "lucide-react";
import type { Budget, Transaction } from "../App";
import { DailyTipCard } from "./DailyTipCard";
import { useUserSettings } from "../hooks/useUserSettings";

interface DashboardOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
}

// ─── Four-Tier Budget Classification ────────────────────────────────────────
function getBudgetTier(spent: number, budgeted: number): {
  className: string;
  barColor: string;
  labelColor: string;
  label: string;
} {
  if (budgeted === 0) return {
    className: "",
    barColor: "var(--fortress-steel)",
    labelColor: "var(--fortress-steel)",
    label: "—",
  };

  const pct = (spent / budgeted) * 100;

  if (spent > budgeted) return {
    className: "budget-combat",
    barColor: "var(--castle-red)",
    labelColor: "#FCA5A5",
    label: "OVER BUDGET",
  };
  if (pct >= 100) return {
    className: "budget-breach",
    barColor: "#991B1B",
    labelColor: "#991B1B",
    label: "BREACH",
  };
  if (pct >= 85) return {
    className: "budget-caution",
    barColor: "var(--safety-amber)",
    labelColor: "var(--safety-amber)",
    label: "CAUTION",
  };
  return {
    className: "budget-secure",
    barColor: "var(--field-green)",
    labelColor: "var(--field-green)",
    label: "SECURE",
  };
}

export function DashboardOverview({
  budgets,
  transactions,
  onOpenAddTransaction,
}: DashboardOverviewProps) {
  const { userName, savingsGoal } = useUserSettings();

  const financialTotals = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
    const totalSpent  = budgets.reduce((sum, b) => sum + b.spent, 0);

    const activeTransactions = transactions.filter(t => !t.archived);
    const totalIncome   = activeTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = activeTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalBalance  = totalIncome - totalExpenses;
    const savings       = totalBalance > 0 ? totalBalance : 0;
    const remainingBudget = totalBudget - totalSpent;

    return { totalBudget, totalSpent, totalIncome, totalExpenses, totalBalance, savings, remainingBudget };
  }, [budgets, transactions]);

  const recentTransactions = useMemo(() => (
    transactions.filter(t => !t.archived).slice(0, 5)
  ), [transactions]);

  const { totalIncome, totalExpenses, totalBalance, savings, remainingBudget } = financialTotals;

  // ─── Summary card definitions ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Income",
      value: `$${totalIncome.toFixed(2)}`,
      sub: "All-time earnings",
      icon: TrendingUp,
      iconColor: "var(--field-green)",
      iconBg: "#DCFCE7",
      valueColor: "var(--field-green)",
    },
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toFixed(2)}`,
      sub: "All-time spending",
      icon: TrendingDown,
      iconColor: "var(--castle-red)",
      iconBg: "#FEE2E2",
      valueColor: "var(--castle-red)",
    },
    {
      title: "Available Budget",
      value: `$${remainingBudget.toFixed(2)}`,
      sub: "Remaining to spend",
      icon: Wallet,
      iconColor: remainingBudget < 0 ? "var(--castle-red)" : "var(--fortress-steel)",
      iconBg: remainingBudget < 0 ? "#FEE2E2" : "var(--surface-raised)",
      valueColor: remainingBudget < 0 ? "var(--castle-red)" : "var(--text-primary)",
    },
    {
      title: "Savings Progress",
      value: `$${savings.toFixed(2)}`,
      sub: savingsGoal > 0
        ? `${Math.min(((savings / savingsGoal) * 100), 100).toFixed(0)}% of $${savingsGoal.toFixed(2)} goal`
        : "Set a goal in Settings",
      icon: Target,
      iconColor: "var(--engine-navy)",
      iconBg: "#DBEAFE",
      valueColor: "var(--engine-navy)",
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span style={{ color: 'var(--castle-red)' }}>{userName}</span>
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--fortress-steel)' }}>
            Here's your financial situation report.
          </p>
        </div>

        {/* Balance Badge */}
        <div 
          className="text-right px-4 py-2 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fortress-steel)' }}>
            Net Balance
          </p>
          <p 
            className="text-2xl font-bold font-mono"
            style={{ color: totalBalance >= 0 ? 'var(--field-green)' : 'var(--castle-red)' }}
          >
            {totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── Add Transaction ─────────────────────────────────────────────────── */}
      <div>
        <Button
          onClick={onOpenAddTransaction}
          size="lg"
          className="font-bold tracking-wide text-white"
          style={{
            backgroundColor: 'var(--castle-red)',
            borderColor: 'var(--castle-red-dark)',
            boxShadow: '0 2px 0 0 var(--castle-red-dark)',
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Transaction
        </Button>
      </div>

      {/* ── Daily Tip ───────────────────────────────────────────────────────── */}
      <DailyTipCard />

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border" style={{ borderColor: 'var(--border-subtle)' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--fortress-steel)' }}>
                  {card.title}
                </CardTitle>
                <div 
                  className="p-1.5 rounded-md"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.iconColor }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono" style={{ color: card.valueColor }}>
                  {card.value}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {card.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Budget Progress + Recent Transactions ───────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Budget Progress — Four-Tier System */}
        <Card className="col-span-4 border" style={{ borderColor: 'var(--border-subtle)' }}>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No budgets configured yet.
              </p>
            ) : (
              <div className="space-y-3">
                {budgets.map((budget) => {
                  const pct  = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
                  const tier = getBudgetTier(budget.spent, budget.budgeted);
                  const isCombat = budget.spent > budget.budgeted;

                  return (
                    <div
                      key={budget.id}
                      className={`rounded-md p-3 border transition-all ${tier.className}`}
                      style={{
                        backgroundColor: isCombat ? 'var(--engine-navy)' : 'var(--surface)',
                        borderColor: isCombat ? 'transparent' : 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: isCombat ? '#FCA5A5' : budget.color }}
                          />
                          <span 
                            className="text-sm font-semibold"
                            style={{ color: isCombat ? '#FFFFFF' : 'var(--text-primary)' }}
                          >
                            {budget.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-xs font-bold font-mono"
                            style={{ color: isCombat ? '#CBD5E1' : 'var(--fortress-steel)' }}
                          >
                            ${budget.spent.toFixed(0)} / ${budget.budgeted}
                          </span>
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ 
                              color: tier.labelColor,
                              backgroundColor: isCombat ? 'rgba(255,255,255,0.08)' : 'transparent',
                            }}
                          >
                            {tier.label}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div 
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: isCombat ? 'rgba(255,255,255,0.12)' : 'var(--border-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: tier.barColor,
                          }}
                        />
                      </div>

                      {/* Over-budget callout */}
                      {isCombat && (
                        <p className="text-xs font-bold mt-1.5 font-mono" style={{ color: '#FCA5A5' }}>
                          ▲ ${(budget.spent - budget.budgeted).toFixed(2)} over budget
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 border" style={{ borderColor: 'var(--border-subtle)' }}>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-1.5 rounded-md"
                        style={{
                          backgroundColor: t.type === "income" ? "#DCFCE7" : "#FEE2E2",
                        }}
                      >
                        {t.type === "income"
                          ? <TrendingUp  className="h-3.5 w-3.5" style={{ color: 'var(--field-green)' }} />
                          : <TrendingDown className="h-3.5 w-3.5" style={{ color: 'var(--castle-red)' }} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {t.description}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {t.category} &bull;{" "}
                          {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: t.type === "income" ? 'var(--field-green)' : 'var(--castle-red)' }}
                    >
                      {t.type === "income" ? "+" : "−"}${Math.abs(t.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}