// frontend/src/components/EmailVerification.tsx
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { sendEmailVerification, reload } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface EmailVerificationProps {
  onVerified?: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const user = auth.currentUser;

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Check if email is verified on mount
  useEffect(() => {
    if (user?.emailVerified && onVerified) {
      onVerified();
    }
  }, [user?.emailVerified, onVerified]);

  const handleSendVerification = async () => {
    if (!user) {
      setError("No user logged in");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: false,
      });

      setEmailSent(true);
      setSuccess("Verification email sent! Please check your inbox.");
      setCooldown(60);
    } catch (err: any) {
      console.error("Error sending verification email:", err);
      
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes before trying again.");
        setCooldown(120);
      } else {
        setError(err.message || "Failed to send verification email");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    setChecking(true);
    setError("");
    setSuccess("");

    try {
      await reload(user);
      
      if (user.emailVerified) {
        setSuccess("Email verified successfully! You can now access all features.");
        if (onVerified) {
          setTimeout(() => onVerified(), 1500);
        }
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err: any) {
      console.error("Error checking verification:", err);
      setError("Failed to check verification status");
    } finally {
      setChecking(false);
    }
  };

  if (!user) {
    return null;
  }

  if (user.emailVerified) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Email Verified</AlertTitle>
        <AlertDescription className="text-green-800">
          Your email has been verified. You have full access to FortisBudget.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-amber-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-amber-600" />
          <CardTitle>Verify Your Email</CardTitle>
        </div>
        <CardDescription>
          Please verify your email address to access all features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-amber-800 mt-2">
            A verification link will be sent to this address. Click the link to verify your account.
          </p>
        </div>

        {error && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-900">Error</AlertTitle>
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Success</AlertTitle>
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSendVerification}
            disabled={loading || cooldown > 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : emailSent ? (
              "Resend Verification Email"
            ) : (
              "Send Verification Email"
            )}
          </Button>

          {emailSent && (
            <Button
              onClick={handleCheckVerification}
              disabled={checking}
              variant="outline"
              className="flex-1"
            >
              {checking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Check your spam/junk folder if you don't see the email</li>
            <li>The verification link expires after 1 hour</li>
            <li>You can resend the email if it doesn't arrive</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}