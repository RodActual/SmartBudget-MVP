import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 pl-0 hover:bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Terms</h2>
            <p>
              By accessing the website at SmartBudget, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on SmartBudget's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Disclaimer</h2>
            <p>
              The materials on SmartBudget's website are provided on an 'as is' basis. SmartBudget makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitations</h2>
            <p>
              In no event shall SmartBudget or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SmartBudget's website.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on SmartBudget's website could include technical, typographical, or photographic errors. SmartBudget does not warrant that any of the materials on its website are accurate, complete or current.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}