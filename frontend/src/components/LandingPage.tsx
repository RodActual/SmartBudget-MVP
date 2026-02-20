import { Button } from "../ui/button";
import {
  ArrowRight, CheckCircle2, PenTool, ShieldCheck, TrendingUp, Lock,
  Bell, Lightbulb, Coffee, ShoppingCart, ServerOff, AlertTriangle,
  Activity, SmartphoneIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { FortisLogo } from "./FortisLogo";
import { FORTIS_VERSION, GIT_HASH, LAST_DEPLOYED } from "../version";

// ── Mock widgets ──────────────────────────────────────────────────────────────

function MockAlertCard() {
  return (
    <Card
      className="w-full max-w-sm mx-auto shadow-xl p-5 transform transition-all hover:scale-[1.02]"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
    >
      <div
        className="flex items-center gap-3 mb-4 border-b pb-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="p-2 rounded-lg" style={{ backgroundColor: "#FEE2E2" }}>
          <Bell className="h-5 w-5" style={{ color: "var(--castle-red)" }} />
        </div>
        <span className="font-bold" style={{ color: "var(--text-primary)" }}>Active Alerts (2)</span>
      </div>
      <div className="space-y-3">
        <div className="p-3 rounded-lg flex gap-3 items-start border" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--safety-amber)" }} />
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Budget Warning</p>
            <p className="text-xs mt-1" style={{ color: "var(--fortress-steel)" }}>
              Dining Out is at <span className="font-bold" style={{ color: "var(--safety-amber)" }}>85%</span> of your $500 limit.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-lg flex gap-3 items-start border" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
          <Activity className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Large Transaction</p>
            <p className="text-xs mt-1" style={{ color: "var(--fortress-steel)" }}>
              An expense of <span className="font-bold text-blue-700">$1,200</span> was just logged.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MockTransactionList() {
  return (
    <Card
      className="w-full max-w-sm mx-auto shadow-xl transform transition-all hover:scale-[1.02]"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
    >
      <CardHeader
        className="pb-3 border-b"
        style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
      >
        <CardTitle
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--fortress-steel)" }}
        >
          Recent Activity
        </CardTitle>
      </CardHeader>
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {[
          { icon: Coffee,       bg: "#FFF7ED", color: "#EA580C", label: "Morning Coffee", sub: "Today, 8:30 AM", amount: "−$4.50",     ac: "var(--castle-red)" },
          { icon: ShoppingCart, bg: "#EFF6FF", color: "#2563EB", label: "Groceries",      sub: "Yesterday",    amount: "−$82.15",    ac: "var(--castle-red)" },
          { icon: TrendingUp,   bg: "#F0FDF4", color: "#16A34A", label: "Paycheck",       sub: "Friday",       amount: "+$2,400.00", ac: "var(--field-green)" },
        ].map(({ icon: Icon, bg, color, label, sub, amount, ac }) => (
          <div
            key={label}
            className="flex items-center justify-between p-4 transition-colors"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-raised)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: bg }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
              </div>
            </div>
            <span className="font-bold font-mono text-sm" style={{ color: ac }}>{amount}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MockDailyInsight() {
  return (
    <div className="w-full max-w-md mx-auto transform transition-all hover:scale-[1.02]">
      <div
        className="p-8 rounded-2xl shadow-lg border"
        style={{
          background: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)",
          borderColor: "#BFDBFE",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm mt-1">
            <Lightbulb className="h-6 w-6" style={{ color: "var(--engine-navy)" }} />
          </div>
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--engine-navy)" }}
            >
              Daily Wisdom
            </h4>
            <p className="text-base leading-relaxed font-medium" style={{ color: "var(--engine-navy)" }}>
              The 24-Hour Rule: Wait one full day before making any non-essential purchase over $50. Impulse buys are the enemy of wealth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockSecurityCard() {
  return (
    <Card
      className="w-full max-w-sm mx-auto shadow-xl p-6 transform transition-all hover:scale-[1.02]"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-full" style={{ backgroundColor: "#DCFCE7" }}>
          <ShieldCheck className="h-6 w-6" style={{ color: "var(--field-green)" }} />
        </div>
        <div>
          <h4 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Privacy Shield</h4>
          <p className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--field-green)" }}>
            <CheckCircle2 className="h-3 w-3" /> Active & Monitoring
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { icon: ServerOff, label: "Bank Connections", badge: "NONE",      badgeBg: "var(--surface-raised)", badgeColor: "var(--fortress-steel)" },
          { icon: Lock,      label: "Data Storage",    badge: "ENCRYPTED",  badgeBg: "#DBEAFE",               badgeColor: "#1E40AF" },
        ].map(({ icon: Icon, label, badge, badgeBg, badgeColor }) => (
          <div
            key={label}
            className="flex justify-between items-center p-3 rounded-lg border"
            style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
          >
            <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--fortress-steel)" }}>
              <Icon className="h-4 w-4 opacity-50" />
              {label}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide"
              style={{ backgroundColor: badgeBg, color: badgeColor }}
            >
              {badge}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function LandingPage({ onGetStarted, onSignIn, onOpenPrivacy, onOpenTerms }: LandingPageProps) {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--surface)", color: "var(--text-primary)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="w-full border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{
          backgroundColor: "var(--engine-navy)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <FortisLogo className="h-10 w-auto sm:h-12" />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline" style={{ color: "rgba(255,255,255,0.6)" }}>
                Returning User?
              </span>
              <Button
                variant="outline"
                onClick={onSignIn}
                className="font-bold text-sm"
                style={{
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 flex justify-center">
              <div style={{ height: "80px" }}>
                <FortisLogo className="h-full w-auto animate-in fade-in zoom-in duration-700" />
              </div>
            </div>

            <p className="text-xl leading-relaxed max-w-2xl mx-auto mt-4" style={{ color: "var(--fortress-steel)" }}>
              Build better money habits through intentional tracking. No bank connections, no automated imports. Just you, your goals, and complete control.
            </p>

            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="h-12 px-8 text-lg font-bold text-white hover:-translate-y-0.5 transition-transform"
                style={{
                  backgroundColor: "var(--castle-red)",
                  border: "none",
                  boxShadow: "0 4px 0 0 var(--castle-red-dark)",
                }}
              >
                Start Tracking for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              By signing up you agree to our{" "}
              <button onClick={onOpenTerms} className="underline font-medium" style={{ color: "var(--castle-red)" }}>
                Terms of Service
              </button>{" "}
              and{" "}
              <button onClick={onOpenPrivacy} className="underline font-medium" style={{ color: "var(--castle-red)" }}>
                Privacy Policy
              </button>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium pt-8" style={{ color: "var(--fortress-steel)" }}>
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" style={{ color: "var(--field-green)" }} /><span>Private & Secure</span></div>
              <div className="hidden sm:block opacity-30">•</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" style={{ color: "var(--engine-navy)" }} /><span>Completely Free</span></div>
              <div className="hidden sm:block opacity-30">•</div>
              <div className="flex items-center gap-2"><SmartphoneIcon className="w-5 h-5" style={{ color: "var(--castle-red)" }} /><span>Mobile Friendly</span></div>
            </div>
          </div>
        </section>

        {/* ── Features grid ───────────────────────────────────────────────────── */}
        <section
          id="features"
          className="py-20 border-t"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2
                className="text-2xl font-bold uppercase tracking-widest"
                style={{ color: "var(--text-primary)" }}
              >
                Why FortisBudget?
              </h2>
              <p className="mt-3 text-lg" style={{ color: "var(--fortress-steel)" }}>
                Most apps track your spending. We change your behavior.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: PenTool,     bg: "#DBEAFE", color: "#2563EB", title: "Intentional Friction",  body: "Manual entry forces you to \"feel\" every transaction." },
                { icon: Lock,        bg: "#DCFCE7", color: "#16A34A", title: "Zero-Link Security",    body: "No bank passwords required. Your data stays local and safe." },
                { icon: Bell,        bg: "#FEE2E2", color: "#DC2626", title: "Smart Alerts",          body: "Proactive warnings before you overspend, not after." },
              ].map(({ icon: Icon, bg, color, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-8 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6" style={{ backgroundColor: bg }}>
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>
                    <h4 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{title}</h4>
                    <p style={{ color: "var(--fortress-steel)" }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Spotlight sections ──────────────────────────────────────────────── */}
        {[
          {
            title:   "Stop forgetting what you spend.",
            body:    "Automated apps are designed to be ignored. When you manually log a transaction, you create a psychological connection to your money.\n\nIt takes 5 seconds, but the awareness lasts all day.",
            badge:   "Builds mindful habits instantly",
            badgeColor: "var(--engine-navy)",
            widget:  <MockTransactionList />,
            reverse: false,
          },
          {
            title:   "Sovereign Security.",
            body:    "We don't want your bank credentials, and you shouldn't give them to anyone.\n\nBy removing the bank connection, we eliminate the risk of a third-party breach.",
            badge:   "Zero-Link Technology",
            badgeColor: "var(--field-green)",
            widget:  <MockSecurityCard />,
            reverse: false,
          },
          {
            title:   "Proactive defense for your wallet.",
            body:    "Most apps tell you after you've blown your budget. FortisBudget warns you before it happens.\n\nSet configurable thresholds (50–95%) and catch large transactions instantly.",
            badge:   "Customizable warning triggers",
            badgeColor: "var(--fortress-steel)",
            widget:  <MockAlertCard />,
            reverse: false,
          },
          {
            title:   "Financial literacy built-in.",
            body:    "Budgeting is a skill, not just a task. Receive daily actionable insights and access our library of guides to master your money.",
            badge:   "Daily tips & strategies",
            badgeColor: "#6366F1",
            widget:  <MockDailyInsight />,
            reverse: true,
          },
        ].map(({ title, body, badge, badgeColor, widget, reverse }) => (
          <section key={title} className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16`}>
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {title}
                  </h3>
                  {body.split("\n\n").map((para, i) => (
                    <p key={i} className="text-lg leading-relaxed" style={{ color: "var(--fortress-steel)" }}>{para}</p>
                  ))}
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: badgeColor }} />
                    <span style={{ color: badgeColor }}>{badge}</span>
                  </div>
                </div>
                <div className="lg:w-1/2 w-full">{widget}</div>
              </div>
            </div>
          </section>
        ))}

        {/* ── How It Works ────────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-20 border-t"
          style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold uppercase tracking-widest" style={{ color: "var(--fortress-steel)" }}>
                How It Works
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold mt-4" style={{ color: "var(--text-primary)" }}>
                Get started in 3 simple steps
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px" style={{ backgroundColor: "var(--border)" }} />
              {[
                { n: "1", title: "Create Your Account", body: "Sign up in seconds. No credit card required." },
                { n: "2", title: "Set Your Goals",      body: "Define your savings targets and budgets." },
                { n: "3", title: "Track & Grow",        body: "Log expenses daily and build wealth." },
              ].map(({ n, title, body }) => (
                <div key={n} className="relative text-center pt-4">
                  <div
                    className="w-10 h-10 rounded-full font-bold text-white flex items-center justify-center mx-auto mb-4 text-lg"
                    style={{ backgroundColor: "var(--castle-red)" }}
                  >
                    {n}
                  </div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{title}</h4>
                  <p style={{ color: "var(--fortress-steel)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <section
          className="py-24"
          style={{ backgroundColor: "var(--engine-navy)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
              Ready to take control?
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
              Join thousands of intentional spenders building better money habits today.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-white font-bold text-lg px-10 py-6 h-auto hover:-translate-y-0.5 transition-transform"
              style={{
                backgroundColor: "var(--castle-red)",
                border: "none",
                boxShadow: "0 4px 0 0 var(--castle-red-dark)",
              }}
            >
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-xs mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              By getting started, you agree to our{" "}
              <button onClick={onOpenTerms} className="underline" style={{ color: "rgba(255,255,255,0.6)" }}>Terms of Service</button>
              {" "}and{" "}
              <button onClick={onOpenPrivacy} className="underline" style={{ color: "rgba(255,255,255,0.6)" }}>Privacy Policy</button>
            </p>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer className="py-12 border-t" style={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
            <FortisLogo className="h-12 w-auto sm:h-16" />
            <p className="text-center max-w-md leading-relaxed text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Built for intentional spenders who want to take manual control of their financial future.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition-colors hover:text-white"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                onClick={e => { e.preventDefault(); onOpenTerms(); }}
                className="transition-colors hover:text-white"
              >
                Terms of Service
              </a>
            </div>

            <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
              &copy; {new Date().getFullYear()} FortisBudget. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center w-full mt-8 pb-4 opacity-30">
            <p className="text-[10px] font-mono uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
              FORTIS_v{FORTIS_VERSION} // {GIT_HASH} // {LAST_DEPLOYED}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}