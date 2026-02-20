import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { FortisLogo } from "./FortisLogo";

interface PrivacyPolicyProps {
  onBack: () => void;
}

const sections = [
  {
    title: "1. Information We Collect",
    body:  "We only ask for personal information when we truly need it to provide a secure budgeting service to you. We collect it by fair and lawful means, with your knowledge and consent. Currently, we collect your email address for account authentication and security purposes.",
  },
  {
    title: "2. Data Usage",
    body:  "We use your data to provide the expense tracking and budgeting features of FortisBudget. Your financial data is stored securely in our database and is only accessible by you. We do not sell or share your personal data with third-party advertisers or data brokers.",
  },
  {
    title: "3. Security",
    body:  "Financial strength requires a secure foundation. We utilize industry-standard encryption and authentication services provided by Google Firebase to protect your Personal Information. While we strive to use commercially acceptable means of protection, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "4. Changes to This Policy",
    body:  "We may update our Privacy Policy from time to time to reflect changes in our service or security protocols. We advise you to review this page periodically. Changes are effective immediately upon being posted to this page.",
  },
  {
    title: "5. Contact Us",
    body:  "If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact our support team.",
    email: "support@fortisbudget.com",
  },
];

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--surface)", color: "var(--text-primary)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="w-full border-b sticky top-0 z-50"
        style={{
          backgroundColor: "var(--engine-navy)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 font-bold text-sm pl-0 hover:bg-transparent"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <FortisLogo className="h-8 w-auto" />
        </div>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-xs font-mono mb-10" style={{ color: "var(--text-muted)" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8">
          {sections.map(({ title, body, email }) => (
            <section key={title}>
              <h2
                className="text-base font-bold uppercase tracking-widest mb-3 pb-2 border-b"
                style={{ color: "var(--castle-red)", borderColor: "var(--border-subtle)" }}
              >
                {title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--fortress-steel)" }}>
                {body}
                {email && (
                  <>
                    {" "}
                    <a
                      href={`mailto:${email}`}
                      className="font-bold underline"
                      style={{ color: "var(--castle-red)" }}
                    >
                      {email}
                    </a>
                  </>
                )}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}