import { Button } from "../ui/button";
import { ArrowRight, CheckCircle2, BookOpen, PenTool, ShieldCheck, TrendingUp } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 font-sans text-slate-900">
      {/* Navigation - Standard height h-16 (64px) */}
      <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                SmartBudget
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </button>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                How It Works
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={onSignIn}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-4"
                style={{ backgroundColor: "#2563EB", color: "white" }} 
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Moderate padding (py-16 = 64px) */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">

              <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                Take manual control of your wealth.
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                Build better money habits through intentional tracking. 
                No bank connections, no automated imports. Just you, your goals, and complete control.
              </p>

              {/* CTA Buttons - Standard gap */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="h-12 px-8 text-base font-semibold shadow-md hover:-translate-y-0.5 transition-transform"
                  style={{ backgroundColor: "#2563EB", color: "white" }}
                >
                  Start Tracking for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={onSignIn}
                  className="h-12 px-8 text-base font-semibold bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </div>

              {/* Trust Indicators - Tighter spacing */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Private & Secure</span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Completely Free</span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                  <span>Start in 2 Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Standard padding (py-16 = 64px) */}
        <section id="features" className="bg-white border-t border-gray-100 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold text-blue-600 tracking-wide uppercase mb-2">
                Why SmartBudget?
              </h2>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                Build wealth through intentional action
              </h3>
              <p className="text-base text-gray-600">
                We don't connect to your bank. We connect to your habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-4">
                  <PenTool className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Manual Entry</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Typing out expenses forces you to feel every purchase. It's psychology, not just math.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Savings First</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Prioritize savings goals before budgeting for expenses. Pay yourself first.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Knowledge Hub</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Daily tips and a curated library of articles to increase your financial IQ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Standard padding */}
        <section id="how-it-works" className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm font-bold text-blue-600 tracking-wide uppercase mb-2">
                How It Works
              </h2>
              <h3 className="text-3xl font-extrabold text-gray-900">
                Get started in 3 simple steps
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

              <div className="relative text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-4 z-10">1</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Create Account</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Sign up in seconds. No credit card required.</p>
              </div>

              <div className="relative text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-4 z-10">2</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Set Your Goals</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Define your savings targets and budgets.</p>
              </div>

              <div className="relative text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-4 z-10">3</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Track & Grow</h4>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">Log expenses daily and build wealth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Moderate padding */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-6 leading-tight">
              Ready to take control?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of intentional spenders building better money habits today.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-blue-600 text-white hover:bg-blue-700 text-base font-bold shadow-lg border-none px-8 py-3 h-auto"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <span className="text-xl font-bold text-white tracking-tight mb-4">SmartBudget</span>
            <p className="text-gray-500 text-center max-w-md text-sm mb-6">
              Built for intentional spenders who want to take manual control of their financial future.
            </p>
            <p className="text-gray-600 text-xs">
              &copy; {new Date().getFullYear()} SmartBudget. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}