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

// --- Configuration Constants ---
const INITIAL_RECOMMENDATIONS = [
  { id: "housing", name: "Housing", ratio: 0.30, color: "#001D3D" }, 
  { id: "groceries", name: "Groceries", ratio: 0.15, color: "#10B981" }, 
  { id: "utilities", name: "Utilities", ratio: 0.10, color: "#F59E0B" }, 
  { id: "transport", name: "Transportation", ratio: 0.10, color: "#3B82F6" }, 
];

interface WelcomeSetupProps {
  userId: string;
  onComplete: () => void;
}

export function WelcomeSetup({ userId, onComplete }: WelcomeSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(""); 
  const [income, setIncome] = useState("");
  const [shieldPercent, setShieldPercent] = useState(20);
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<{name: string, limit: number, color: string}[]>([]);
  const [error, setError] = useState("");

  // Derived Calculations
  const numericIncome = parseFloat(income) || 0;
  const shieldedAmount = Math.floor(numericIncome * (shieldPercent / 100));
  const spendableAmount = numericIncome - shieldedAmount;

  // Recalculate budgets when spendable amount changes (only if on step 1)
  useEffect(() => {
    if (step === 1) {
      const newBudgets = INITIAL_RECOMMENDATIONS.map(cat => ({
        name: cat.name,
        limit: Math.floor(spendableAmount * cat.ratio),
        color: cat.color
      }));
      setBudgets(newBudgets);
    }
  }, [spendableAmount, step]);

  const handleBudgetChange = (index: number, val: string) => {
    const updated = [...budgets];
    updated[index].limit = parseFloat(val) || 0;
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

      // 1. Update User Settings (The Shield)
      const userRef = doc(db, "userSettings", userId); 
      batch.set(userRef, {
        userName: name.trim(), 
        monthlyIncome: numericIncome,
        shieldAllocationPct: shieldPercent,
        savingsGoal: shieldedAmount, // Sync Shield Amount to Savings Goal
        isSetupComplete: true,
        updatedAt: new Date().toISOString(),
        notificationsEnabled: true,
        alertSettings: {
            budgetWarningEnabled: true,
            budgetWarningThreshold: 80,
            budgetExceededEnabled: true,
            largeTransactionEnabled: true,
            largeTransactionAmount: 500,
            weeklyReportEnabled: false,
            dismissedAlertIds: [],
        }
      }, { merge: true });

      // 2. Create Common Budgets
      const budgetsRef = collection(db, "budgets");
      budgets.forEach((cat) => {
        const newBudgetRef = doc(budgetsRef); 
        batch.set(newBudgetRef, {
          userId: userId,
          category: cat.name, 
          budgeted: cat.limit, 
          spent: 0,
          color: cat.color,
          lastReset: Date.now(),
        });
      });

      await batch.commit();
      onComplete(); 
      
    } catch (error: any) {
      console.error("Error initializing Fortis Vault:", error);
      setError("Failed to save setup. Please try again. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Custom Styles for Slider */}
      <style>{`
        input[type=range] {
          -webkit-appearance: none; 
          width: 100%; 
          background: transparent; 
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #001D3D;
          cursor: pointer;
          margin-top: -10px; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #CBD5E1;
          border-radius: 4px;
        }
        input[type=range]:focus {
          outline: none;
        }
      `}</style>

      <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-t-[#001D3D]">
        <CardHeader className="text-center pb-6 bg-slate-100/50">
          <div className="mx-auto w-16 h-16 bg-[#001D3D] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FortisLogo className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#001D3D]">
            Initialize Your Vault
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Step {step} of 2: {step === 1 ? "Identity & Income" : "Review & Commit"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 px-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              
              {/* Name Input */}
              <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
                <Label htmlFor="name" className="text-xl font-bold text-slate-800">
                  What should we call you?
                </Label>
                <div className="relative w-full max-w-xs">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="e.g. Alex"
                    className="pl-12 h-12 text-xl border-slate-300 focus:ring-[#001D3D] text-center font-medium text-slate-900 shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Income Input */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Label htmlFor="income" className="text-xl font-bold text-slate-800">
                  Monthly Net Income
                </Label>
                <div className="relative w-full max-w-xs">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <Input
                    id="income"
                    type="number"
                    placeholder="4000"
                    className="pl-12 h-14 text-2xl border-slate-300 focus:ring-[#001D3D] text-center font-bold text-slate-900 shadow-sm"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
                <p className="text-sm text-slate-500">Enter your total take-home pay.</p>
              </div>

              {/* Shield Explanation & Slider */}
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Info className="w-6 h-6 text-[#001D3D]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#001D3D]">The Savings Shield</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      We logically reserve a percentage of every deposit.
                      This becomes your <strong>Monthly Savings Goal</strong>.
                    </p>
                    {/* DISCLAIMER ADDED HERE */}
                    <p className="text-xs text-slate-400 mt-2 italic">
                      *Note: This is a strategic budgeting partition. Fortis does not physically move funds between your real-world bank accounts.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-semibold text-slate-700">Shield Strength</Label>
                    <span className="text-3xl font-bold text-[#001D3D]">{shieldPercent}%</span>
                  </div>
                  
                  {/* Native Input with Custom Styles */}
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={shieldPercent}
                    onChange={(e) => setShieldPercent(parseInt(e.target.value))}
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-center shadow-sm">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Savings Goal</div>
                      <div className="text-xl font-extrabold text-[#001D3D]">${shieldedAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-green-500 text-center shadow-sm bg-green-50/30">
                      <div className="text-xs uppercase tracking-wider text-green-700 font-bold mb-1">True Spendable</div>
                      <div className="text-xl font-extrabold text-green-700">${spendableAmount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-xl font-bold text-slate-800">Customize Your Budgets</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  We calculated these based on your <strong>${spendableAmount.toLocaleString()}</strong> spendable pool. 
                  Adjust them to match your reality.
                </p>
              </div>

              <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2">
                {budgets.map((cat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                    <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                    <Label className="flex-1 font-semibold text-slate-700 text-base">{cat.name}</Label>
                    <div className="relative w-36">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={cat.limit}
                        onChange={(e) => handleBudgetChange(index, e.target.value)}
                        className="pl-8 h-10 text-right font-mono font-bold text-slate-900 border-slate-200 focus:ring-[#001D3D]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-6 px-8 pb-8 bg-slate-50">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} disabled={loading} className="h-12 px-6 border-slate-300 text-slate-600 hover:text-slate-900">
              Back
            </Button>
          )}
          <div className={step === 1 ? "w-full flex justify-center" : "ml-auto"}>
            {step === 1 ? (
              <Button 
                className="w-full max-w-sm h-12 text-lg font-semibold bg-[#001D3D] hover:bg-[#003366] transition-all shadow-md hover:shadow-lg" 
                onClick={handleNext}
                disabled={numericIncome <= 0 || !name.trim()}
              >
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                className="h-12 px-8 text-lg font-semibold bg-[#001D3D] hover:bg-[#003366] transition-all shadow-md hover:shadow-lg flex items-center gap-2" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Initializing Vault..." : "Confirm & Launch"}
                {!loading && <CheckCircle2 className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}