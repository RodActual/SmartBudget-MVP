import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              We only ask for personal information when we truly need it to provide a service to you. 
              We collect it by fair and lawful means, with your knowledge and consent. 
              Currently, we collect your email address for account authentication purposes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data Usage</h2>
            <p>
              We use your data to provide the expense tracking and budgeting features of SmartBudget. 
              Your financial data is stored securely in our database and is only accessible by you. 
              We do not sell or share your personal data with third-party advertisers.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Security</h2>
            <p>
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. 
              We utilize industry-standard encryption and authentication services provided by Google Firebase.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. 
              We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us support@smartbudget.app.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}