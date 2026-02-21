import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, Target, ShieldCheck } from "lucide-react";
import type { Budget, Transaction } from "../App";
import { DailyTipCard } from "./DailyTipCard";
import { useUserSettings } from "../hooks/useUserSettings";
import { partitionIncome } from "../utils/shieldLogic";

interface DashboardOverviewProps {
  budgets: Budget[];
  transactions: Transaction[];
  savingsBuckets?: any[];
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
  savingsBuckets = [],
  onOpenAddTransaction,
}: DashboardOverviewProps) {
  const { userName, monthlyIncome, savingsGoal } = useUserSettings();

  // ─── SHIELD LOGIC ENGINE ───────────────────────────────────────────────────
  const shieldData = useMemo(() => {
    const activeVaults = savingsBuckets.length > 0 
      ? savingsBuckets 
      : [{ id: "default", name: "Base Shield", monthlyTarget: savingsGoal, currentBalance: 0, ceilingAmount: null }];
      
    return partitionIncome(monthlyIncome, activeVaults);
  }, [monthlyIncome, savingsGoal, savingsBuckets]);

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
      title: "Net Balance",
      value: `$${totalBalance.toFixed(2)}`,
      sub: "Income vs Expenses",
      icon: Wallet,
      iconColor: "var(--engine-navy)",
      iconBg: "var(--surface-raised)",
      valueColor: totalBalance >= 0 ? "var(--field-green)" : "var(--castle-red)",
    },
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
      icon: Target,
      iconColor: remainingBudget < 0 ? "var(--castle-red)" : "var(--fortress-steel)",
      iconBg: remainingBudget < 0 ? "#FEE2E2" : "var(--surface-raised)",
      valueColor: remainingBudget < 0 ? "var(--castle-red)" : "var(--text-primary)",
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header & Shield Visualizer ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span style={{ color: 'var(--castle-red)' }}>{userName}</span>
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: 'var(--fortress-steel)' }}>
            Fortress operational. Your vault is secure.
          </p>
        </div>

        {/* The Partition HUD */}
        <div 
          className="flex items-center gap-4 px-4 py-3 rounded-lg border w-full md:w-auto"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-col pr-4 border-r" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--fortress-steel)' }}>Base Income</span>
            <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>${shieldData.baseIncome.toLocaleString()}</span>
          </div>
          <div className="flex flex-col pr-4 border-r" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: 'var(--engine-navy)' }}>
              <ShieldCheck className="w-3 h-3"/> Shielded
            </span>
            <span className="text-lg font-bold font-mono" style={{ color: 'var(--engine-navy)' }}>${shieldData.totalShielded.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--field-green)' }}>True Spendable</span>
            <span className="text-lg font-bold font-mono" style={{ color: 'var(--field-green)' }}>${shieldData.totalSpendable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── Add Transaction & Daily Tip ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onOpenAddTransaction}
          size="lg"
          className="font-bold tracking-wide text-white w-full sm:w-auto"
          style={{
            backgroundColor: 'var(--castle-red)',
            borderColor: 'var(--castle-red-dark)',
            boxShadow: '0 2px 0 0 var(--castle-red-dark)',
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Transaction
        </Button>
        <div className="flex-1">
          <DailyTipCard />
        </div>
      </div>

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