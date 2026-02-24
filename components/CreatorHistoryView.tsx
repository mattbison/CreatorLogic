
import React, { useMemo, useState } from 'react';
import { SearchHistoryItem, InstagramPost } from '../types';
import { UserCircle, BarChart3, ArrowRight, TrendingUp, Users, Check, X } from 'lucide-react';
import { backend } from '../services/backend';

interface CreatorHistoryViewProps {
  history: SearchHistoryItem[];
  onSelectCreator: (jobId: string) => void;
}

export const CreatorHistoryView: React.FC<CreatorHistoryViewProps> = ({ history, onSelectCreator }) => {
  const [showCompare, setShowCompare] = useState(false);
  const [selectedId1, setSelectedId1] = useState<string>('');
  const [selectedId2, setSelectedId2] = useState<string>('');
  const [compareData, setCompareData] = useState<{stats1: any, stats2: any, name1: string, name2: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const analyticsHistory = useMemo(() => {
    return history.filter(h => h.type === 'analytics' && h.status === 'completed');
  }, [history]);

  const handleCompare = async () => {
    if (!selectedId1 || !selectedId2) return;
    setLoading(true);
    try {
      const res1 = await backend.checkJobStatus(selectedId1);
      const res2 = await backend.checkJobStatus(selectedId2);
      
      const h1 = analyticsHistory.find(h => h.id === selectedId1);
      const h2 = analyticsHistory.find(h => h.id === selectedId2);
      
      const stats1 = calculateStats(res1.data || [], h1);
      const stats2 = calculateStats(res2.data || [], h2);
      
      const name1 = h1?.seedUsername || 'Creator A';
      const name2 = h2?.seedUsername || 'Creator B';
      
      setCompareData({ stats1, stats2, name1, name2 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (posts: InstagramPost[], historyItem?: SearchHistoryItem) => {
    if (!posts.length) return { followers: historyItem?.followerCount || 0, avgViews: 0, cpv: 0, cpe: 0 };
    
    const totalViews = posts.reduce((acc, p) => acc + (p.videoPlayCount || p.videoViewCount || 0), 0);
    const totalEng = posts.reduce((acc, p) => acc + p.likesCount + p.commentsCount, 0);
    const avgViews = Math.round(totalViews / posts.length);
    const avgEng = Math.round(totalEng / posts.length);
    
    const COST = 500; // Baseline
    const cpv = avgViews > 0 ? COST / avgViews : 0;
    const cpe = avgEng > 0 ? COST / avgEng : 0;
    
    return { followers: historyItem?.followerCount || 0, avgViews, cpv, cpe };
  };

  if (analyticsHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <UserCircle size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No creator history</h3>
        <p className="text-sm">Run an Advanced Insight analysis to see creators here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Creator History</h2>
          <p className="text-slate-500 text-sm">Recently analyzed creators and their performance.</p>
        </div>
        <button 
          onClick={() => setShowCompare(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <BarChart3 size={18} />
          COMPARE
        </button>
      </div>

      {showCompare && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Compare Creators</h3>
            <button onClick={() => { setShowCompare(false); setCompareData(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <select 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedId1}
              onChange={(e) => setSelectedId1(e.target.value)}
            >
              <option value="">Select Creator 1</option>
              {analyticsHistory.map(h => (
                <option key={h.id} value={h.id}>@{h.seedUsername}</option>
              ))}
            </select>
            <select 
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedId2}
              onChange={(e) => setSelectedId2(e.target.value)}
            >
              <option value="">Select Creator 2</option>
              {analyticsHistory.length === 1 ? (
                 <option value={analyticsHistory[0].id}>@{analyticsHistory[0].seedUsername} (Self)</option>
              ) : (
                analyticsHistory.map(h => (
                  <option key={h.id} value={h.id}>@{h.seedUsername}</option>
                ))
              )}
            </select>
          </div>

          {!compareData ? (
            <button 
              onClick={handleCompare}
              disabled={!selectedId1 || !selectedId2 || loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:bg-slate-300"
            >
              {loading ? 'Analyzing...' : 'Run Comparison'}
            </button>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    <th className="px-4 py-3 text-left">Metric</th>
                    <th className="px-4 py-3 text-center text-indigo-600">@{compareData.name1}</th>
                    <th className="px-4 py-3 text-center text-indigo-600">@{compareData.name2}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <ComparisonRow label="Followers" val1={compareData.stats1.followers} val2={compareData.stats2.followers} format={(v: number) => v > 0 ? v.toLocaleString() : 'N/A'} />
                  <ComparisonRow label="Avg Views" val1={compareData.stats1.avgViews} val2={compareData.stats2.avgViews} format={(v: number) => v.toLocaleString()} />
                  <ComparisonRow label="Cost Per View" val1={compareData.stats1.cpv} val2={compareData.stats2.cpv} format={(v: number) => '$' + v.toFixed(3)} inverse />
                  <ComparisonRow label="Cost Per Eng." val1={compareData.stats1.cpe} val2={compareData.stats2.cpe} format={(v: number) => '$' + v.toFixed(2)} inverse />
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <th className="px-6 py-4">Creator</th>
              <th className="px-6 py-4">Followers</th>
              <th className="px-6 py-4">Avg Views</th>
              <th className="px-6 py-4">Date Analyzed</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analyticsHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {item.seedUsername[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">@{item.seedUsername}</div>
                      <div className="text-xs text-slate-500">{item.resultsCount} Posts Analyzed</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-indigo-500" />
                    <span className="font-mono font-medium text-slate-700">
                      {item.followerCount ? item.followerCount.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="font-mono font-medium text-slate-700">Calculated</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelectCreator(item.id)}
                    className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 p-2 rounded-lg transition-all inline-flex items-center gap-2 font-medium text-xs"
                  >
                    View Insights
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ComparisonRow = ({ label, val1, val2, format, inverse }: any) => {
  const isBetter1 = inverse ? val1 < val2 : val1 > val2;
  const isBetter2 = inverse ? val2 < val1 : val2 > val1;
  
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-slate-600">{label}</td>
      <td className={`px-4 py-3 text-center font-bold ${isBetter1 ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-400'}`}>
        {format(val1)}
        {isBetter1 && <Check size={12} className="inline ml-1" />}
      </td>
      <td className={`px-4 py-3 text-center font-bold ${isBetter2 ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-400'}`}>
        {format(val2)}
        {isBetter2 && <Check size={12} className="inline ml-1" />}
      </td>
    </tr>
  );
};
