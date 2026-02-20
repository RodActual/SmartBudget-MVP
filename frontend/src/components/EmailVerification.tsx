import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { sendEmailVerification, reload, applyActionCode } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

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
  const [linkVerified, setLinkVerified] = useState(false);

  const user = auth.currentUser;

  // ── 1. Handle incoming verification link (oobCode) ──────────────────────
  useEffect(() => {
    const processVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const oobCode = params.get("oobCode");
      const mode = params.get("mode");

      if (oobCode && mode === "verifyEmail") {
        setChecking(true);
        try {
          await applyActionCode(auth, oobCode);
          setLinkVerified(true);
          setSuccess("Email verified successfully!");
          
          if (user) await reload(user);
          
          // Notify parent app if callback exists
          if (onVerified) onVerified();
          
          // Clean up URL without refreshing
          window.history.replaceState({}, document.title, window.location.pathname);
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
    if (user?.emailVerified && !linkVerified && onVerified) onVerified();
  }, [user?.emailVerified, linkVerified, onVerified]);

  const handleSendVerification = async () => {
    if (!user) { setError("No user logged in"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
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

  // ── 3. Render: Success State (Link Processed) ──────────────────────────
  // This shows on the FortisBudget.com/verify page specifically
  if (linkVerified) {
    return (
      <Card className="border-2 shadow-xl p-2" style={{ borderColor: "var(--field-green)", backgroundColor: "var(--surface)" }}>
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center space-y-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-12 w-12" style={{ color: "var(--field-green)" }} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Verification Successful
            </CardTitle>
            <CardDescription className="text-base" style={{ color: "var(--fortress-steel)" }}>
              Your email has been confirmed. You can now close this window and return to your original tab to continue.
            </CardDescription>
          </div>
          <Button 
            className="w-full font-bold text-white shadow-md"
            onClick={() => window.location.href = "/"}
            style={{ backgroundColor: "var(--engine-navy)" }}
          >
            Or, Continue Here
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no user and we aren't currently processing a link, we can't show the re-send UI
  if (!user && !checking) return null;

  // ── 4. Render: Already Verified Banner ────────────────────────────────
  if (user?.emailVerified) {
    return (
      <div className="space-y-4 w-full max-w-md mx-auto">
        <Alert
          className="border rounded-md"
          style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}
        >
          <CheckCircle className="h-4 w-4" style={{ color: "var(--field-green)" }} />
          <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#14532D" }}>
            Email Verified
          </AlertTitle>
          <AlertDescription className="text-xs" style={{ color: "#14532D" }}>
            Your email has been verified. You now have full access to FortisBudget.
          </AlertDescription>
        </Alert>
        <Button 
          className="w-full font-bold text-white shadow-md"
          onClick={() => window.location.href = "/"}
          style={{ backgroundColor: "var(--engine-navy)" }}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ── 5. Render: Verification Pending UI ────────────────────────────────
  return (
    <Card
      className="border-2 shadow-lg"
      style={{ borderColor: "var(--safety-amber)", backgroundColor: "var(--surface)" }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" style={{ color: "var(--safety-amber)" }} />
          <CardTitle
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: "var(--text-primary)" }}
          >
            {checking ? "Processing Code..." : "Verify Your Email"}
          </CardTitle>
        </div>
        <CardDescription style={{ color: "var(--fortress-steel)" }}>
          {checking ? "Validating your credentials with Firebase..." : "Please verify your email address to access all features"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!checking && user && (
          <div className="rounded-md p-4 border" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
            <p className="text-sm font-semibold" style={{ color: "#78350F" }}>
              Email: <span className="font-mono">{user.email}</span>
            </p>
          </div>
        )}

        {error && (
          <Alert className="border rounded-md" style={{ backgroundColor: "#FEF2F2", borderColor: "var(--castle-red)" }}>
            <AlertCircle className="h-4 w-4" style={{ color: "var(--castle-red)" }} />
            <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#7F1D1D" }}>Error</AlertTitle>
            <AlertDescription className="text-xs" style={{ color: "#7F1D1D" }}>{error}</AlertDescription>
          </Alert>
        )}

        {success && !linkVerified && (
          <Alert className="border rounded-md" style={{ backgroundColor: "#F0FDF4", borderColor: "var(--field-green)" }}>
            <CheckCircle className="h-4 w-4" style={{ color: "var(--field-green)" }} />
            <AlertTitle className="font-bold text-xs uppercase tracking-wide" style={{ color: "#14532D" }}>Success</AlertTitle>
            <AlertDescription className="text-xs" style={{ color: "#14532D" }}>{success}</AlertDescription>
          </Alert>
        )}

        {!checking && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSendVerification}
              disabled={loading || cooldown > 0}
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

            {emailSent && (
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
        )}
      </CardContent>
    </Card>
  );
}
