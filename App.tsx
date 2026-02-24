import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Database, Mail, AlertTriangle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { backend } from './services/backend';
import { TerminalLoader } from './components/TerminalLoader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { HistoryView } from './components/HistoryView';
import { CreatorHistoryView } from './components/CreatorHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { AgencyDashboard } from './components/AgencyDashboard';
import { TrackView } from './components/TrackView';
import { JobStatus, Creator, User, SearchHistoryItem, InstagramPost } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [waitingForMagicLink, setWaitingForMagicLink] = useState(false);
  
  // Landing Page State
  const [showLogin, setShowLogin] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'creator-history' | 'analytics' | 'agency' | 'track'>('search');
  
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
      
      // Check immediately if cached
      const status = await backend.checkJobStatus(id);
      setAnalyticsStatus(status.status);
      if (status.status.status === 'completed' && status.data) {
          setAnalyticsResults(status.data);
      } else {
          setAnalyticsResults([]);
      }
      
      loadHistory(); 
    } catch (err) {
      console.error(err);
      setError('Failed to start analytics service.');
    }
  };

  const handleRefreshAnalytics = async () => {
      if (!analyticsUsername) return;
      try {
          // Force refresh = true
          const id = await backend.startAnalytics(analyticsUsername, true);
          setAnalyticsJobId(id);
          setAnalyticsStatus({ jobId: id, status: 'pending', progress: 0, logs: [], resultCount: 0 });
          setAnalyticsResults([]);
          loadHistory();
      } catch (err) {
          console.error(err);
          setError('Failed to refresh analytics.');
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
        if (res.status.status === 'completed' && res.data) {
          setResults(res.data);
          setCurrentJobId(null); // Stop polling
          loadHistory();
        } else if (res.status.status === 'failed') {
          setCurrentJobId(null);
        }
      }).catch(() => setCurrentJobId(null));

      const interval = setInterval(() => {
        backend.checkJobStatus(currentJobId).then(res => {
          setJobStatus(res.status);
          if (res.status.status === 'completed' && res.data) {
            setResults(res.data);
            setCurrentJobId(null);
            loadHistory();
          } else if (res.status.status === 'failed') {
            setCurrentJobId(null);
          }
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentJobId]);

  // Analytics Poll
  useEffect(() => {
    if (analyticsJobId) {
      // Initial check
      backend.checkJobStatus(analyticsJobId).then(res => {
          setAnalyticsStatus(res.status);
          if (res.status.status === 'completed' && res.data) {
              setAnalyticsResults(res.data);
              setAnalyticsJobId(null); // Stop polling
              loadHistory();
          } else if (res.status.status === 'failed') {
              setAnalyticsJobId(null);
          }
      }).catch(() => setAnalyticsJobId(null));

      const interval = setInterval(() => {
        backend.checkJobStatus(analyticsJobId).then(res => {
          setAnalyticsStatus(res.status);
          if (res.status.status === 'completed' && res.data) {
            setAnalyticsResults(res.data);
            setAnalyticsJobId(null);
            loadHistory();
          } else if (res.status.status === 'failed') {
            setAnalyticsJobId(null);
          }
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [analyticsJobId]);


  if (!user && !showLogin) {
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  if (!user && showLogin) {
    return (
      <Login 
        onLogin={handleLogin} 
        loading={authLoading} 
        waitingForMagicLink={waitingForMagicLink}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} user={user!} />
      
      <main className="flex-1 overflow-y-auto relative">
        {activeTab === 'search' && (
           <div className="p-8 max-w-7xl mx-auto">
             {!results.length && !currentJobId ? (
               <div className="max-w-2xl mx-auto text-center py-20">
                 <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Find Your Next Partner</h1>
                 <p className="text-slate-500 mb-8 text-lg">Discover influencers similar to any account. Enter a username to start scraping.</p>
                 
                 <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all overflow-hidden">
                      <span className="pl-4 text-slate-400 font-bold text-lg select-none">@</span>
                      <input
                        type="text"
                        value={seedUsername}
                        onChange={(e) => setSeedUsername(e.target.value)}
                        placeholder="hormozi"
                        className="flex-1 pl-1 pr-32 py-4 outline-none text-lg"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      Search <ArrowRight size={18} />
                    </button>
                 </form>
                 {error && <p className="text-red-500 mt-4 text-sm bg-red-50 inline-block px-4 py-2 rounded-lg">{error}</p>}
               </div>
             ) : (
               <ResultsDashboard 
                 data={results} 
                 seedUrl={seedUsername} 
                 onReset={handleResetSearch} 
               />
             )}
           </div>
        )}

        {activeTab === 'analytics' && (
            <div className="p-0">
                {!analyticsStatus ? (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 size={32} className="text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Deep Dive Analytics</h2>
                            <p className="text-slate-500 mb-8">Get detailed performance metrics, engagement rates, and deal value estimates for any creator.</p>
                            
                            <form onSubmit={handleStartAnalytics}>
                                <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all overflow-hidden">
                                    <span className="pl-4 text-slate-400 font-bold text-lg select-none">@</span>
                                    <input
                                        type="text"
                                        value={analyticsUsername}
                                        onChange={(e) => setAnalyticsUsername(e.target.value)}
                                        placeholder="mrbeast"
                                        className="flex-1 pl-1 pr-4 py-4 outline-none text-lg"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                                >
                                    Analyze Creator
                                </button>
                            </form>
                            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                        </div>
                    </div>
                ) : (
                    analyticsStatus.status !== 'completed' ? (
                        <TerminalLoader 
                            status={analyticsStatus} 
                        />
                    ) : (
                        <AnalyticsView 
                            posts={analyticsResults} 
                            username={analyticsUsername} 
                            onReset={handleResetAnalytics}
                            onRefresh={handleRefreshAnalytics}
                        />
                    )
                )}
            </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8 max-w-7xl mx-auto">
            <HistoryView 
                history={history} 
                onSelectJob={handleSelectHistoryJob} 
            />
          </div>
        )}

        {activeTab === 'creator-history' && (
          <div className="p-8 max-w-7xl mx-auto">
            <CreatorHistoryView 
                history={history} 
                onSelectCreator={handleSelectHistoryJob} 
            />
          </div>
        )}

        {activeTab === 'agency' && (
            <AgencyDashboard />
        )}

        {activeTab === 'track' && (
            <TrackView />
        )}
      </main>
    </div>
  );
}

export default App;
