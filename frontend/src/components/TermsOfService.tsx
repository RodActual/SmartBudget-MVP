import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { FortisLogo } from "./FortisLogo";

interface TermsOfServiceProps {
  onBack: () => void;
}

const sections = [
  {
    title: "1. Terms",
    body: "By accessing the website at fortisbudget.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.",
  },
  {
    title: "2. Use License",
    body: "Permission is granted to temporarily use the FortisBudget software for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials for commercial purposes.",
  },
  {
    title: "3. Disclaimer",
    body: "The materials on FortisBudget's website are provided on an 'as is' basis. FortisBudget makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular financial purpose.",
  },
  {
    title: "4. Limitations",
    body: "In no event shall FortisBudget or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FortisBudget's website.",
  },
  {
    title: "5. Financial Advice",
    body: "FortisBudget is a tool for tracking and visualization. It does not provide professional financial, investment, or legal advice. Users are encouraged to consult with certified professionals regarding their specific financial situations.",
  },
  {
    title: "6. Accuracy of Materials",
    body: "The materials appearing on FortisBudget's website could include technical, typographical, or photographic errors. FortisBudget does not warrant that any of the materials on its website are accurate, complete or current.",
  },
];

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          Terms of Service
        </h1>
        <p className="text-xs font-mono mb-10" style={{ color: "var(--text-muted)" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8">
          {sections.map(({ title, body }) => (
            <section key={title}>
              <h2
                className="text-base font-bold uppercase tracking-widest mb-3 pb-2 border-b"
                style={{ color: "var(--castle-red)", borderColor: "var(--border-subtle)" }}
              >
                {title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--fortress-steel)" }}>
                {body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}