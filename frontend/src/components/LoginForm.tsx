// frontend/src/components/LoginForm.tsx
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from "firebase/auth";
import { auth, db } from "../firebase"; // Ensure db is imported if you create user docs
import { doc, setDoc } from "firebase/firestore"; // Import setDoc for user creation
import { AlertCircle } from "lucide-react";

interface LoginFormProps {
  onLogin: (uid: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // REMOVED: The check for (!user.emailVerified) followed by signOut().
      // REASON: We want the user to stay logged in so App.tsx can show the "Verify Email" screen.
      
      onLogin(user.uid);
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Login failed.";
      
      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create User Document in Firestore (Best Practice)
      // This ensures the user exists in your DB even if they haven't verified yet
      try {
        await setDoc(doc(db, "userSettings", user.uid), {
            userName: email.split("@")[0],
            email: email,
            createdAt: new Date().toISOString(),
            notificationsEnabled: true,
            savingsGoal: 0,
            alertSettings: {
                budgetWarningEnabled: true,
                budgetWarningThreshold: 80,
                budgetExceededEnabled: true,
                largeTransactionEnabled: true,
                largeTransactionAmount: 500,
                weeklyReportEnabled: false,
                dismissedAlertIds: [],
            }
        });
      } catch (docError) {
          console.error("Error creating user settings doc:", docError);
          // We don't block the UI here, but logging it is important
      }

      // 3. Send verification email
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: false,
      });

      // 4. IMPORTANT: Do NOT sign out here either. 
      // Let them fall through to the "Restricted View" in App.tsx
      // where they can read the instruction to check their email.
      
      // Optional: You can still show an alert if you prefer
      alert("Account created! Please check your email to verify your account.");

      // No need to switch mode, App.tsx will detect the user and unmount LoginForm
      
    } catch (err: any) {
      console.error("Sign up error:", err);
      let errorMessage = "Sign up failed.";
      
      if (err.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use. Try logging in instead.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled. Please contact support.";
      }
      
      setError(errorMessage);
      setLoading(false); // Only stop loading if there was an error
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {isSignUp 
            ? "Sign up to start managing your finances" 
            : "Sign in to your SmartBudget account"}
        </p>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            {isSignUp && (
              <p className="text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Login")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={toggleMode}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {isSignUp 
              ? "Already have an account? Log in" 
              : "Need an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
}