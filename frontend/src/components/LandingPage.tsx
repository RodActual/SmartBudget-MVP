import { Button } from "../ui/button";
import { ArrowRight, CheckCircle2, BookOpen, PenTool, ShieldCheck, TrendingUp, Lock, Bell, Lightbulb, Coffee, ShoppingCart, ServerOff, AlertTriangle, Activity, PhoneIcon, SmartphoneIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

// --- MOCK COMPONENTS (Mini App Widgets) ---

// 1. Visual: Smart Alerts (NEW)
function MockAlertCard() {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl border-slate-200 bg-white p-5 transform transition-all hover:scale-[1.02]">
       <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
         <div className="p-2 bg-red-100 text-red-600 rounded-lg">
           <Bell className="h-5 w-5" />
         </div>
         <span className="font-bold text-gray-900">Active Alerts (2)</span>
       </div>
       <div className="space-y-3">
         {/* Alert 1 */}
         <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900">Budget Warning</p>
              <p className="text-xs text-gray-600 mt-1">Dining Out is at <span className="font-bold text-amber-700">85%</span> of your $500 limit.</p>
            </div>
         </div>
         {/* Alert 2 */}
         <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
            <Activity className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900">Large Transaction</p>
              <p className="text-xs text-gray-600 mt-1">An expense of <span className="font-bold text-blue-700">$1,200</span> was just logged.</p>
            </div>
         </div>
       </div>
    </Card>
  )
}

// 2. Visual: Recent Transactions
function MockTransactionList() {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl border-slate-200 bg-white transform transition-all hover:scale-[1.02]">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wide">Recent Activity</CardTitle>
      </CardHeader>
      <div className="divide-y divide-gray-100">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Coffee className="h-4 w-4" /></div>
            <div><p className="font-medium text-gray-900">Morning Coffee</p><p className="text-xs text-gray-500">Today, 8:30 AM</p></div>
          </div>
          <span className="font-bold text-gray-900">-$4.50</span>
        </div>
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingCart className="h-4 w-4" /></div>
            <div><p className="font-medium text-gray-900">Groceries</p><p className="text-xs text-gray-500">Yesterday</p></div>
          </div>
          <span className="font-bold text-gray-900">-$82.15</span>
        </div>
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp className="h-4 w-4" /></div>
            <div><p className="font-medium text-gray-900">Paycheck</p><p className="text-xs text-gray-500">Friday</p></div>
          </div>
          <span className="font-bold text-green-600">+$2,400.00</span>
        </div>
      </div>
    </Card>
  );
}

// 3. Visual: Daily Insight
function MockDailyInsight() {
  return (
    <div className="w-full max-w-md mx-auto transform transition-all hover:scale-[1.02]">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-2xl shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm text-blue-600 mt-1">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-2">Daily Wisdom</h4>
            <p className="text-blue-900 text-lg leading-relaxed font-medium">
              "The 24-Hour Rule: Wait one full day before making any non-essential purchase over $50. Impulse buys are the enemy of wealth."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Visual: Security Status
function MockSecurityCard() {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-xl border-slate-200 bg-white p-6 transform transition-all hover:scale-[1.02]">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-green-100 rounded-full">
           <ShieldCheck className="h-6 w-6 text-green-600" />
        </div>
        <div>
           <h4 className="font-bold text-gray-900 text-lg">Privacy Shield</h4>
           <p className="text-sm text-green-600 font-medium flex items-center gap-1">
             <CheckCircle2 className="h-3 w-3" /> Active & Monitoring
           </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
           <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
             <ServerOff className="h-4 w-4 text-gray-400" /> Bank Connections
           </span>
           <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">NONE</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
           <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
             <Lock className="h-4 w-4 text-gray-400" /> Data Storage
           </span>
           <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">ENCRYPTED</span>
        </div>
      </div>
    </Card>
  )
}

// --- MAIN PAGE ---

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function LandingPage({ onGetStarted, onSignIn, onOpenPrivacy, onOpenTerms }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 font-sans text-slate-900">
      
      {/* Navigation */}
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
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600 hidden sm:inline">Returning User?</span>
              <Button variant="outline" onClick={onSignIn} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-12" style={{ rowGap: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Take manual control of your wealth.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Build better money habits through intentional tracking. No bank connections, no automated imports. Just you, your goals, and complete control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full pt-4">
                <Button variant="outline" size="lg" onClick={onGetStarted} className="h-12 px-8 text-lg font-semibold shadow-lg hover:-translate-y-0.5 transition-transform">
                  Start Tracking for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 font-medium pt-8">
                <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /><span>Private & Secure</span></div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-600" /><span>Completely Free</span></div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="flex items-center gap-2"><SmartphoneIcon className="w-5 h-5 text-red-600" /><span>Mobile Friendly</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- GRID SECTION --- */}
        <section id="features" className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '1rem' }}>
              <h2 className="text-2xl mt-8 font-bold text-black-600 tracking-wide uppercase">Why SmartBudget?</h2>
              <p className="text-lg text-gray-600 leading-relaxed">Most apps track your spending. We change your behavior.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-6"><PenTool className="h-8 w-8" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Intentional Friction</h4>
                  <p className="text-gray-600 leading-relaxed">Manual entry forces you to "feel" every transaction.</p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600 mb-6"><Lock className="h-8 w-8" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Zero-Link Security</h4>
                  <p className="text-gray-600 leading-relaxed">No bank passwords required. Your data stays local and safe.</p>
                </div>
              </div>
              {/* Feature 3: Smart Alerts (Replaced Growth) */}
              <div className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-600 mb-6"><Bell className="h-8 w-8" /></div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Smart Alerts</h4>
                  <p className="text-gray-600 leading-relaxed">Proactive warnings before you overspend, not after.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SPOTLIGHT 1: MANUAL ENTRY --- */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl mt-8 md:text-4xl font-extrabold text-gray-900 leading-tight">
                  Stop forgetting what you spend.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Automated apps are designed to be ignored. When you manually log a transaction, you create a psychological connection to your money. 
                  <br /><br />
                  It takes 5 seconds, but the awareness lasts all day.
                </p>
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Builds mindful habits instantly</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <MockTransactionList />
              </div>
            </div>
          </div>
        </section>

        {/* --- SPOTLIGHT 2: SECURITY --- */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl mt-8 md:text-4xl font-extrabold text-gray-900 leading-tight">
                  Sovereign Security.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We don't want your bank credentials, and you shouldn't give them to anyone. 
                  <br /><br />
                  By removing the bank connection, we eliminate the risk of a third-party breach. Your financial data is yours alone.
                </p>
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Zero-Link Technology</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <MockSecurityCard />
              </div>
            </div>
          </div>
        </section>

        {/* --- SPOTLIGHT 3: SMART ALERTS (NEW) --- */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl mt-8 md:text-4xl font-extrabold text-gray-900 leading-tight">
                  Proactive defense for your wallet.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Most apps tell you after you've blown your budget. SmartBudget warns you before it happens.
                  <br /><br />
                  Set configurable thresholds (50-95%) and catch large transactions instantly.
                </p>
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Customizable warning triggers</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <MockAlertCard />
              </div>
            </div>
          </div>
        </section>

        {/* --- SPOTLIGHT 4: EDUCATION --- */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h3 className="text-3xl mt-8 md:text-4xl font-extrabold text-gray-900 leading-tight">
                  Financial literacy built-in.
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Budgeting is a skill, not just a task. Receive daily actionable insights and access our library of guides to master your money.
                </p>
                <div className="flex items-center gap-2 text-indigo-700 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Daily tips & strategies</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <MockDailyInsight />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '1.5rem' }}>
              <h2 className="text-2xl mt-8 font-bold text-black-600 tracking-wide uppercase">How It Works</h2>
              <h3 className="text-3xl sm:text-4xl mb-8 font-extrabold text-gray-900">Get started in 3 simple steps</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>
              <div className="relative text-center pt-4">
                <h4 className="text-xl font-bold text-gray-900 mb-3">1. Create Your Account</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Sign up in seconds. No credit card required.</p>
              </div>
              <div className="relative text-center pt-4">
                <h4 className="text-xl font-bold text-gray-900 mb-3">2. Set Your Goals</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Define your savings targets and budgets.</p>
              </div>
              <div className="relative text-center pt-4">
                <h4 className="text-xl font-bold text-gray-900 mb-3">3. Track & Grow</h4>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Log expenses daily and build wealth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '2.5rem' }}>
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">Ready to take control?</h2>
              <p className="text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed">Join thousands of intentional spenders building better money habits today.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Button size="lg" variant="outline" onClick={onGetStarted} className="text-black-600 hover:bg-blue-50 text-lg font-bold shadow-xl border-none px-10 py-6 h-auto">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-2xl font-bold text-white tracking-tight">SmartBudget</span>
              <p className="text-gray-500 text-center max-w-md leading-relaxed">
                Built for intentional spenders who want to take manual control of their financial future.
              </p>
            </div>
            
            <div className="flex items-center mt-6 gap-6 text-sm font-medium">
              <button onClick={onOpenPrivacy} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={onOpenTerms} className="hover:text-white transition-colors">Terms of Service</button>
            </div>

            <p className="text-gray-600 mt-6 text-xs">
              &copy; {new Date().getFullYear()} SmartBudget. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}