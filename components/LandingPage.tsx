import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Database, Zap, BarChart3, Search, Mail, Users, Star, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Smooth scroll handler with offset for sticky header
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Height of sticky header + buffer
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 text-indigo-600 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="font-bold text-xl tracking-tight text-slate-900">CreatorLogic</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <a href="#problem" onClick={(e) => scrollToSection(e, 'problem')} className="hover:text-indigo-600 transition-colors">Problem</a>
              <a href="#solution" onClick={(e) => scrollToSection(e, 'solution')} className="hover:text-indigo-600 transition-colors">Solution</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-indigo-600 transition-colors">FAQ</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={onStart}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                Join with Google
              </button>
              <button 
                onClick={onStart}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
              >
                Open App
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-slate-700">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3 shadow-xl">
             <a href="#problem" className="block py-2 text-slate-600 font-medium" onClick={(e) => scrollToSection(e, 'problem')}>Problem</a>
             <a href="#solution" className="block py-2 text-slate-600 font-medium" onClick={(e) => scrollToSection(e, 'solution')}>Solution</a>
             <a href="#pricing" className="block py-2 text-slate-600 font-medium" onClick={(e) => scrollToSection(e, 'pricing')}>Pricing</a>
             <a href="#faq" className="block py-2 text-slate-600 font-medium" onClick={(e) => scrollToSection(e, 'faq')}>FAQ</a>
             <button onClick={onStart} className="w-full mt-4 flex justify-center items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg font-medium text-slate-700">
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" /> Join with Google
             </button>
             <button onClick={onStart} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium">Open App</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
          <Star size={12} className="fill-indigo-600" /> Trusted by 1,000+ Agencies
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
          Track, Manage, and Optimize Your <span className="text-indigo-600">Influencer Pipeline</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop guessing. Our automated scraper engine finds verified lookalike creators, extracts emails, and analyzes engagement rates in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl text-base font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Tracking
          </button>
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl text-base font-semibold hover:bg-slate-50 transition-all shadow-sm hover:border-slate-300"
          >
            Free Demo
          </button>
        </div>
        
        <p className="text-xs text-slate-400 mb-12">7-Day Money-Back Guarantee • Cancel Anytime</p>

        {/* Dashboard Mockup */}
        <div className="relative mx-auto max-w-5xl rounded-xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10 sm:rounded-2xl lg:rounded-3xl lg:p-4 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
          <div className="bg-slate-950 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border border-slate-800 relative aspect-[16/9] flex flex-col">
             {/* Fake Browser Header */}
             <div className="bg-slate-900 px-4 py-3 flex items-center gap-4 border-b border-slate-800">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="flex-1 bg-slate-950/50 rounded-md py-1 px-3 text-xs text-slate-500 text-center font-mono border border-slate-800/50">
                   app.creatorlogic.io/dashboard
                </div>
             </div>
             {/* Fake Dashboard Content */}
             <div className="flex-1 p-6 grid grid-cols-4 gap-4 overflow-hidden">
                <div className="col-span-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4 space-y-3">
                   <div className="h-2 w-1/3 bg-slate-800 rounded"></div>
                   <div className="h-8 w-full bg-indigo-500/20 border border-indigo-500/30 rounded"></div>
                   <div className="space-y-2 pt-4">
                      <div className="h-2 w-full bg-slate-800 rounded"></div>
                      <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                      <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                   </div>
                </div>
                <div className="col-span-3 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                       <div className="h-24 bg-slate-900/50 rounded-lg border border-slate-800"></div>
                       <div className="h-24 bg-slate-900/50 rounded-lg border border-slate-800"></div>
                       <div className="h-24 bg-slate-900/50 rounded-lg border border-slate-800"></div>
                    </div>
                    <div className="h-full bg-slate-900/50 rounded-lg border border-slate-800 relative overflow-hidden">
                        {/* Fake Table Rows */}
                         <div className="p-4 space-y-4 opacity-50">
                            {[1,2,3,4,5].map(i => (
                               <div key={i} className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                                  <div className="h-3 w-32 bg-slate-800 rounded"></div>
                                  <div className="h-3 w-16 bg-slate-800 rounded ml-auto"></div>
                                  <div className="h-3 w-24 bg-indigo-900/30 rounded"></div>
                               </div>
                            ))}
                         </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- PROBLEM SECTION --- */}
      <section id="problem" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-bold text-indigo-600 tracking-wide uppercase">The UGC Marketer Challenge</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Operating Content Strategies is a Hassle</p>
            <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">Managing multiple accounts across different platforms creates significant challenges for UGC marketers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
             <ProblemCard 
               icon={<Database className="text-indigo-600" />} 
               title="Fragmented Data" 
               desc="Running multiple internal & external accounts on different platforms is resource intense. Lacking insights and analytics result in high costs with low return."
             />
             <ProblemCard 
               icon={<Search className="text-indigo-600" />} 
               title="Limited Visibility" 
               desc="It's impossible to keep track on the overall performance of multi-channel UGC marketing with dozens of accounts on different platforms without the right tools."
             />
             <ProblemCard 
               icon={<Zap className="text-indigo-600" />} 
               title="Time Wasted" 
               desc="Manually tracking all your accounts takes hours every week. Time what could be spent on value-adding marketing activities to win more customers."
             />
          </div>
        </div>
      </section>

      {/* --- SOLUTION SECTION --- */}
      <section id="solution" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-base font-bold text-indigo-600 tracking-wide uppercase">Solution</h2>
             <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Viral Marketing With the <br/>Ultimate Growth-Pilot</p>
          </div>

          <div className="space-y-24">
            <FeatureRow 
              title="Automated Discovery Engine"
              desc="Simply provide one seed account. Our recursive scraper identifies 50-100 high-affinity lookalike profiles instantly, saving your VA hours of manual scrolling."
              image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
              align="left"
            />
             <FeatureRow 
              title="Enrichment & Email Extraction"
              desc="We don't just give you usernames. We verify their follower counts, check engagement rates, and automatically extract public emails so you can reach out immediately."
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
              align="right"
            />
             <FeatureRow 
              title="Unified Analytics Dashboard"
              desc="Get a bird's-eye view of your performance with our intuitive dashboard. Track engagement, growth trends, and audience metrics all in one place."
              image="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2676&auto=format&fit=crop"
              align="left"
            />
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm mb-6">
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <img key={i} className="w-6 h-6 rounded-full border-2 border-white" src={`https://ui-avatars.com/api/?background=random&name=${i}`} alt=""/>
                   ))}
                </div>
                <span className="text-xs font-semibold text-slate-600">1000+ accounts tracked</span>
             </div>
             <h2 className="text-4xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
             <p className="mt-4 text-slate-500">Choose the perfect plan for you to go viral. Upgrade anytime.</p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
             <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Billed Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Billed Yearly <span className={`${billingCycle === 'yearly' ? 'text-indigo-200' : 'text-emerald-600'} text-[10px] ml-1`}>-25%</span>
                </button>
             </div>
          </div>

          <div className="max-w-md mx-auto">
             <PricingCard 
               title="Pro Plan" 
               price={billingCycle === 'monthly' ? '$79.99' : '$59.99'} 
               desc="Everything you need to automate your agency."
               features={[
                 "Unlimited Discovery Searches", 
                 "Unlimited Deep-Dive Analytics", 
                 "Verified Email Extraction", 
                 "Export to CSV",
                 "Agency Admin View",
                 "Priority Email Support"
               ]}
               active={true}
               onStart={onStart}
             />
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 bg-white scroll-mt-20">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Common Questions</h2>
            <p className="text-center text-slate-500 mb-12">We're here to help you get the most out of CreatorLogic.</p>
            
            <div className="space-y-4">
               <Accordion title="What is CreatorLogic?">
                  CreatorLogic is an automated intelligence tool designed for B2B agencies and UGC marketers. It replaces the manual "suggested accounts" rabbit hole with an automated pipeline that discovers, enriches, and analyzes influencer data.
               </Accordion>
               <Accordion title="How does the discovery engine work?">
                  We use a task-based scraping architecture. You provide a "Seed Account" (e.g., a competitor or ideal influencer), and our system recursively finds high-affinity profiles that the algorithm suggests, ensuring 99% relevance.
               </Accordion>
               <Accordion title="Can I export the data?">
                  Yes! All data is exportable to CSV with one click. This includes verified emails, engagement metrics, and bio data, formatted perfectly for your cold outreach tools.
               </Accordion>
               <Accordion title="Do I need my own proxies?">
                  No. We handle all the infrastructure, proxies, and scraping rotation on our end. You just enter a username and get the results.
               </Accordion>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center gap-2 text-white mb-4">
                  <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">C</div>
                  <span className="font-bold text-lg">CreatorLogic</span>
               </div>
               <p className="text-sm text-slate-500">Automating the future of influencer discovery.</p>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Product</h4>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">API</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Company</h4>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
               </ul>
            </div>
            <div>
               <h4 className="text-white font-bold mb-4">Legal</h4>
               <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-600 border-t border-slate-800 pt-8">
            &copy; {new Date().getFullYear()} CreatorLogic Inc. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const ProblemCard = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-center text-center">
     <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
        {icon}
     </div>
     <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
     <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FeatureRow = ({ title, desc, image, align }: any) => (
   <div className={`flex flex-col lg:flex-row items-center gap-12 ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-6">
         <h3 className="text-3xl font-bold text-slate-900">{title}</h3>
         <p className="text-lg text-slate-500 leading-relaxed">{desc}</p>
         <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
      </div>
      <div className="flex-1 w-full">
         <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3] relative group">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors"></div>
         </div>
      </div>
   </div>
);

const FeatureGridItem = ({ icon, title, desc }: any) => (
   <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all">
      <div className="shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
         {icon}
      </div>
      <div>
         <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
         <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
   </div>
);

const PricingCard = ({ title, price, desc, features, active, onStart }: any) => (
   <div className={`rounded-2xl p-8 border ${active ? 'border-indigo-600 shadow-xl bg-white relative overflow-hidden' : 'border-slate-200 bg-white shadow-sm'}`}>
      {active && (
         <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wide">
            Best Deal
         </div>
      )}
      <div className="flex items-center gap-3 mb-4">
         <div className={`w-3 h-3 rounded-full ${active ? 'bg-indigo-600' : 'bg-slate-900'}`}></div>
         <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">{desc}</p>
      <div className="flex items-baseline gap-1 mb-8">
         <span className="text-5xl font-bold text-slate-900">{price}</span>
         <span className="text-slate-400 text-sm">/ month</span>
      </div>
      
      <div className="space-y-4 mb-8">
         {features.map((f: string, i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
               <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
               {f}
            </div>
         ))}
      </div>
      
      <button 
        onClick={onStart}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
         active 
         ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
         : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
      }`}>
         Start Free Trial
      </button>
   </div>
);

const Accordion = ({ title, children }: any) => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
         <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
         >
            <span className="font-medium text-slate-900">{title}</span>
            {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
         </button>
         {isOpen && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-600 text-sm leading-relaxed">
               {children}
            </div>
         )}
      </div>
   )
}