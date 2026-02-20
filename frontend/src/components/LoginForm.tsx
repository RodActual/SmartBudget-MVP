import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { FortisLogo } from "./FortisLogo";

interface LoginFormProps {
  onLogin: () => void;
  initialIsSignUp?: boolean;
}

const DEFAULT_ALERT_SETTINGS = {
  budgetWarningEnabled:    true,
  budgetWarningThreshold:  80,
  budgetExceededEnabled:   true,
  largeTransactionEnabled: true,
  largeTransactionAmount:  500,
  weeklyReportEnabled:     false,
  dismissedAlertIds:       [] as string[],
};

export function LoginForm({ onLogin, initialIsSignUp = false }: LoginFormProps) {
  const [isSignUp, setIsSignUp]               = useState(initialIsSignUp);
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [successMessage, setSuccessMessage]   = useState("");
  const [loading, setLoading]                 = useState(false);

  useEffect(() => { setIsSignUp(initialIsSignUp); }, [initialIsSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        await setDoc(doc(db, "userSettings", user.uid), {
          userName:        email.split("@")[0],
          savingsGoal:     0,
          isSetupComplete: false,
          notificationsEnabled: true,
          alertSettings:   DEFAULT_ALERT_SETTINGS,
          updatedAt:       new Date().toISOString(),
        });
        setSuccessMessage("Account created! Verification email sent.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      }
    } catch (err: any) {
      const codes: Record<string, string> = {
        "auth/email-already-in-use": "Email already in use",
        "auth/invalid-email":        "Invalid email address",
        "auth/weak-password":        "Password should be at least 6 characters",
        "auth/wrong-password":       "Invalid password",
        "auth/user-not-found":       "User not found",
        "auth/too-many-requests":    "Too many attempts. Try again later.",
      };
      setError(codes[err.code] || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      const ref  = doc(db, "userSettings", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          userName:        user.displayName || user.email?.split("@")[0] || "User",
          savingsGoal:     0,
          isSetupComplete: false,
          notificationsEnabled: true,
          alertSettings:   DEFAULT_ALERT_SETTINGS,
          updatedAt:       new Date().toISOString(),
        });
      }
      onLogin();
    } catch {
      setError("Google Sign In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--surface-raised)",
    borderColor:     "var(--border-subtle)",
    color:           "var(--text-primary)",
  };

  const labelStyle: React.CSSProperties = {
    color:       "var(--fortress-steel)",
    fontWeight:  600,
    fontSize:    "0.8125rem",
    letterSpacing: "0.01em",
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="mb-8">
        <FortisLogo className="h-14 w-auto" />
      </div>

      <Card
        className="w-full max-w-md border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle
            className="text-2xl font-bold tracking-tight text-center"
            style={{ color: "var(--text-primary)" }}
          >
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center text-sm" style={{ color: "var(--fortress-steel)" }}>
            {isSignUp
              ? "Enter your email below to create your account"
              : "Enter your credentials to access your dashboard"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" style={labelStyle}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" style={labelStyle}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              )}

              {error && (
                <Alert
                  className="border rounded-md"
                  style={{ backgroundColor: "#FEF2F2", borderColor: "var(--castle-red)" }}
                >
                  <AlertCircle className="h-4 w-4" style={{ color: "var(--castle-red)" }} />
                  <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#7F1D1D" }}>
                    Error
                  </AlertTitle>
                  <AlertDescription className="text-xs" style={{ color: "#7F1D1D" }}>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert
                  className="border rounded-md"
                  style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--field-green)" }} />
                  <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#14532D" }}>
                    Success
                  </AlertTitle>
                  <AlertDescription className="text-xs" style={{ color: "#14532D" }}>
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full font-bold text-white tracking-wide"
                disabled={loading}
                style={{
                  backgroundColor: "var(--castle-red)",
                  border:      "none",
                  boxShadow:   "0 2px 0 0 var(--castle-red-dark)",
                }}
              >
                {loading ? "Processing…" : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </div>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: "var(--border-subtle)" }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                className="px-2 font-semibold tracking-widest"
                style={{ backgroundColor: "var(--surface)", color: "var(--text-muted)" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full font-semibold"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              borderColor:     "var(--border-subtle)",
              color:           "var(--text-primary)",
              backgroundColor: "var(--surface-raised)",
            }}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: "var(--fortress-steel)" }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(v => !v)}
              className="font-bold underline"
              style={{ color: "var(--castle-red)" }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
