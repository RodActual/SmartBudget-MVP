import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface LoginFormProps {
  onLogin: () => void;
  initialIsSignUp?: boolean; 
}

export function LoginForm({ onLogin, initialIsSignUp = false }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
  }, [initialIsSignUp]);

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
        // Sign Up Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "userSettings", user.uid), {
          userName: email.split("@")[0],
          savingsGoal: 0,
          isSetupComplete: false, // <--- NEW FLAG
          notificationsEnabled: true,
          alertSettings: {
            budgetWarningEnabled: true,
            budgetWarningThreshold: 80,
            budgetExceededEnabled: true,
            largeTransactionEnabled: true,
            largeTransactionAmount: 500,
            weeklyReportEnabled: false,
            dismissedAlertIds: [],
          },
          updatedAt: new Date().toISOString(),
        });

        await sendEmailVerification(user);

        setSuccessMessage("Account created! Please check your email to verify your account.");
      } else {
        // Sign In Logic
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed";
      if (err.code === "auth/email-already-in-use") msg = "Email already in use";
      if (err.code === "auth/invalid-email") msg = "Invalid email address";
      if (err.code === "auth/weak-password") msg = "Password should be at least 6 characters";
      if (err.code === "auth/wrong-password") msg = "Invalid password";
      if (err.code === "auth/user-not-found") msg = "User not found";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "userSettings", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          userName: user.displayName || user.email?.split("@")[0] || "User",
          savingsGoal: 0,
          isSetupComplete: false, // <--- NEW FLAG
          notificationsEnabled: true,
          alertSettings: {
            budgetWarningEnabled: true,
            budgetWarningThreshold: 80,
            budgetExceededEnabled: true,
            largeTransactionEnabled: true,
            largeTransactionAmount: 500,
            weeklyReportEnabled: false,
            dismissedAlertIds: [],
          },
          updatedAt: new Date().toISOString(),
        });
      }
      onLogin();
    } catch (err: any) {
      setError("Google Sign In failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Enter your email below to create your account" : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignUp ? "signup" : "login"} onValueChange={(val) => setIsSignUp(val === "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleAuth}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800" 
                  style={{ color: "white" }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
                </Button>
              </div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
        </CardFooter>
      </Card>
    </div>
  );
}