import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Database, Mail, AlertTriangle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { backend } from './services/backend';
import { TerminalLoader } from './components/TerminalLoader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { AgencyDashboard } from './components/AgencyDashboard';
import { JobStatus, Creator, User, SearchHistoryItem, InstagramPost } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [waitingForMagicLink, setWaitingForMagicLink] = useState(false);
  
  // Landing Page State
  const [showLogin, setShowLogin] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'analytics' | 'agency'>('search');
  
  // Search (Discovery) State
  const [seedUsername, setSeedUsername] = useState('');
  const [maxResults, setMaxResults] = useState(30);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [results, setResults] = useState<Creator[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Analytics State
  const [analyticsUsername, setAnalyticsUsername] = useState('');
  const [analyticsJobId, setAnalyticsJobId] = useState<string | null>(null);
  const [analyticsStatus, setAnalyticsStatus] = useState<JobStatus | null>(null);
  const [analyticsResults, setAnalyticsResults] = useState<InstagramPost[]>([]);
  
  // Data State
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  // Config State
  const config = backend.getConfig();
  const isLiveMode = !!config.token;
  const isSupabaseEnabled = !!config.supabaseUrl;

  // Initialization & Auth Listener
  useEffect(() => {
    // 1. Check for existing session (Local or Supabase)
    backend.getSessionUser().then(u => {
      if (u) {
        setUser(u);
        loadHistory();
      }
    });

    // 2. Listen for Supabase Auth Changes (Magic Link Redirect)
    if (backend.supabase) {
      const { data: { subscription } } = backend.supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const u = await backend.getSessionUser();
          setUser(u);
          setWaitingForMagicLink(false);
          loadHistory();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [config.supabaseUrl]);

  const loadHistory = async () => {
    const h = await backend.getHistory();
    setHistory(h);
  };

  const handleLogin = async (email: string) => {
    setAuthLoading(true);
    try {
      const { sentMagicLink, user } = await backend.login(email);
      if (sentMagicLink) {
        setWaitingForMagicLink(true);
      } else if (user) {
        setUser(user);
        loadHistory();
      }
    } catch (e: any) {
      alert(e.message || "Login failed. Check your Supabase configuration.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    backend.logout();
    setUser(null);
    setResults([]);
    setCurrentJobId(null);
    setAnalyticsJobId(null);
    setAnalyticsResults([]);
    setActiveTab('search');
    setWaitingForMagicLink(false);
    setShowLogin(false); // Reset to landing page
  };

  // --- DISCOVERY HANDLERS ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedUsername || seedUsername.includes('http')) {
      setError('Please enter a username (e.g. hormozi), not a URL.');
      return;
    }
    setError(null);
    
    try {
      const id = await backend.startSearch(seedUsername, maxResults);
      setCurrentJobId(id);
      setActiveTab('search');
      loadHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to start search service.');
    }
  };

  const handleResetSearch = () => {
    setCurrentJobId(null);
    setSeedUsername('');
    setResults([]);
    setJobStatus(null);
  };

  // --- ANALYTICS HANDLERS ---
  const handleStartAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyticsUsername || analyticsUsername.includes('http')) {
      setError('Please enter a username, not a URL.');
      return;
    }
    setError(null);

    try {
      const id = await backend.startAnalytics(analyticsUsername);
      setAnalyticsJobId(id);
      setAnalyticsStatus({ jobId: id, status: 'pending', progress: 0, logs: [], resultCount: 0 });
      loadHistory(); // Reload history to show the new pending analytics job
    } catch (err) {
      console.error(err);
      setError('Failed to start analytics service.');
    }
  };

  const handleResetAnalytics = () => {
    setAnalyticsJobId(null);
    setAnalyticsUsername('');
    setAnalyticsResults([]);
    setAnalyticsStatus(null);
  };

  const handleSelectHistoryJob = async (jobId: string) => {
    // Find the job type from history to know which view to open
    const job = history.find(h => h.id === jobId);
    
    if (job?.type === 'analytics') {
      setActiveTab('analytics');
      setAnalyticsJobId(jobId);
      setAnalyticsUsername(job.seedUsername); // Set context
      
      try {
        const response = await backend.checkJobStatus(jobId);
        if (response.status.status === 'completed' && response.data) {
          setAnalyticsResults(response.data);
        }
        setAnalyticsStatus(response.status);
      } catch (e) { console.error(e); }

    } else {
      setActiveTab('search');
      setCurrentJobId(jobId);
      setSeedUsername(job?.seedUsername || ''); // Set context
      
      try {
        const response = await backend.checkJobStatus(jobId);
        if (response.status.status === 'completed' && response.data) {
           setResults(response.data);
        }
        setJobStatus(response.status);
      } catch (e) { console.error(e); }
    }
  };

  // --- POLLING ---
  
  // Discovery Poll
  useEffect(() => {
    if (currentJobId) {
      backend.checkJobStatus(currentJobId).then(res => {
         setJobStatus(res.status);
         if(res.data) setResults(res.data);
      }).catch(e => console.log("Polling error", e));

      const interval = setInterval(async () => {
        try {
          const response = await backend.checkJobStatus(currentJobId);
          setJobStatus(response.status);

          if (response.status.status === 'completed' && response.data) {
            setResults(response.data);
            loadHistory(); 
            clearInterval(interval);
          } else if (response.status.status === 'failed') {
            setError('Task failed.');
            loadHistory();
            clearInterval(interval);
          }
        } catch (e) { console.error(e); }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentJobId]);

  // Analytics Poll
  useEffect(() => {
    if (analyticsJobId) {
      backend.checkJobStatus(analyticsJobId).then(res => {
         setAnalyticsStatus(res.status);
         if(res.data) setAnalyticsResults(res.data);
      }).catch(e => console.log("Polling error", e));

      const interval = setInterval(async () => {
        try {
          const response = await backend.checkJobStatus(analyticsJobId);
          setAnalyticsStatus(response.status);

          if (response.status.status === 'completed' && response.data) {
            setAnalyticsResults(response.data);
            loadHistory(); // Update history when complete
            clearInterval(interval);
          } else if (response.status.status === 'failed') {
            setError('Analytics task failed.');
            loadHistory();
            clearInterval(interval);
          }
        } catch (e) { console.error(e); }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [analyticsJobId]);

  const DebugLogs = ({ logs }: { logs: string[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => { if(isOpen && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [isOpen]);
    return (
      <div className="w-full max-w-lg mt-8">
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-indigo-600 transition-colors mb-2 mx-auto">
            {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14} />} {isOpen ? 'Hide System Logs' : 'View System Logs'}
          </button>
          {isOpen && (
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 max-h-48 overflow-y-auto shadow-inner border border-slate-800" ref={scrollRef}>
                {logs.map((log, i) => (
                    <div key={i} className="break-all opacity-90 border-l-2 border-transparent hover:border-indigo-500 pl-2">
                        <span className="text-indigo-500 mr-2">➜</span>{log}
                    </div>
                ))}
            </div>
          )}
      </div>
    );
  };

  // --- RENDER ROUTING ---

  if (!user) {
    if (showLogin) {
       return (
         <Login 
            onLogin={handleLogin} 
            onBack={() => setShowLogin(false)} 
            loading={authLoading} 
          />
       )
    }
    return <LandingPage onStart={() => setShowLogin(true)} />;
  }

  // --- LOGGED IN APP ---
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {waitingForMagicLink ? (
         <div className="w-full flex flex-col items-center justify-center p-4 text-center animate-fade-in-up">
           <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6"> <Mail size={32} /> </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
           <p className="text-slate-500 max-w-md mb-8">We sent a magic link to your email address. Click the link to sign in and access your account.</p>
           <button onClick={() => setWaitingForMagicLink(false)} className="text-sm text-slate-400 hover:text-slate-600">Back to login</button>
         </div>
      ) : (
        /* Main App Interface */
        <>
          <Sidebar 
            user={user} 
            activeTab={activeTab} 
            onTabChange={(t) => { setActiveTab(t); if(t === 'history') loadHistory(); }} 
            onLogout={handleLogout}
          />

          <div className="flex-1 ml-64 p-8 relative">
            
            {/* --- AGENCY DASHBOARD --- */}
            {activeTab === 'agency' && <AgencyDashboard />}

            {/* --- SEARCH TAB --- */}
            {activeTab === 'search' && (
              <div className="max-w-7xl mx-auto h-full">
                {currentJobId && jobStatus?.status === 'completed' && results.length > 0 ? (
                  <ResultsDashboard data={results} seedUrl={seedUsername} onReset={handleResetSearch} />
                ) : (currentJobId && (jobStatus?.status === 'failed' || (jobStatus?.status === 'completed' && results.length === 0))) ? (
                   <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 border border-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={32} /></div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{jobStatus?.status === 'completed' ? 'No Suggested Accounts Found' : 'Search Failed'}</h2>
                      <p className="text-slate-500 max-w-md text-center mb-8 leading-relaxed">
                        {jobStatus?.status === 'completed' ? <span>We found 0 related profiles for <strong>@{seedUsername}</strong>. This usually happens when the user has disabled the <em>'Suggested Accounts'</em> feature.</span> : "The scraper encountered an unexpected error."}
                      </p>
                      <button onClick={handleResetSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                         <ArrowRight size={18} /> Try Another Account
                      </button>
                      {jobStatus && <DebugLogs logs={jobStatus.logs} />}
                   </div>
                ) : currentJobId && jobStatus ? (
                  <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Running Analysis</h2>
                    <p className="text-slate-500 mb-8">This usually takes about 30-60 seconds.</p>
                    <TerminalLoader status={jobStatus} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Discover your next <br/><span className="text-indigo-600">partnership opportunity.</span></h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">Enter an Instagram handle. We'll find high-affinity lookalikes and enrich them with email and engagement data.</p>
                    <div className="w-full max-w-xl mx-auto space-y-4">
                        <form onSubmit={handleSearch} className="relative group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><span className="text-slate-400 font-bold text-lg">@</span></div>
                          <input type="text" placeholder="hormozi" value={seedUsername} onChange={(e) => setSeedUsername(e.target.value)} className="w-full h-14 pl-10 pr-32 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-lg shadow-slate-200/50 text-lg" />
                          <button type="submit" className={`absolute right-2 top-2 bottom-2 text-white px-6 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${isLiveMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>Start <ArrowRight size={16} /></button>
                        </form>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                          <span className="text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Max Results: {maxResults}</span>
                          <input type="range" min="10" max="50" step="5" value={maxResults} onChange={(e) => setMaxResults(parseInt(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                        </div>
                    </div>
                    {isSupabaseEnabled && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium"><Database size={12} /> Database Connected</div>}
                    {error && <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-100 py-2 px-4 rounded-lg inline-block animate-pulse">{error}</div>}
                  </div>
                )}
              </div>
            )}

            {/* --- HISTORY TAB --- */}
            {activeTab === 'history' && (
              <div className="max-w-5xl mx-auto">
                <HistoryView history={history} onSelectJob={handleSelectHistoryJob} />
              </div>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
              <div className="max-w-7xl mx-auto h-full">
                
                {analyticsJobId && analyticsStatus?.status === 'completed' && analyticsResults.length > 0 ? (
                    <AnalyticsView posts={analyticsResults} username={analyticsUsername} onReset={handleResetAnalytics} />
                ) : (analyticsJobId && (analyticsStatus?.status === 'failed' || (analyticsStatus?.status === 'completed' && analyticsResults.length === 0))) ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                      <div className="w-16 h-16 bg-amber-50 text-amber-500 border border-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={32} /></div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{analyticsStatus?.status === 'completed' ? 'No Reels Found' : 'Analysis Failed'}</h2>
                      <p className="text-slate-500 max-w-md text-center mb-8 leading-relaxed">
                        {analyticsStatus?.status === 'completed' ? <span>We couldn't find any recent reels for <strong>@{analyticsUsername}</strong>. The user might be private or hasn't posted in the last 365 days.</span> : "The scraper encountered an unexpected error."}
                      </p>
                      <button onClick={handleResetAnalytics} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                         <ArrowRight size={18} /> Try Another Account
                      </button>
                      {analyticsStatus && <DebugLogs logs={analyticsStatus.logs} />}
                   </div>
                ) : analyticsJobId && analyticsStatus ? (
                    <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Content</h2>
                    <p className="text-slate-500 mb-8">Fetching last 10 posts, calculating engagement, and transcribing audio...</p>
                    <TerminalLoader status={analyticsStatus} />
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-2">
                            <BarChart3 size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Deep-Dive <span className="text-indigo-600">Analytics</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Enter a username to analyze their last 10 reels. We'll calculate true CPV, CPE, and engagement rates to help you price your deal.
                        </p>

                        <div className="w-full max-w-xl mx-auto space-y-4">
                            <form onSubmit={handleStartAnalytics} className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-lg">@</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="mattbison"
                                    value={analyticsUsername}
                                    onChange={(e) => setAnalyticsUsername(e.target.value)}
                                    className="w-full h-14 pl-10 pr-32 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-lg shadow-slate-200/50 text-lg"
                                />
                                <button 
                                    type="submit"
                                    className={`absolute right-2 top-2 bottom-2 text-white px-6 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${isLiveMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    Analyze
                                    <ArrowRight size={16} />
                                </button>
                            </form>
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500"/> Includes Transcripts</span>
                                <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500"/> Engagement Calc</span>
                            </div>
                        </div>
                        {error && <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-100 py-2 px-4 rounded-lg inline-block animate-pulse">{error}</div>}
                    </div>
                )}

              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

export default App;