import { useState, useEffect } from "react";
import { doc, writeBatch, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, CheckCircle2, DollarSign, Info, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FortisLogo } from "./FortisLogo";

const INITIAL_RECOMMENDATIONS = [
  { id: "housing",    name: "Housing",        ratio: 0.30, color: "#1B263B" },
  { id: "groceries",  name: "Groceries",      ratio: 0.15, color: "#10B981" },
  { id: "utilities",  name: "Utilities",      ratio: 0.10, color: "#F59E0B" },
  { id: "transport",  name: "Transportation", ratio: 0.10, color: "#3B82F6" },
];

interface WelcomeSetupProps {
  userId: string;
  onComplete: () => void;
}

export function WelcomeSetup({ userId, onComplete }: WelcomeSetupProps) {
  const [step, setStep]                 = useState(1);
  const [name, setName]                 = useState("");
  const [income, setIncome]             = useState("");
  const [shieldPercent, setShieldPercent] = useState(20);
  const [loading, setLoading]           = useState(false);
  const [budgets, setBudgets]           = useState<{ name: string; limit: number; color: string }[]>([]);
  const [error, setError]               = useState("");

  const numericIncome   = parseFloat(income) || 0;
  const shieldedAmount  = Math.floor(numericIncome * (shieldPercent / 100));
  const spendableAmount = numericIncome - shieldedAmount;

  useEffect(() => {
    if (step === 1) {
      setBudgets(INITIAL_RECOMMENDATIONS.map(cat => ({
        name:  cat.name,
        limit: Math.floor(spendableAmount * cat.ratio),
        color: cat.color,
      })));
    }
  }, [spendableAmount, step]);

  const handleBudgetChange = (i: number, val: string) => {
    const updated = [...budgets];
    updated[i].limit = parseFloat(val) || 0;
    setBudgets(updated);
  };

  const handleNext = () => {
    if (step === 1 && numericIncome > 0 && name.trim().length > 0) setStep(2);
  };

  const handleSubmit = async () => {
    if (numericIncome <= 0) return;
    setLoading(true);
    setError("");
    try {
      const batch = writeBatch(db);

      batch.set(doc(db, "userSettings", userId), {
        userName:           name.trim(),
        monthlyIncome:      numericIncome,
        shieldAllocationPct: shieldPercent,
        savingsGoal:        shieldedAmount,
        isSetupComplete:    true,
        updatedAt:          new Date().toISOString(),
        notificationsEnabled: true,
        alertSettings: {
          budgetWarningEnabled:    true,
          budgetWarningThreshold:  80,
          budgetExceededEnabled:   true,
          largeTransactionEnabled: true,
          largeTransactionAmount:  500,
          weeklyReportEnabled:     false,
          dismissedAlertIds:       [],
        },
      }, { merge: true });

      budgets.forEach(cat => {
        const ref = doc(collection(db, "budgets"));
        batch.set(ref, {
          userId,
          category:  cat.name,
          budgeted:  cat.limit,
          spent:     0,
          color:     cat.color,
          lastReset: Date.now(),
        });
      });

      await batch.commit();
      onComplete();
    } catch (err: any) {
      setError("Failed to save setup. Please try again. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Slider custom styles */}
      <style>{`
        .fortis-range { -webkit-appearance: none; width: 100%; background: transparent; }
        .fortis-range::-webkit-slider-runnable-track { height: 6px; border-radius: 4px; background: var(--border-subtle); cursor: pointer; }
        .fortis-range::-webkit-slider-thumb { -webkit-appearance: none; height: 22px; width: 22px; border-radius: 50%; background: var(--castle-red); cursor: pointer; margin-top: -8px; box-shadow: 0 2px 6px rgba(139,18,25,0.4); }
        .fortis-range:focus { outline: none; }
      `}</style>

      <Card
        className="w-full max-w-2xl shadow-2xl border-t-4"
        style={{
          backgroundColor: "var(--surface)",
          borderColor:     "var(--border-subtle)",
          borderTopColor:  "var(--castle-red)",
        }}
      >
        {/* Header */}
        <CardHeader
          className="text-center pb-6"
          style={{ backgroundColor: "var(--surface-raised)" }}
        >
          <div
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg"
            style={{ backgroundColor: "var(--engine-navy)" }}
          >
            <FortisLogo className="w-10 h-10 text-white" />
          </div>
          <CardTitle
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Initialize Your Vault
          </CardTitle>
          <CardDescription className="text-base mt-1" style={{ color: "var(--fortress-steel)" }}>
            Step {step} of 2: {step === 1 ? "Identity & Income" : "Review & Commit"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 px-8">
          {error && (
            <Alert
              className="mb-6 border rounded-md"
              style={{ backgroundColor: "#FEF2F2", borderColor: "var(--castle-red)" }}
            >
              <AlertTitle className="font-bold text-xs uppercase" style={{ color: "var(--castle-red)" }}>Error</AlertTitle>
              <AlertDescription className="text-xs" style={{ color: "#7F1D1D" }}>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">

              {/* Name */}
              <div
                className="flex flex-col items-center text-center space-y-3 pb-6 border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <Label
                  htmlFor="name"
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  What should we call you?
                </Label>
                <div className="relative w-full max-w-xs">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "var(--text-muted)" }} />
                  <Input
                    id="name"
                    placeholder="e.g. Alex"
                    className="pl-12 h-12 text-xl text-center font-medium"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    style={{
                      backgroundColor: "var(--surface-raised)",
                      borderColor:     "var(--border-subtle)",
                      color:           "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Income */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Label htmlFor="income" className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Monthly Net Income
                </Label>
                <div className="relative w-full max-w-xs">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6" style={{ color: "var(--text-muted)" }} />
                  <Input
                    id="income"
                    type="number"
                    placeholder="4000"
                    className="pl-12 h-14 text-2xl text-center font-bold font-mono"
                    value={income}
                    onChange={e => setIncome(e.target.value)}
                    style={{
                      backgroundColor: "var(--surface-raised)",
                      borderColor:     "var(--border-subtle)",
                      color:           "var(--text-primary)",
                    }}
                  />
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enter your total take-home pay.</p>
              </div>

              {/* Shield */}
              <div
                className="p-6 rounded-xl border space-y-6"
                style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "var(--surface)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
                  >
                    <Info className="w-6 h-6" style={{ color: "var(--engine-navy)" }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: "var(--engine-navy)" }}>The Savings Shield</h4>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--fortress-steel)" }}>
                      We logically reserve a percentage of every deposit.
                      This becomes your <strong>Monthly Savings Goal</strong>.
                    </p>
                    <p className="text-xs mt-2 italic" style={{ color: "var(--text-muted)" }}>
                      *Note: This is a strategic budgeting partition. Fortis does not move real bank funds.
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pt-1">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-semibold" style={{ color: "var(--fortress-steel)" }}>Shield Strength</Label>
                    <span className="text-3xl font-bold font-mono" style={{ color: "var(--castle-red)" }}>
                      {shieldPercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0" max="50" step="5"
                    value={shieldPercent}
                    onChange={e => setShieldPercent(parseInt(e.target.value))}
                    className="fortis-range w-full"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-lg border text-center"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--fortress-steel)" }}>
                        Savings Goal
                      </div>
                      <div className="text-xl font-extrabold font-mono" style={{ color: "var(--engine-navy)" }}>
                        ${shieldedAmount.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="p-4 rounded-lg border-2 text-center"
                      style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}
                    >
                      <div className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--field-green)" }}>
                        True Spendable
                      </div>
                      <div className="text-xl font-extrabold font-mono" style={{ color: "var(--field-green)" }}>
                        ${spendableAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center space-y-2 mb-4">
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Customize Your Budgets
                </h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: "var(--fortress-steel)" }}>
                  Calculated from your <strong className="font-mono">${spendableAmount.toLocaleString()}</strong> spendable pool. Adjust to match your reality.
                </p>
              </div>

              <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2">
                {budgets.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                    style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                    <Label className="flex-1 font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                      {cat.name}
                    </Label>
                    <div className="relative w-36">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      <Input
                        type="number"
                        value={cat.limit}
                        onChange={e => handleBudgetChange(i, e.target.value)}
                        className="pl-8 h-10 text-right font-mono font-bold"
                        style={{
                          backgroundColor: "var(--surface-raised)",
                          borderColor:     "var(--border-subtle)",
                          color:           "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter
          className="flex justify-between pt-6 px-8 pb-8"
          style={{ backgroundColor: "var(--surface-raised)" }}
        >
          {step === 2 && (
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              disabled={loading}
              className="h-12 px-6 font-bold"
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              Back
            </Button>
          )}

          <div className={step === 1 ? "w-full flex justify-center" : "ml-auto"}>
            {step === 1 ? (
              <Button
                className="w-full max-w-sm h-12 text-lg font-bold text-white"
                onClick={handleNext}
                disabled={numericIncome <= 0 || !name.trim()}
                style={{
                  backgroundColor: "var(--castle-red)",
                  border: "none",
                  boxShadow: "0 4px 0 0 var(--castle-red-dark)",
                }}
              >
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                className="h-12 px-8 text-lg font-bold text-white flex items-center gap-2"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: "var(--castle-red)",
                  border: "none",
                  boxShadow: "0 4px 0 0 var(--castle-red-dark)",
                }}
              >
                {loading ? "Initializing Vault…" : "Confirm & Launch"}
                {!loading && <CheckCircle2 className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}