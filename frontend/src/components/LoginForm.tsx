import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from '../assets/smartbudget-logo.png';

interface LoginFormProps {
  onLogin: (uid: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // NEW STATE: Track the mode (true for Sign Up, false for Login)
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      onLogin(uid); // pass UID to App
    } catch (err: any) {
      // Display a friendlier error message
      let errorMessage = "Login failed.";
      if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password.";
      }
      setError(errorMessage);
    }
  };

  const handleSignUp = async () => {
    try {
      setError("");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      // Automatically log the user in after successful creation
      onLogin(uid); 
    } catch (err: any) {
      let errorMessage = "Sign up failed.";
      if (err.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use. Try logging in.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      setError(errorMessage);
    }
  };
  
  const handleSubmit = isSignUp ? handleSignUp : handleLogin;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <div className="flex justify-center mb-6">
        <img src={logo} alt="SmartBudget Logo" className="h-11 w-auto" />
      </div>

      <h2 className="text-2xl mb-4 text-center">{isSignUp ? "Create Account" : "Login"}</h2>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="mb-4">
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      {/* Primary Action Button (Login or Sign Up) */}
      <Button onClick={handleSubmit} className="w-full mb-3">
        {isSignUp ? "Sign Up" : "Login"}
      </Button>
      
      {/* Secondary Action: Toggle Mode */}
      <div className="text-center">
        <Button 
          variant="link" 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setPassword(""); // Clear password field on mode switch
          }}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {isSignUp 
            ? "Already have an account? Log in" 
            : "Need an account? Sign up"}
        </Button>
      </div>
    </div>
  );
}