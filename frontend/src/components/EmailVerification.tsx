import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { sendEmailVerification, reload, applyActionCode } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface EmailVerificationProps {
  onVerified?: () => void;
}

export function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [emailSent, setEmailSent]   = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  const user = auth.currentUser;

  // ── 1. Handle incoming verification link (oobCode) ──────────────────────
  useEffect(() => {
    const processVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get("oobCode");
      const mode = params.get("mode");

      // If we have a code and we're in verify mode, apply it
      if (oobCode && mode === "verifyEmail") {
        setChecking(true);
        try {
          await applyActionCode(auth, oobCode);
          setSuccess("Email verified successfully! Redirecting...");
          
          // Force a reload of the user object to update emailVerified status
          if (user) await reload(user);
          
          // Clean up the URL and notify the app
          setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (onVerified) onVerified();
          }, 2000);
        } catch (err: any) {
          setError("The verification link is invalid or has expired.");
        } finally {
          setChecking(false);
        }
      }
    };

    processVerification();
  }, [user, onVerified]);

  // ── 2. Standard Cooldown & Logic ────────────────────────────────────────
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  useEffect(() => {
    if (user?.emailVerified && onVerified) onVerified();
  }, [user?.emailVerified, onVerified]);

  const handleSendVerification = async () => {
    if (!user) { setError("No user logged in"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      // url: window.location.origin + "/verify" ensures they land back here
      await sendEmailVerification(user, { 
        url: `${window.location.origin}/verify`, 
        handleCodeInApp: true 
      });
      setEmailSent(true);
      setSuccess("Verification email sent! Please check your inbox.");
      setCooldown(60);
    } catch (err: any) {
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
    setChecking(true); setError(""); setSuccess("");
    try {
      await reload(user);
      if (user.emailVerified) {
        setSuccess("Email verified successfully!");
        if (onVerified) setTimeout(() => onVerified(), 1500);
      } else {
        setError("Email not verified yet. Please check your inbox and click the link.");
      }
    } catch (err: any) {
      setError("Failed to check verification status");
    } finally {
      setChecking(false);
    }
  };

  if (!user) return null;

  if (user.emailVerified) {
    return (
      <Alert
        className="border rounded-md"
        style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}
      >
        <CheckCircle className="h-4 w-4" style={{ color: "var(--field-green)" }} />
        <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#14532D" }}>
          Email Verified
        </AlertTitle>
        <AlertDescription className="text-xs" style={{ color: "#14532D" }}>
          Your email has been verified. You have full access to FortisBudget.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card
      className="border-2"
      style={{ borderColor: "var(--safety-amber)", backgroundColor: "var(--surface)" }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" style={{ color: "var(--safety-amber)" }} />
          <CardTitle
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "var(--text-primary)" }}
          >
            {checking ? "Verifying..." : "Verify Your Email"}
          </CardTitle>
        </div>
        <CardDescription style={{ color: "var(--fortress-steel)" }}>
          {checking ? "Please wait while we confirm your code." : "Please verify your email address to access all features"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className="rounded-md p-4 border"
          style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#78350F" }}>
            Email: <span className="font-mono">{user.email}</span>
          </p>
        </div>

        {error && (
          <Alert
            className="border rounded-md"
            style={{ backgroundColor: "#FEF2F2", borderColor: "var(--castle-red)" }}
          >
            <AlertCircle className="h-4 w-4" style={{ color: "var(--castle-red)" }} />
            <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#7F1D1D" }}>Error</AlertTitle>
            <AlertDescription className="text-xs" style={{ color: "#7F1D1D" }}>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert
            className="border rounded-md"
            style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}
          >
            <CheckCircle className="h-4 w-4" style={{ color: "var(--field-green)" }} />
            <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#14532D" }}>Success</AlertTitle>
            <AlertDescription className="text-xs" style={{ color: "#14532D" }}>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSendVerification}
            disabled={loading || checking || cooldown > 0}
            className="flex-1 font-bold text-white"
            style={{
              backgroundColor: "var(--castle-red)",
              border: "none",
              boxShadow: "0 2px 0 0 var(--castle-red-dark)",
            }}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Send Verification Email"}
          </Button>

          {emailSent && !checking && (
            <Button
              onClick={handleCheckVerification}
              disabled={checking}
              variant="outline"
              className="flex-1 font-bold gap-2"
              style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
            >
              <CheckCircle className="h-4 w-4" /> I've Verified My Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
