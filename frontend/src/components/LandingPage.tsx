import { Button } from "../ui/button";
import { ArrowRight, CheckCircle2, BookOpen, PenTool, ShieldCheck, TrendingUp } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenPrivacy: () => void; // New Prop
  onOpenTerms: () => void;   // New Prop
}

export function LandingPage({ onGetStarted, onSignIn, onOpenPrivacy, onOpenTerms }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 font-sans text-slate-900">
      {/* ... (Keep existing Navigation, Hero, Features, How It Works, CTA sections EXACTLY as they were) ... */}
      
      {/* ... Navigation ... */}
      <nav className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                  SmartBudget
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </button>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                How It Works
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onSignIn} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium">
                Sign In
              </Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-6" style={{ backgroundColor: "#2563EB", color: "white" }}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* ... Hero Section (Keep existing) ... */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
             {/* (No changes to Hero content) */}
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                  <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                    Take manual control of your wealth.
                  </h1>
                  <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Build better money habits through intentional tracking. No bank connections, no automated imports. Just you, your goals, and complete control.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <Button size="lg" onClick={onGetStarted} className="h-12 px-8 text-lg font-semibold shadow-lg hover:-translate-y-0.5 transition-transform" style={{ backgroundColor: "#2563EB", color: "white" }}>
                      Start Tracking for Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={onSignIn} className="h-12 px-8 text-lg font-semibold bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                      Sign In
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /><span>Private & Secure</span></div>
                    <div className="hidden sm:block text-gray-300">•</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span>Completely Free</span></div>
                    <div className="hidden sm:block text-gray-300">•</div>
                    <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-600" /><span>Start in 2 Minutes</span></div>
                  </div>
                </div>
             </div>
             {/* (Background blobs) */}
             <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-3xl opacity-60 -translate-y-1/4 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl opacity-60 translate-y-1/4 -translate-x-1/4"></div>
             </div>
        </section>

        {/* ... Features Section (Keep existing) ... */}
        <section id="features" className="py-20 bg-white border-t border-gray-100">
           {/* (No changes to Features content) */}
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold text-blue-600 tracking-wide uppercase mb-3">Why SmartBudget?</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Build wealth through intentional action</h3>
              <p className="text-lg text-gray-600 leading-relaxed">We don't connect to your bank. We connect to your habits.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-6"><PenTool className="h-6 w-6" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Manual Entry</h4>
                  <p className="text-gray-600 leading-relaxed">Typing out expenses forces you to feel every purchase. It's psychology, not just math. Build mindful spending habits.</p>
                </div>
              </div>
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600 mb-6"><ShieldCheck className="h-6 w-6" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Savings First</h4>
                  <p className="text-gray-600 leading-relaxed">Prioritize savings goals before budgeting for expenses. Pay yourself first and watch your wealth grow automatically.</p>
                </div>
              </div>
              <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600 mb-6"><BookOpen className="h-6 w-6" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Knowledge Hub</h4>
                  <p className="text-gray-600 leading-relaxed">Daily tips and a curated library of articles to increase your financial IQ. Learn while you earn.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ... How It Works Section (Keep existing) ... */}
        <section id="how-it-works" className="py-20 bg-gray-50">
           {/* (No changes to How It Works content) */}
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-blue-600 tracking-wide uppercase mb-3">How It Works</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Get started in 3 simple steps</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>
              <div className="relative text-center pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-6 z-10">1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Create Your Account</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Sign up in seconds. No credit card required.</p>
              </div>
              <div className="relative text-center pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-6 z-10">2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Set Your Goals</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Define your savings targets and budgets.</p>
              </div>
              <div className="relative text-center pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-blue-100 text-blue-600 text-2xl font-bold shadow-sm mb-6 z-10">3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Track & Grow</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Log expenses daily and build wealth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ... CTA Section (Keep existing) ... */}
        <section className="py-20" style={{ backgroundColor: "#2563EB" }}>
           {/* (No changes to CTA content) */}
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">Ready to take control?</h2>
            <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of intentional spenders building better money habits today.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button size="lg" onClick={onGetStarted} className="bg-white text-blue-600 hover:bg-blue-50 text-lg font-semibold shadow-xl border-none px-10 py-6 h-auto">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* --- UPDATED FOOTER --- */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <span className="text-2xl font-bold text-white tracking-tight mb-4">SmartBudget</span>
            <p className="text-gray-500 text-center max-w-md leading-relaxed mb-6">
              Built for intentional spenders who want to take manual control of their financial future.
            </p>
            
            {/* New Links Section */}
            <div className="flex items-center gap-6 mb-8 text-sm font-medium">
              <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={onOpenTerms} className="hover:text-white transition-colors">Terms of Service</button>
            </div>

            <p className="text-gray-600 text-xs">
              &copy; {new Date().getFullYear()} SmartBudget. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}