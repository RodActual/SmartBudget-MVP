import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Sparkles, Target, User } from "lucide-react";

interface WelcomeSetupProps {
  userId: string;
  onComplete: (name: string, goal: number) => void;
}

export function WelcomeSetup({ userId, onComplete }: WelcomeSetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !savingsGoal) return;
    
    setLoading(true);
    try {
      const numericGoal = parseFloat(savingsGoal);
      
      // Update Firestore
      const userRef = doc(db, "userSettings", userId);
      await updateDoc(userRef, {
        userName: name,
        savingsGoal: numericGoal,
        isSetupComplete: true, // Mark flow as done
        updatedAt: new Date().toISOString()
      });

      // Notify parent to switch view
      onComplete(name, numericGoal);
    } catch (error) {
      console.error("Error saving setup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to SmartBudget!
          </CardTitle>
          <CardDescription>
            Let's personalize your experience in just two quick steps.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {step === 1 ? (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  What should we call you?
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="e.g. Alex"
                    className="pl-10 h-12 text-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500">
                  This will be displayed on your dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-base font-semibold">
                  What is your monthly savings goal?
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <span className="absolute left-9 top-3 text-lg text-gray-900">$</span>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="500"
                    className="pl-12 h-12 text-lg"
                    value={savingsGoal}
                    onChange={(e) => setSavingsGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500">
                  We'll track your progress against this target every month.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          )}
          <div className={step === 1 ? "w-full" : ""}>
            {step === 1 ? (
              <Button 
                className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700" 
                onClick={handleNext}
                disabled={!name.trim()}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                className="ml-auto h-11 text-base bg-blue-600 hover:bg-blue-700" 
                onClick={handleSubmit}
                disabled={!savingsGoal || loading}
              >
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}