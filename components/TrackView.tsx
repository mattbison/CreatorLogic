
import React, { useState, useEffect, useMemo } from 'react';
import { Partnership, AppStoreCredentials, DailyMetric, DateRange } from '../types';
import { backend } from '../services/backend';
import { 
  BarChart3, 
  Plus, 
  RefreshCw, 
  Smartphone, 
  Calendar, 
  ExternalLink, 
  DollarSign, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  Info,
  Download,
  Trash2,
  Users,
  LayoutGrid,
  TrendingUp,
  Share2
} from 'lucide-react';

export const TrackView = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partnerships' | 'connections'>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [credentials, setCredentials] = useState<AppStoreCredentials | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load Data
  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    const p = await backend.getPartnerships();
    const c = await backend.getAppCredentials();
    const m = await backend.fetchAppStoreStats(dateRange);
    
    setPartnerships(p);
    setCredentials(c);
    setMetrics(m);
  };

  const handleRefresh = async () => {
      setRefreshing(true);
      // Pass the current state to backend to prevent DB fetch race conditions
      await backend.refreshPartnershipStats(partnerships);
      
      // Poll for updates for 20 seconds
      const interval = setInterval(async () => {
          const fresh = await backend.getPartnerships();
          setPartnerships(fresh);
          const freshMetrics = await backend.fetchAppStoreStats(dateRange);
          setMetrics(freshMetrics);
      }, 4000);

      setTimeout(() => { 
          clearInterval(interval); 
          setRefreshing(false);
          loadData(); 
      }, 20000);
  }

  const handleSavePartnership = async (p: Partnership) => {
      // 1. Save new deal to DB
      await backend.savePartnership(p);
      setShowAddModal(false);
      
      // Update local state immediately
      const updatedList = [p, ...partnerships];
      setPartnerships(updatedList);

      // 2. Kick off background extraction immediately with the EXPLICIT list
      setRefreshing(true);
      backend.refreshPartnershipStats(updatedList).then(() => {
          // Poll local state every few seconds to see if results came in
          const interval = setInterval(async () => {
              const fresh = await backend.getPartnerships();
              setPartnerships(fresh);
              
              // Also update chart metrics
              const freshMetrics = await backend.fetchAppStoreStats(dateRange);
              setMetrics(freshMetrics);
          }, 4000);
          
          setTimeout(() => { clearInterval(interval); setRefreshing(false); }, 45000);
      });
  };

  const handleSaveCreds = async (c: AppStoreCredentials) => {
      // Logic handled in backend service (including validation call)
      await backend.saveAppCredentials(c);
      const updated = await backend.getAppCredentials();
      setCredentials(updated);
      setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
       
       {/* PAGE HEADER */}
       <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-4">
                    {/* Breadcrumb style title */}
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span>Tracking & Attribution</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
                            {activeTab === 'overview' ? 'App Store' : activeTab === 'partnerships' ? 'Partnerships' : 'Settings'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Date Range Picker (Only on Overview) */}
                    {activeTab === 'overview' && (
                        <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                            <DateRangeBtn active={dateRange === '7d'} onClick={() => setDateRange('7d')} label="7D" />
                            <DateRangeBtn active={dateRange === '30d'} onClick={() => setDateRange('30d')} label="30D" />
                            <DateRangeBtn active={dateRange === '90d'} onClick={() => setDateRange('90d')} label="90D" />
                        </div>
                    )}

                    <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

                    {/* Nav Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Analytics" icon={<BarChart3 size={14}/>} />
                        <TabButton active={activeTab === 'partnerships'} onClick={() => setActiveTab('partnerships')} label="Deals" icon={<DollarSign size={14}/>} />
                        <TabButton active={activeTab === 'connections'} onClick={() => setActiveTab('connections')} label="Codes" icon={<Smartphone size={14}/>} />
                    </div>
                </div>
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
             <div className="space-y-8 animate-fade-in-up">
                 
                 {/* Install Tracking Info Banner */}
                 <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                     <div className="flex items-start gap-3">
                         <Info className="text-slate-400 mt-0.5" size={20} />
                         <div>
                             <h3 className="text-sm font-bold text-slate-900">Install Tracking Active</h3>
                             <p className="text-sm text-slate-500 max-w-2xl">
                                We track both creator-attributed installs and organic installs. The "All Installs" view includes installs without creator attribution to give you complete visibility.
                             </p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button className="text-slate-500 hover:text-slate-900 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 transition-colors">How this works</button>
                        <button 
                            onClick={handleRefresh}
                            className={`p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors ${refreshing ? 'animate-spin bg-indigo-50 text-indigo-600' : ''}`}
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} />
                        </button>
                     </div>
                 </div>

                 {/* Date Header */}
                 <div className="flex items-center gap-2">
                     <div className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm">
                         <Calendar size={14} className="text-slate-400" />
                         {metrics.length > 0 ? `${new Date(metrics[0].date).toLocaleDateString('en-GB', {day: 'numeric', month:'short'})} - ${new Date(metrics[metrics.length-1].date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}` : 'Loading...'}
                     </div>
                 </div>

                 {/* KPI CARDS (Growi Style) */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard 
                        title="App Installs" 
                        value={metrics.reduce((acc, m) => acc + m.installs, 0).toLocaleString()} 
                    />
                    <KpiCard 
                        title="App Uninstalls" 
                        value={metrics.reduce((acc, m) => acc + m.uninstalls, 0).toLocaleString()} 
                    />
                    <KpiCard 
                        title="Retention Rate" 
                        value={`${(metrics.reduce((acc, m) => acc + m.retention, 0) / (metrics.length || 1)).toFixed(1)}%`} 
                    />
                 </div>

                 {/* MAIN CHART */}
                 <div className="bg-white px-6 py-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">App Installs vs Views</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-2xl font-normal text-slate-900">{metrics.reduce((acc, m) => acc + m.installs, 0).toLocaleString()}</span>
                                <span className="text-sm text-slate-500">total app installs</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="text-right">
                                 <div className="text-2xl font-normal text-slate-900">{partnerships.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString()}</div>
                                 <div className="text-sm text-slate-500">total views</div>
                             </div>
                             <div className="flex items-center gap-4 text-xs font-medium border-l border-slate-200 pl-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> App Installs
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div> Views
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <DualAxisChart metrics={metrics} />
                 </div>
             </div>
          )}

          {/* --- PARTNERSHIPS TAB --- */}
          {activeTab === 'partnerships' && (
              <div className="space-y-6 animate-fade-in-up">
                  <div className="flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-bold text-slate-900">Active Creator Deals</h2>
                          <p className="text-slate-500 text-sm mt-1">Manage your active campaigns and track their ROI.</p>
                      </div>
                      <div className="flex items-center gap-3">
                         {refreshing && <span className="text-xs text-indigo-600 font-medium animate-pulse">Syncing...</span>}
                         <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus size={16} /> Add Partnership
                        </button>
                      </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Creator / Campaign</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Cost</th>
                                <th className="p-4">Views</th>
                                <th className="p-4">Shares</th>
                                <th className="p-4">Engagement</th>
                                <th className="p-4">Eng. Rate</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {partnerships.map(p => {
                                const engagement = (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
                                const engagementRate = p.views > 0 ? ((engagement / p.views) * 100).toFixed(2) : '0';

                                return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{p.creatorName}</div>
                                        <a href={p.videoUrl} target="_blank" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                            View Content <ExternalLink size={10} />
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${p.status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-900">
                                        ${p.cost.toLocaleString()}
                                    </td>
                                    <td className="p-4 font-mono text-slate-600 font-medium">
                                        {p.views > 0 ? p.views.toLocaleString() : '-'}
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">
                                        {p.shares > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <Share2 size={12} className="text-slate-400" />
                                                {p.shares.toLocaleString()}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">
                                        {engagement > 0 ? engagement.toLocaleString() : '-'}
                                    </td>
                                    <td className="p-4">
                                         {parseFloat(engagementRate) > 0 ? (
                                             <div className="flex items-center gap-1 text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded w-fit">
                                                 <TrendingUp size={12} />
                                                 {engagementRate}%
                                             </div>
                                         ) : <span className="text-slate-400">-</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-slate-400 hover:text-red-600 transition-colors p-2">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {partnerships.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-slate-500">
                                        No active partnerships. Add one to start tracking ROI.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          )}

          {/* --- CONNECTIONS TAB (WIZARD STYLE) --- */}
          {activeTab === 'connections' && (
              <div className="max-w-4xl mx-auto animate-fade-in-up">
                  {credentials ? (
                    // Connected State
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm text-center py-16 px-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Successfully Linked</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Your Apple App Store account <strong>{credentials.appName}</strong> is connected. We are syncing install and sales data every 24 hours.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setActiveTab('overview')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">View Analytics</button>
                            <button onClick={() => setCredentials(null)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Disconnect</button>
                        </div>
                    </div>
                  ) : (
                    // Wizard State
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Wizard Header */}
                        <div className="bg-slate-50 p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Link your app store</h2>
                            <p className="text-slate-500 text-sm">Connect once to pull live installs, sales, and subscription metrics into CreatorLogic. We never share this data.</p>
                            
                            {/* Platform Selector */}
                            <div className="flex gap-4 mt-8">
                                <div className="flex-1 bg-indigo-50 border-2 border-indigo-500 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer">
                                    <Smartphone size={32} className="text-slate-900 mb-3" />
                                    <h3 className="font-bold text-slate-900">Apple App Store</h3>
                                    <p className="text-xs text-slate-500 mt-1">Track iOS installs, sales, and subscriptions</p>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center cursor-not-allowed opacity-50">
                                    <LayoutGrid size={32} className="text-slate-300 mb-3" />
                                    <h3 className="font-bold text-slate-400">Google Play Store</h3>
                                    <p className="text-xs text-slate-400 mt-1">Coming Soon</p>
                                </div>
                            </div>
                        </div>

                        {/* Setup Form */}
                        <div className="p-8">
                            <h3 className="font-bold text-lg text-slate-900 mb-6">Upload credentials</h3>
                            <AppStoreForm onSave={handleSaveCreds} />
                        </div>
                    </div>
                  )}
              </div>
          )}

       </div>

       {/* ADD MODAL */}
       {showAddModal && (
           <AddPartnershipModal onClose={() => setShowAddModal(false)} onSave={handleSavePartnership} />
       )}

    </div>
  );
};

// --- SUBCOMPONENTS ---

const DateRangeBtn = ({ active, onClick, label }: any) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
    >
        {label}
    </button>
);

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
    >
        {icon} {label}
    </button>
);

const KpiCard = ({ title, value }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-1 text-slate-500 text-sm font-medium mb-2">
          {title} <Info size={12} />
      </div>
      <div className="text-3xl font-normal text-slate-900 tracking-tight">{value}</div>
    </div>
);

const AppStoreForm = ({ onSave }: { onSave: (c: AppStoreCredentials) => void }) => {
    const [data, setData] = useState<AppStoreCredentials>({
        appName: '', vendorNumber: '', issuerId: '', keyId: '', privateKey: ''
    });

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(data); }}>
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">App Name</label>
                    <input required type="text" placeholder="e.g. 'Instagram'" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                        value={data.appName} onChange={e => setData({...data, appName: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Vendor Number</label>
                    <input required type="text" placeholder="e.g. '12345678'" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={data.vendorNumber} onChange={e => setData({...data, vendorNumber: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Issuer ID</label>
                    <input required type="text" placeholder="UUID" className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={data.issuerId} onChange={e => setData({...data, issuerId: e.target.value})} />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Key ID</label>
                    <input required type="text" placeholder="Key ID from App Store Connect" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={data.keyId} onChange={e => setData({...data, keyId: e.target.value})} />
                 </div>

                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Private Key (.p8)</label>
                    <div className="relative">
                        <textarea required rows={3} placeholder="Paste contents of .p8 file here..." className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={data.privateKey} onChange={e => setData({...data, privateKey: e.target.value})} />
                        <div className="absolute right-3 top-3 bg-white px-2 text-xs font-bold text-slate-500 border border-slate-200 rounded">SECRET</div>
                    </div>
                 </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                Connect App Store
            </button>
        </form>
    )
}

const AddPartnershipModal = ({ onClose, onSave }: any) => {
    const [form, setForm] = useState({ creatorName: '', videoUrl: '', cost: '', postedDate: new Date().toISOString().split('T')[0] });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: crypto.randomUUID(),
            ...form,
            cost: parseInt(form.cost),
            status: 'live',
            platform: 'instagram',
            views: 0, likes: 0, comments: 0, shares: 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Add Partnership</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Creator Name</label>
                        <input required autoFocus className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                            value={form.creatorName} onChange={e => setForm({...form, creatorName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Video Link</label>
                        <input required type="url" placeholder="https://instagram.com/p/..." className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                             value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cost ($)</label>
                            <input required type="number" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                 value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Posted Date</label>
                            <input required type="date" className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                                 value={form.postedDate} onChange={e => setForm({...form, postedDate: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Track Deal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/**
 * CUSTOM DUAL-AXIS CHART (SVG)
 * Renders App Installs as a Line and Video Views as overlay circles/bars
 */
const DualAxisChart = ({ metrics }: { metrics: DailyMetric[] }) => {
    const width = 1200; // Increased width for flatter aspect ratio
    const height = 120; // Short height
    const paddingX = 16;
    const paddingY = 5; // Very tight vertical padding
    
    // Reverse metrics to be chronological left-to-right
    const data = useMemo(() => [...metrics].reverse(), [metrics]);
    
    if (data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400">Loading metrics...</div>;

    // Scales
    const maxInstalls = Math.max(...data.map(d => d.installs)) * 1.1;
    const maxViews = Math.max(...data.map(d => d.views)) * 1.1 || 1000;
    
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const getX = (i: number) => paddingX + (i / (data.length - 1)) * chartW;
    const getY_Installs = (val: number) => height - paddingY - (val / maxInstalls) * chartH;
    
    // Path for Installs (Line)
    const linePath = data.map((d, i) => `${getX(i)},${getY_Installs(d.installs)}`).join(' ');

    return (
        <div className="w-full overflow-hidden relative group/chart">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block">
                
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = height - paddingY - pct * chartH;
                    return (
                        <g key={i}>
                            <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                        </g>
                    )
                })}

                {/* Video Views (Bubbles) - Rendered behind line for clarity */}
                {data.map((d, i) => {
                    if (d.views === 0) return null;
                    const x = getX(i);
                    // Use a separate visual scale or normalized bubble size
                    return (
                        <g key={i} className="group/marker cursor-pointer">
                            <line x1={x} y1={paddingY} x2={x} y2={height - paddingY} stroke="#cbd5e1" strokeDasharray="4 4" opacity="0.5" />
                            <circle cx={x} cy={getY_Installs(d.installs)} r="6" fill="#94a3b8" stroke="white" strokeWidth="2" />
                            
                            {/* Simple tooltip simulation via title */}
                            <title>{d.date}: {d.views} Video Views</title>
                        </g>
                    )
                })}

                {/* Installs Line */}
                <polyline points={linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Area Gradient */}
                <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <polygon points={`${paddingX},${height-paddingY} ${linePath} ${width-paddingX},${height-paddingY}`} fill="url(#areaGradient)" />

                {/* Hover Targets (Invisible columns for better UX) */}
                {data.map((d, i) => {
                    const x = getX(i);
                    const y = getY_Installs(d.installs);
                    return (
                        <g key={i} className="group/point">
                             {/* The visible dot on the line */}
                             <circle cx={x} cy={y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" className="opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                             
                             {/* The tooltip box (SVG-based) */}
                             <g className="opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">
                                <rect x={x - 60} y={y - 50} width="120" height="40" rx="4" fill="#1e293b" />
                                <text x={x} y={y - 25} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                                    {d.date}
                                </text>
                                <text x={x} y={y - 14} textAnchor="middle" fill="#cbd5e1" fontSize="10">
                                    {d.installs} Installs
                                </text>
                                {d.views > 0 && (
                                     <text x={x} y={y - 35} textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">
                                        ★ {d.views} Views
                                    </text>
                                )}
                             </g>
                        </g>
                    )
                })}
            </svg>
        </div>
    )
}
